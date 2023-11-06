// Crypto
import { solidityPackedKeccak256 } from "ethers";

export const KECCAK_256_HASH_FUNCTION = "0x6f357c6a";
export const keccak256 = (type: string) => (data: any) =>
  solidityPackedKeccak256([type], [data]);
