// Vercel
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Validation
import { z } from "zod";
import { zodAddressValidator } from "../util/input-validation";

// Helper
import { UniversalProfile } from "../util/UniversalProfile";

const Schema = z.object({
  universal_profile_address: zodAddressValidator(),
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
    universalProfile.verifyAuthenticationToken(
      request.headers.authorization?.split(" ")[1]
    );

    response.setHeader("Content-Type", "application/json");
    response.status(200);
    response.json({ message: "success" });
  } catch (e: any) {
    response.setHeader("Content-Type", "application/json");
    response.status(400);
    response.json({ error: e?.errors ?? e?.message ?? e });
  }
}
