// Vercel
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Validation
import { z } from "zod";
import {
  zodAddressValidator,
  zodLSP4MetadataJSONURLAsyncValidator,
  zodPhygitalCollectionValidator,
} from "../util/input-validation";

// Helper
import { UniversalProfile } from "../util/UniversalProfile";
import { createNewPhygitalAsset } from "../util/PhygitalAsset";

const Schema = z.object({
  universal_profile_address: zodAddressValidator(),
  name: z.string().min(1),
  symbol: z.string().min(1),
  phygital_collection: zodPhygitalCollectionValidator(),
  metadata: zodLSP4MetadataJSONURLAsyncValidator(),
  base_uri: z.string().startsWith("ipfs://"),
});

export default async function (
  request: VercelRequest,
  response: VercelResponse
) {
  try {
    const data = await Schema.parseAsync(request.body);
    const universalProfile = new UniversalProfile(
      data.universal_profile_address
    );
    await universalProfile.init();
    try {
      universalProfile.verifyAuthenticationToken(
        request.headers.authorization?.split(" ")[1]
      );
    } catch (e) {
      response.setHeader("Content-Type", "application/json");
      response.status(401);
      response.json({
        error: "Authentication session expired",
      });
      return;
    }

    const contractAddress = await createNewPhygitalAsset(
      universalProfile,
      data.name,
      data.symbol,
      data.phygital_collection,
      data.metadata,
      data.base_uri
    );
    if (!contractAddress) throw new Error("Deployment failed");

    response.setHeader("Content-Type", "application/json");
    response.status(200);
    response.json({
      contractAddress,
    });
  } catch (e: any) {
    response.setHeader("Content-Type", "application/json");
    response.status(400);
    response.json({ error: e?.errors ?? e?.message ?? e });
  }
}
