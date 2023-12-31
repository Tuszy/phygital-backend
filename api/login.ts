// Vercel
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Validation
import { z } from "zod";
import {
  zodAddressValidator,
  zodSignatureValidator,
  zodHashValidator,
} from "../util/input-validation";

// Helper
import { UniversalProfile } from "../util/UniversalProfile";

const Schema = z.object({
  universal_profile_address: zodAddressValidator(),
  signature: zodSignatureValidator(),
  hash: zodHashValidator(),
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
    const universalProfile = new UniversalProfile(
      data.universal_profile_address
    );
    await universalProfile.init();

    const token = await universalProfile.login(data.hash, data.signature);

    response.setHeader("Content-Type", "application/json");
    response.status(200);
    response.json({ token });
  } catch (e: any) {
    response.setHeader("Content-Type", "application/json");
    response.status(400);
    response.json({ error: e?.errors ?? e?.message ?? e });
  }
}
