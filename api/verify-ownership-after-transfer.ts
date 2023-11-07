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
import { PhygitalAsset } from "../util/PhygitalAsset";

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

    const phygitalAsset = new PhygitalAsset(
      data.phygital_asset_contract_address,
      universalProfile
    );

    await phygitalAsset.validate();

    await phygitalAsset.verifyOwnershipAfterTransfer(
      data.phygital_id,
      data.phygital_signature
    );

    response.setHeader("content-type", "application/json");
    response.status(200);
    response.json({
      message: "Successfully verified phygital from collection",
      ...data,
    });
  } catch (e: any) {
    response.status(400);
    response.json(e?.message ?? e);
  }
}
