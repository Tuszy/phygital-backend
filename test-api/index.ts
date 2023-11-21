// Vercel
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Express Server
import express, { Request, Response } from "express";

// Cors
import cors from "cors";

// Endpoints
import login from "../api/login";
import mint from "../api/mint";
import verifyOwnerShipAfterTransfer from "../api/verify-ownership-after-transfer";
import create from "../api/create";
import transfer from "../api/transfer";

// Setup
const app = express();
app.use(cors());
app.use(express.json());

const router = express.Router();

const wrapHandler =
  (handler: (request: VercelRequest, response: VercelResponse) => void) =>
  (req: Request, res: Response) =>
    handler(req as any, res as any);

router.post("/login", wrapHandler(login));

router.post("/mint", wrapHandler(mint));

router.post("/transfer", wrapHandler(transfer));

router.post(
  "/verify-ownership-after-transfer",
  wrapHandler(verifyOwnerShipAfterTransfer)
);

router.post("/create", wrapHandler(create));

app.use("/api", router);

const PORT = 8888;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
