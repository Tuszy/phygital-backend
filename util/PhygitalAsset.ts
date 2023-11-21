// Crypto
import {
  AddressLike,
  BytesLike,
  Contract,
  SignatureLike,
  recoverAddress,
  solidityPackedKeccak256,
  AbiCoder,
  getBytes,
  keccak256,
  concat,
  toUtf8Bytes,
} from "ethers";

// Types
import { LSP4MetadataType } from "./LSP4Metadata";

// Universal Profile
import { UniversalProfile } from "./UniversalProfile";

// Interfaces
import { PhygitalAssetInterface } from "./Interfaces";

// Contract Factory
import { PhygitalAssetContractFactory } from "./contract-factories";

// Validation
import { throwIfAddressIsNotAPhygitalAsset } from "./contract-validation";

// LSP Smart Contracts
import { ErrorSelectors } from "@lukso/lsp-smart-contracts";

// Helper
import {
  decodeLSP2JSONURL,
  uploadJSONToIPFSAndGetLSP2JSONURL,
} from "./ipfs-client";
import { controllerWallet } from "./wallet";

// Merkle Tree
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { KECCAK_256_HASH_FUNCTION } from "./crypto";

// Constants
export const INTERFACE_ID_OF_PHYGITAL_ASSET = "0xae8205e1";
export const PHYGITAL_ASSET_COLLECTION_URI_KEY =
  "0x4eff76d745d12fd5e5f7b38e8f396dd0d099124739e69a289ca1faa7ebc53768";
export const ERRORS: Record<string, string> = {
  "0xe73552b6": "PhygitalAssetOwnershipVerificationFailed",
  "0x461e0d36": "PhygitalAssetIsNotPartOfCollection",
  "0x906fb8a7": "PhygitalAssetHasAnUnverifiedOwnership",
  "0x56d5acaf": "PhygitalAssetHasAlreadyAVerifiedOwnership",
  ...Object.keys(ErrorSelectors.LSP8IdentifiableDigitalAsset).reduce(
    (total, error) => ({
      ...total,
      // @ts-ignore
      [error]: ErrorSelectors.LSP8IdentifiableDigitalAsset[error].name,
    }),
    {}
  ),
  ...Object.keys(ErrorSelectors.LSP8CompatibleERC721Mintable).reduce(
    (total, error) => ({
      ...total,
      // @ts-ignore
      [error]: ErrorSelectors.LSP8CompatibleERC721Mintable[error].name,
    }),
    {}
  ),
};

export const throwFormattedError = (e: any, fallback: string) => {
  if ("data" in e && typeof e.data === "string" && e.data.length >= 10) {
    const error = e.data.substring(0, 10) as string;
    const errorMessage = ERRORS[error] ?? null;
    if (errorMessage) throw new Error(errorMessage);
  }

  throw new Error(fallback + " - " + e);
};
export class PhygitalAsset {
  private phygitalAssetContract: Contract;
  constructor(
    private phygitalAssetContractAddress: string,
    private universalProfile: UniversalProfile
  ) {
    this.phygitalAssetContract = new Contract(
      this.phygitalAssetContractAddress,
      PhygitalAssetInterface,
      controllerWallet
    );
  }

  public async validate() {
    await throwIfAddressIsNotAPhygitalAsset(this.phygitalAssetContractAddress);
  }

  private async getPhygitalCollectionOrThrow() {
    const jsonURL = await this.phygitalAssetContract.getData(
      PHYGITAL_ASSET_COLLECTION_URI_KEY
    );
    const phygitalCollection = ((await decodeLSP2JSONURL(jsonURL)) ??
      []) as string[];

    if (phygitalCollection.length === 0)
      throw Error(
        "PhygitalAsset has an invalid collection (list of phygital addresses)"
      );

    return phygitalCollection;
  }

  private async getMerkleProofOfForPhygitalAddressOrThrow(
    phygitalAddress: string,
    phygitalCollection: string[]
  ) {
    if (!phygitalAddress) throw Error(`PhygitalAssetIsNotPartOfCollection`);

    const merkleTree = StandardMerkleTree.of(
      phygitalCollection.map((phygitalAddress) => [phygitalAddress]),
      ["address"]
    );

    let phygitalIndex = -1;
    for (const [index, data] of merkleTree.entries()) {
      if (data[0] === phygitalAddress) {
        phygitalIndex = index;
        break;
      }
    }
    if (phygitalIndex === -1) throw Error(`PhygitalAssetIsNotPartOfCollection`);

    const merkleProof = merkleTree.getProof(phygitalIndex);

    if (phygitalCollection.length > 1 && merkleProof.length === 0)
      throw Error(
        `Failed to calculate merkle proof for phygital address ${phygitalAddress}`
      );

    return merkleProof;
  }

