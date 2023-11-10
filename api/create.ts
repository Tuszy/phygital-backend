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
  name: z.string(),
  symbol: z.string(),
  phygital_collection: zodPhygitalCollectionValidator(),
  metadata: zodLSP4MetadataJSONURLAsyncValidator(),
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

    const tx = await createNewPhygitalAsset(
      universalProfile,
      data.name,
      data.symbol,
      data.phygital_collection,
      data.metadata
    );
    if (!tx) throw new Error("Deployment failed");

    const deploymentTx = tx.deploymentTransaction();
    if (!deploymentTx?.hash) throw new Error("Deployment failed");

    response.setHeader("Content-Type", "application/json");
    response.status(200);
    response.json({
      transactionHash: deploymentTx!.hash,
    });
  } catch (e: any) {
    response.setHeader("Content-Type", "application/json");
    response.status(400);
    response.json({ error: e?.errors ?? e?.message ?? e });
  }
}
