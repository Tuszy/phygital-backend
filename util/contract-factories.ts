// Crypto
import { ContractFactory } from "ethers";

// Interfaces
import { PhygitalAssetInterface } from "./Interfaces";

// Bytes Codes
import { bytecode as PhygitalAssetByteCode } from "../artifact/PhygitalAsset.json";

// Wallet
import { controllerWallet } from "./wallet";

export const PhygitalAssetContractFactory = new ContractFactory(
  PhygitalAssetInterface,
  PhygitalAssetByteCode,
  controllerWallet
);
