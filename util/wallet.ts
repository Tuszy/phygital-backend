import {
  JsonRpcProvider,
  Wallet,
  Contract,
  Interface,
  AddressLike,
} from "ethers";

// ABI
import { abi as PhygitalAssetABI } from "../artifact/PhygitalAsset.json";
import { abi as LSP0ERC725AccountABI } from "@lukso/lsp-smart-contracts/artifacts/LSP0ERC725Account.json";
import { abi as LSP6KeyManagerABI } from "@lukso/lsp-smart-contracts/artifacts/LSP6KeyManager.json";

// Provider
const provider: JsonRpcProvider = new JsonRpcProvider(
  `${process.env.RPC_URL}?apiKey=${process.env.RPC_URL_API_KEY}`,
  {
    chainId: parseInt(process.env.CHAIN_ID as string),
  }
);

// Wallet
const wallet: Wallet = new Wallet(process.env.PRIVATE_KEY as string, provider);

// Interfaces
const phygitalAssetInterface: Interface = new Interface(PhygitalAssetABI);
const LSP0ERC725AccountABIInterface = new Interface(LSP0ERC725AccountABI);
const LSP6KeyManagerInterface = new Interface(LSP6KeyManagerABI);

export const executeCallThroughKeyManager = async (
  universalProfileAddress: string,
  contractInterface: Interface,
  contractAddress: AddressLike,
  functionName: string,
  ...params: any[]
) => {
  const LSP0ERC725Account = new Contract(
    universalProfileAddress,
    LSP0ERC725AccountABIInterface,
    wallet
  );

  const lsp6KeyManagerAddress = (await LSP0ERC725Account.owner()) as string;

  const LSP6KeyManager = new Contract(
    lsp6KeyManagerAddress,
    LSP6KeyManagerInterface,
    wallet
  );

  const encodedInterfaceCall = contractInterface.encodeFunctionData(
    functionName,
    params
  );
  const encodedExecuteCall = LSP0ERC725AccountABIInterface.encodeFunctionData(
    "execute",
    [0, contractAddress, 0, encodedInterfaceCall]
  );
  const tx = await LSP6KeyManager.execute(encodedExecuteCall);
  await tx.wait();
  return tx;
};
