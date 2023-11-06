// Crypto
import { AddressLike, BytesLike, BigNumberish } from "ethers";

// Universal Profile
import { UniversalProfile } from "./UniversalProfile";

// Interfaces
import { PhygitalAssetInterface } from "./Interfaces";

// Validation
import { throwIfAddressIsNotAPhygitalAsset } from "./validation";

export const interfaceIdOfPhygitalAsset = "0x5f5b600b";

export class PhygitalAsset {
  constructor(
    private phygitalAssetContractAddress: string,
    private universalProfile: UniversalProfile
  ) {
    throwIfAddressIsNotAPhygitalAsset(phygitalAssetContractAddress);
  }

  public async mint(
    phygitalId: BytesLike,
    phygitalIndex: BigNumberish,
    phygitalSignature: BytesLike,
    merkleProofOfCollection: BytesLike[]
  ) {
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
