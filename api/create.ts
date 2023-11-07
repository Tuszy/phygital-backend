// Vercel
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Validation
import { z } from "zod";
import {
  zodAddressValidator,
  zodPhygitalIdValidator,
  zodPhygitalSignatureValidator,
} from "../util/input-validation";

// Helper
import { UniversalProfile } from "../util/UniversalProfile";
import { createNewPhygitalAsset } from "../util/PhygitalAsset";

const Schema = z.object({
  universal_profile_address: zodAddressValidator(),
  phygital_asset_contract_address: zodAddressValidator(),
  phygital_id: zodPhygitalIdValidator(),
  phygital_signature: zodPhygitalSignatureValidator(),
});

export default async function (
  request: VercelRequest,
  response: VercelResponse
) {
  try {
    const data = Schema.parse(request.body);
    const universalProfile = new UniversalProfile(
      data.universal_profile_address
    );
    await universalProfile.validate();

    await createNewPhygitalAsset(
      universalProfile,
      data.name,
      data.symbol,
      data.phygital_collection
    );

    response.status(200);
    response.json({
      message: "Successfully created phygital",
      ...data,
    });
  } catch (e: any) {
    response.status(400);
    response.json(e?.message ?? e);
  }
}
