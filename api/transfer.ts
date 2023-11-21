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

const Schema = z.object({
  universal_profile_address: zodAddressValidator(),
  to_universal_profile_address: zodAddressValidator(),
  phygital_asset_contract_address: zodAddressValidator(),
  phygital_address: zodAddressValidator(),
  phygital_signature: zodSignatureValidator(),
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
    await universalProfile.init();
    universalProfile.verifyAuthenticationToken(
      request.headers.authorization?.split(" ")[1]
    );

    const phygitalAsset = new PhygitalAsset(
      data.phygital_asset_contract_address,
      universalProfile
    );

    await phygitalAsset.validate();

    const receipt = await phygitalAsset.transfer(
      data.to_universal_profile_address,
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
