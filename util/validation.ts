// Crypto
import { isAddress } from "ethers";

export function throwIfAddressIsNotALSP6KeyManager(address: string) {
  if (!isAddress(address)) throw Error("Invalid address");
}
