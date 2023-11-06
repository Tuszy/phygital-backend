import { JsonRpcProvider, Wallet } from "ethers";

// Provider
export const provider: JsonRpcProvider = new JsonRpcProvider(
  `${process.env.RPC_URL}?apiKey=${process.env.RPC_URL_API_KEY}`,
  {
    chainId: parseInt(process.env.CHAIN_ID as string),
  }
);

// Wallet
export const controllerWallet: Wallet = new Wallet(
  process.env.PRIVATE_KEY as string,
  provider
);
