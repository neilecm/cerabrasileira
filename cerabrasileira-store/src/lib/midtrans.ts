import crypto from "crypto";

export const transactionStore = new Map<string, { token: string; redirect_url: string }>();
export const processedNotifications = new Set<string>();
export const orderStatuses = new Map<string, string>();

export function verifySignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string
): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
  const payload = orderId + statusCode + grossAmount + serverKey;
  const hash = crypto.createHash("sha512").update(payload).digest("hex");
  return hash === signatureKey;
}

export function mapTransactionStatus(transactionStatus: string): string {
  if (transactionStatus === "capture" || transactionStatus === "settlement") {
    return "paid";
  }
  if (["cancel", "deny", "expire"].includes(transactionStatus)) {
    return "failed";
  }
  return "pending";
}

export function processWebhook(body: {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
  transaction_status: string;
}) {
  const key = `${body.order_id}:${body.signature_key}`;
  if (processedNotifications.has(key)) {
    return orderStatuses.get(body.order_id) || "pending";
  }
  processedNotifications.add(key);
  const status = mapTransactionStatus(body.transaction_status);
  orderStatuses.set(body.order_id, status);
  return status;
}

export async function createTransaction(orderId: string, grossAmount: number) {
  if (transactionStore.has(orderId)) {
    return transactionStore.get(orderId)!;
  }
  const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
  const base =
    process.env.MIDTRANS_IS_PROD === "true"
      ? "https://app.midtrans.com"
      : "https://app.sandbox.midtrans.com";
  const auth = Buffer.from(serverKey + ":").toString("base64");
  const res = await fetch(`${base}/snap/v1/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
    }),
  });
  const data = await res.json();
  transactionStore.set(orderId, data);
  return data;
}

export function resetMidtransStores() {
  transactionStore.clear();
  processedNotifications.clear();
  orderStatuses.clear();
}
