// Vercel
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Validation
import { z } from "zod";
import {
  zodLSP4MetadataJSONURLAsyncValidator,
  zodPhygitalCollectionValidator,
} from "../util/input-validation";

// Helper
import { UniversalProfile } from "../util/UniversalProfile";
import { createNewPhygitalAsset } from "../util/PhygitalAsset";
import { getUniversalProfileFromAuthSession } from "../util/auth";

const Schema = z.object({
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
  if (request.method === "OPTIONS") {
    response.status(200).end();
    return;
  } else if (request.method !== "POST") {
    response.status(405).end();
    return;
  }

  try {
    const data = await Schema.parseAsync(request.body);

    let universalProfile: null | UniversalProfile = null;
    try {
      const token = request.headers.authorization?.split(" ")[1];
      universalProfile = await getUniversalProfileFromAuthSession(token);
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