  public async mint(
    phygitalAddress: AddressLike,
    phygitalSignature: BytesLike
  ) {
    const phygitalCollection = await this.getPhygitalCollectionOrThrow();

    const merkleProofOfCollection =
      await this.getMerkleProofOfForPhygitalAddressOrThrow(
        phygitalAddress as string,
        phygitalCollection
      );

    try {
      const tx = await this.universalProfile.executeCallThroughKeyManager(
        PhygitalAssetInterface,
        this.phygitalAssetContractAddress,
        "mint",
        phygitalAddress,
        phygitalSignature,
        merkleProofOfCollection,
        false
      );

      return await controllerWallet.provider?.waitForTransaction(tx.hash);
    } catch (e: any) {
      throwFormattedError(e, "Minting failed.");
    }
  }

  public async verifyOwnershipAfterTransfer(
    phygitalAddress: AddressLike,
    phygitalSignature: BytesLike
  ) {
    try {
      const tx = await this.universalProfile.executeCallThroughKeyManager(
        PhygitalAssetInterface,
        this.phygitalAssetContractAddress,
        "verifyOwnershipAfterTransfer",
        phygitalAddress,
        phygitalSignature
      );

      return await controllerWallet.provider?.waitForTransaction(tx.hash);
    } catch (e: any) {
      throwFormattedError(e, "Verification failed.");
    }
  }

  public async transfer(
    newPhygitalOwner: AddressLike,
    phygitalAddress: AddressLike,
    phygitalSignature: SignatureLike
  ) {
    const phygitalId = keccak256(
      getBytes(
        AbiCoder.defaultAbiCoder().encode(["address"], [phygitalAddress])
      )
    );
    const nonce = await this.phygitalAssetContract.nonce(phygitalId);
    if (
      recoverAddress(
        solidityPackedKeccak256(
          ["address", "uint256"],
          [newPhygitalOwner, nonce]
        ),
        phygitalSignature
      ) !== phygitalAddress
    )
      throw "PhygitalAssetOwnershipVerificationFailed";
    try {
      const tx = await this.universalProfile.executeCallThroughKeyManager(
        PhygitalAssetInterface,
        this.phygitalAssetContractAddress,
        "transfer",
        this.universalProfile.address,
        newPhygitalOwner,
        phygitalId,
        false,
        "0x"
      );

      return await controllerWallet.provider?.waitForTransaction(tx.hash);
    } catch (e: any) {
      throwFormattedError(e, "Transfer failed.");
    }
  }
}

export const createNewPhygitalAsset = async (
  universalProfile: UniversalProfile,
  name: string,
  symbol: string,
  phygitalCollection: string[],
  metadata: string | LSP4MetadataType,
  baseURI: string
) => {
  const merkleTree = StandardMerkleTree.of(
    phygitalCollection.map((phygitalAddress) => [phygitalAddress]),
    ["address"]
  );
  const merkleRoot = merkleTree.root;
  const phygitalCollectionJSONURL = await uploadJSONToIPFSAndGetLSP2JSONURL(
    `PhygitalAsset:Collection:${name}:${symbol}:${universalProfile.address}`,
    phygitalCollection
  );
  const metadataJSONURL =
    typeof metadata === "string"
      ? metadata
      : await uploadJSONToIPFSAndGetLSP2JSONURL(
          `PhygitalAsset:LSP4Metadata:${name}:${symbol}:${universalProfile.address}`,
          metadata
        );

  try {
    const deploymentTx = await PhygitalAssetContractFactory.deploy(
      merkleRoot,
      phygitalCollectionJSONURL,
      name,
      symbol,
      metadataJSONURL,
      concat([KECCAK_256_HASH_FUNCTION, toUtf8Bytes(baseURI)]),
      universalProfile.address
    );

    const phygitalAssetContractAddress = (
      await deploymentTx.waitForDeployment()
    ).target.toString();

    if (
      !(await universalProfile.addIssuedAsset(phygitalAssetContractAddress))
    ) {
      throw new Error("Failed to add LSP12IssuedAsset to universal profile");
    }

    return phygitalAssetContractAddress;
  } catch (e: any) {
    throwFormattedError(e, "Creation failed.");
  }
};
