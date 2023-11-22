// Load environment variables
import "dotenv/config";

// Crypto
import { JsonRpcProvider, Wallet } from "ethers";

// Chain
export const CHAIN_ID = parseInt(process.env.CHAIN_ID as string);

// Provider
export const provider: JsonRpcProvider = new JsonRpcProvider(
  `${process.env.RPC_URL}?apiKey=${process.env.RPC_URL_API_KEY}`,
  {
    name: "Lukso",
    chainId: CHAIN_ID,
  }
);

// Wallet
export const CONTROLLER_PUBLIC_KEY = process.env.PUBLIC_KEY as string;
export const CONTROLLER_PRIVATE_KEY = process.env.PRIVATE_KEY as string;
export const controllerWallet: Wallet = new Wallet(
  CONTROLLER_PRIVATE_KEY,
  provider
);
