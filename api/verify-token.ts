// Vercel
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Helper
import { getUniversalProfileFromAuthSession } from "../util/auth";

export default async function (
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method === "OPTIONS") {
    response.status(200).end();
    return;
  } else if (request.method !== "GET") {
    response.status(405).end();
    return;
  }

  try {
    try {
      const token = request.headers.authorization?.split(" ")[1];
      await getUniversalProfileFromAuthSession(token);
    } catch (e) {
      response.setHeader("Content-Type", "application/json");
      response.status(401);
      response.json({
        error: "Authentication session expired",
      });
      return;
    }

    response.setHeader("Content-Type", "application/json");
    response.status(200);
    response.json({ message: "success" });
  } catch (e: any) {
    response.setHeader("Content-Type", "application/json");
    response.status(400);
    response.json({ error: e?.errors ?? e?.message ?? e });
  }
}
