// Crypto
import { AddressLike, BytesLike, Contract } from "ethers";

// Universal Profile
import { UniversalProfile } from "./UniversalProfile";

// Constants
import { PhygitalAssetInterface } from "./Interfaces";

// Constants
export const interfaceIdOfPhygitalAsset = "0x5f5b600b";
export const phygitalAssetCollectionUriKey =
  "0x4eff76d745d12fd5e5f7b38e8f396dd0d099124739e69a289ca1faa7ebc53768";

// Validation
import { throwIfAddressIsNotAPhygitalAsset } from "./validation";

// Helper
import { decodeLSP2JSONURL } from "./ipfs-client";
import { controllerWallet } from "./wallet";
import { keccak256 } from "./crypto";

// Merkle Tree
import { MerkleTree } from "merkletreejs";

export class PhygitalAsset {
  private phygitalAssetContract: Contract;
  constructor(
    private phygitalAssetContractAddress: string,
    private universalProfile: UniversalProfile
  ) {
    throwIfAddressIsNotAPhygitalAsset(phygitalAssetContractAddress);
    this.phygitalAssetContract = new Contract(
      phygitalAssetContractAddress,
      PhygitalAssetInterface,
      controllerWallet
    );
  }

  private async getPhygitalCollectionOrThrow() {
    const jsonURL = await this.phygitalAssetContract.getData(
      phygitalAssetCollectionUriKey
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
    const phygitalIndex = this.getPhygitalIndexOrThrow(
      phygitalId as string,
      phygitalCollection
    );

    const merkleProofOfCollection = this.getMerkleProofOfForPhygitalIdOrThrow(
      phygitalId as string,
      phygitalCollection
    );

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
  }

  public async verifyOwnershipAfterTransfer(
    phygitalId: BytesLike,
    phygitalSignature: BytesLike
  ) {
    return await this.universalProfile.executeCallThroughKeyManager(
      PhygitalAssetInterface,
      this.phygitalAssetContractAddress,
      "verifyOwnershipAfterTransfer",
      phygitalId,
      phygitalSignature
    );
  }

  public async transfer(newPhygitalOwner: AddressLike, phygitalId: BytesLike) {
    return await this.universalProfile.executeCallThroughKeyManager(
      PhygitalAssetInterface,
      this.phygitalAssetContractAddress,
      "transfer",
      this.universalProfile.address(),
      newPhygitalOwner,
      phygitalId,
      false,
      "0x"
    );
  }
}

export type PhygitalAssetAttribute = {
  key: string;
  value: string;
  type: string;
};

export type PhygitalAssetFile = {
  width: number;
  height: number;
  verificationFunction: string;
  verificationData: string;
  url: string;
};

export type PhygitalAssetImage = {
  verificationFunction: string;
  verificationData: string;
  url: string;
  fileType: number;
};

export type PhygitalAssetLink = {
  title: string;
  url: string;
};

export type PhygitalAssetMetadata = {
  description?: string;
  links?: PhygitalAssetLink[];
  icon?: PhygitalAssetImage[];
  images?: PhygitalAssetImage[];
  assets?: PhygitalAssetFile[];
  attributes?: PhygitalAssetAttribute[];
};

export type PhygitalAssetData = {
  tokenName: string;
  tokenSymbol: string;
  metadata: PhygitalAssetMetadata;
};

export const createNewPhygitalAsset = async (
  universalProfile: UniversalProfile,
  phygitalAssetData: PhygitalAssetData
) => {};
