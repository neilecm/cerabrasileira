import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { z } from "zod";
import { createTransaction } from "../../../../../lib/midtrans";

const BodySchema = z.object({
  orderId: z.string(),
  grossAmount: z.number(),
});

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = BodySchema.parse(req.body);
  const data = await createTransaction(body.orderId, body.grossAmount);
  res.json({ ...data, clientKey: process.env.MIDTRANS_CLIENT_KEY });
}
