// Vercel
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Validation
import { z } from "zod";
import {
  zodAddressValidator,
  zodSignatureValidator,
} from "../util/input-validation";

// Helper
import { UniversalProfile } from "../util/UniversalProfile";
import { PhygitalAsset } from "../util/PhygitalAsset";
import { getUniversalProfileFromAuthSession } from "../util/auth";

const Schema = z.object({
  phygital_asset_contract_address: zodAddressValidator(),
  phygital_address: zodAddressValidator(),
  phygital_signature: zodSignatureValidator(),
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
    const data = Schema.parse(request.body);

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

    const phygitalAsset = new PhygitalAsset(
      data.phygital_asset_contract_address,
      universalProfile
    );

    await phygitalAsset.validate();

    const receipt = await phygitalAsset.verifyOwnershipAfterTransfer(
      data.phygital_address,
      data.phygital_signature
    );

    if (receipt == null)
      throw new Error("Waiting for transaction to complete failed");

    response.setHeader("Content-Type", "application/json");
    response.status(200);
    response.json(receipt);
  } catch (e: any) {
    response.setHeader("Content-Type", "application/json");
    response.status(400);
    response.json({ error: e?.errors ?? e?.message ?? e });
  }
}
