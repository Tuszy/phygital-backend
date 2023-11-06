// Crypto
import { Interface } from "ethers";

// ABI
import { abi as LSP0ERC725AccountABI } from "@lukso/lsp-smart-contracts/artifacts/LSP0ERC725Account.json";
import { abi as LSP6KeyManagerABI } from "@lukso/lsp-smart-contracts/artifacts/LSP6KeyManager.json";
import { abi as PhygitalAssetABI } from "../artifact/PhygitalAsset.json";

export const LSP0ERC725AccountABIInterface = new Interface(
  LSP0ERC725AccountABI
);
export const LSP6KeyManagerInterface = new Interface(LSP6KeyManagerABI);
export const PhygitalAssetInterface = new Interface(PhygitalAssetABI);
