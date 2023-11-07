// Crypto
import { isAddress } from "ethers";

// Validation
import { z } from "zod";

export const zodAddressValidator = () =>
  z
    .string()
    .startsWith("0x")
    .length(42) // 0x + 20bytes in hex
    .refine(isAddress, {
      message: `Invalid address`,
    });

export const zodPhygitalIdValidator = () =>
  z.string().startsWith("0x").length(66); // 0x + 32bytes in hex

export const zodPhygitalCollectionValidator = () =>
  z.array(zodPhygitalIdValidator()).min(1); // list of phygital ids

export const zodPhygitalSignatureValidator = () =>
  z.string().startsWith("0x").length(132); // 0x + 65bytes in hex
