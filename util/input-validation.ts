// Crypto
import { isAddress } from "ethers";

// Validation
import { z } from "zod";
import { decodeLSP2JSONURL } from "./ipfs-client";
import { LSP4Metadata } from "./LSP4Metadata";

export const zodAddressValidator = () =>
  z
    .string()
    .startsWith("0x")
    .length(42) // 0x + 20bytes in hex
    .refine(isAddress, {
      message: `Invalid address`,
    });

export const zodPhygitalCollectionValidator = () =>
  z.array(zodAddressValidator()).min(1); // list of phygital addresses

export const zodPhygitalSignatureValidator = () =>
  z.string().startsWith("0x").length(132); // 0x + 65bytes in hex

export const zodBytes32Validator = () => z.string().startsWith("0x").length(66); // 0x + 32bytes in hex

export const zodLSP4MetadataJSONURLAsyncValidator = () =>
  z
    .string()
    .startsWith("0x")
    .superRefine(async (jsonUrl, ctx) => {
      console.log(jsonUrl);
      const metadata = await decodeLSP2JSONURL(jsonUrl);

      if (metadata === null) {
        ctx.addIssue({
          code: "custom",
          message: "Invalid JSONURL",
        });
        return false;
      }

      console.log(metadata);
      const result = LSP4Metadata.safeParse(metadata);
      console.log(result);
      if (!result.success) {
        result.error.errors.forEach((err) => ctx.addIssue(err));
        return false;
      }

      return true;
    });
