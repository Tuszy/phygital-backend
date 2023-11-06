// Crypto
import { AddressLike, BytesLike, BigNumberish } from "ethers";

// Universal Profile
import { UniversalProfile } from "./UniversalProfile";

// Interfaces
import { PhygitalAssetInterface } from "./Interfaces";

export class PhygitalAsset {
  constructor(
    private phygitalAssetContractAddress: string,
    private universalProfile: UniversalProfile
  ) {}

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
