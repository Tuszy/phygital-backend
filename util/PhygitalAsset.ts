// Crypto
import {
  AddressLike,
  BytesLike,
  Contract,
  SignatureLike,
  recoverAddress,
  solidityPackedKeccak256,
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
import { keccak256 } from "./crypto";

// Merkle Tree
import { MerkleTree } from "merkletreejs";

// Constants
export const INTERFACE_ID_OF_PHYGITAL_ASSET = "0xcf06c304";
export const PHYGITAL_ASSET_COLLECTION_URI_KEY =
  "0x4eff76d745d12fd5e5f7b38e8f396dd0d099124739e69a289ca1faa7ebc53768";
export const ERRORS: Record<string, string> = {
  "0xe73552b6": "PhygitalAssetOwnershipVerificationFailed",
  "0xf7964284": "PhygitalAssetIsNotPartOfCollection",
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

  console.log(e);
  console.log(ERRORS);

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
        "PhygitalAsset has an invalid collection (list of phygital ids)"
      );

    return phygitalCollection;
  }

  private async getPhygitalIndexOrThrow(
    phygitalId: string,
    phygitalCollection: string[]
  ) {
    const phygitalIndex = phygitalCollection.indexOf(phygitalId);
    if (phygitalIndex === -1)
      throw Error("Phygital id is not part of the collection");

    return phygitalIndex;
  }

  private async getMerkleProofOfForPhygitalIdOrThrow(
    phygitalId: string,
    phygitalCollection: string[]
  ) {
    const merkleTree = new MerkleTree(phygitalCollection, keccak256("bytes"));
    const merkleProof = merkleTree
      .getProof(phygitalId)
      .map((node) => node.data);

    if (merkleProof.length === 0)
      throw Error(
        `Failed to calculate merkle proof for phygital id ${phygitalId}`
      );

    return merkleProof;
  }

  public async mint(phygitalId: BytesLike, phygitalSignature: BytesLike) {
    const phygitalCollection = await this.getPhygitalCollectionOrThrow();
    const phygitalIndex = await this.getPhygitalIndexOrThrow(
      phygitalId as string,
      phygitalCollection
    );

    const merkleProofOfCollection =
      await this.getMerkleProofOfForPhygitalIdOrThrow(
        phygitalId as string,
        phygitalCollection
      );

    try {
      return await this.universalProfile.executeCallThroughKeyManager(
        PhygitalAssetInterface,
        this.phygitalAssetContractAddress,
        "mint",
        phygitalId,
        phygitalIndex,
        phygitalSignature,
        merkleProofOfCollection,
        false
      );
    } catch (e: any) {
      throwFormattedError(e, "Minting failed.");
    }
  }

  public async verifyOwnershipAfterTransfer(
    phygitalId: BytesLike,
    phygitalSignature: BytesLike
  ) {
    try {
      return await this.universalProfile.executeCallThroughKeyManager(
        PhygitalAssetInterface,
        this.phygitalAssetContractAddress,
        "verifyOwnershipAfterTransfer",
        phygitalId,
        phygitalSignature
      );
    } catch (e: any) {
      throwFormattedError(e, "Verification failed.");
    }
  }

  public async transfer(
    newPhygitalOwner: AddressLike,
    phygitalId: BytesLike,
    phygitalSignature: SignatureLike
  ) {
    const nonce = await this.phygitalAssetContract.nonce(phygitalId);
    if (
      keccak256("address")(
        recoverAddress(
          solidityPackedKeccak256(
            ["address", "uint256"],
            [newPhygitalOwner, nonce]
          ),
          phygitalSignature
        )
      ) !== phygitalId
    )
      throw "PhygitalAssetOwnershipVerificationFailed";
    try {
      return await this.universalProfile.executeCallThroughKeyManager(
        PhygitalAssetInterface,
        this.phygitalAssetContractAddress,
        "transfer",
        this.universalProfile.address,
        newPhygitalOwner,
        phygitalId,
        false,
        "0x"
      );
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
  metadata: string | LSP4MetadataType
) => {
  const merkleTree = new MerkleTree(phygitalCollection, keccak256("bytes"));
  const merkleRoot = merkleTree.getHexRoot();
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
      universalProfile.address
    );

    return deploymentTx;
  } catch (e: any) {
    throwFormattedError(e, "Creation failed.");
  }
};
