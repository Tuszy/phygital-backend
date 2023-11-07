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

const QuerySchema = z.object({
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
    const query = QuerySchema.parse(request.query);
    const universalProfile = new UniversalProfile(
      query.universal_profile_address
    );
    await universalProfile.validate();

    const phygitalAsset = new PhygitalAsset(
      query.phygital_asset_contract_address,
      universalProfile
    );

    await phygitalAsset.validate();

    await phygitalAsset.verifyOwnershipAfterTransfer(
      query.phygital_id,
      query.phygital_signature
    );

    response.status(200);
    response.json({
      message: "Successfully verified phygital from collection",
      ...query,
    });
  } catch (e: any) {
    response.status(400);
    response.json(e?.message ?? e);
  }
}
