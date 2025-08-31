import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { z } from "zod";
import { verifySignature, processWebhook } from "../../../../../lib/midtrans";

const WebhookSchema = z.object({
  order_id: z.string(),
  status_code: z.string(),
  gross_amount: z.string(),
  signature_key: z.string(),
  transaction_status: z.string(),
});

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = WebhookSchema.parse(req.body);
  const valid = verifySignature(
    body.order_id,
    body.status_code,
    body.gross_amount,
    body.signature_key
  );
  if (!valid) {
    res.status(400).json({ message: "Invalid signature" });
    return;
  }
  const status = processWebhook(body);
  res.json({ status });
}
