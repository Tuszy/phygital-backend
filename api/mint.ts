// Vercel
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Crypto
import { isAddress } from "ethers";

// Validation
import { z } from "zod";

// Helper
import { UniversalProfile } from "../util/UniversalProfile";
import { PhygitalAsset } from "../util/PhygitalAsset.1";

const QuerySchema = z.object({
  universal_profile_address: z
    .string()
    .startsWith("0x")
    .length(42) // 0x + 20bytes in hex
    .refine(isAddress, {
      message: "Universal Profile Address is invalid",
    }),
  phygital_asset_contract_address: z
    .string()
    .startsWith("0x")
    .length(42) // 0x + 20bytes in hex
    .refine(isAddress, {
      message: "PhygitalAsset Contract Address is invalid",
    }),
  phygital_id: z.string().startsWith("0x").length(66), // 0x + 32bytes in hex
  phygital_signature: z.string().startsWith("0x").length(132), // 0x + 65bytes in hex
});

type Query = z.infer<typeof QuerySchema>;

export default async function (
  request: VercelRequest,
  response: VercelResponse
) {
  try {
    const query: Query = QuerySchema.parse(request.query);
    const universalProfile = new UniversalProfile(
      query.universal_profile_address
    );
    const phygitalAsset = new PhygitalAsset(
      query.phygital_asset_contract_address,
      universalProfile
    );

    await phygitalAsset.mint(query.phygital_id, query.phygital_signature);

    response.status(200);
    response.json({
      message: "Successfully minted phygital from collection",
      ...query,
    });
  } catch (e) {
    response.status(400);
    response.json(e);
  }
}
