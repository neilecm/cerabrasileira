import { describe, it, expect, beforeEach } from "vitest";
import crypto from "crypto";
import {
  verifySignature,
  processWebhook,
  resetMidtransStores,
  orderStatuses,
} from "./midtrans";

describe("midtrans helpers", () => {
  beforeEach(() => {
    resetMidtransStores();
    process.env.MIDTRANS_SERVER_KEY = "server-key";
  });

  it("verifies signature", () => {
    const orderId = "order-1";
    const statusCode = "200";
    const grossAmount = "10000";
    const sig = crypto
      .createHash("sha512")
      .update(orderId + statusCode + grossAmount + "server-key")
      .digest("hex");
    expect(verifySignature(orderId, statusCode, grossAmount, sig)).toBe(true);
    expect(verifySignature(orderId, statusCode, grossAmount, "bad"))
      .toBe(false);
  });

  it("processes webhook statuses idempotently", () => {
    const base = {
      order_id: "order-1",
      status_code: "200",
      gross_amount: "10000",
      signature_key: "sig1",
      transaction_status: "capture",
    };
    const first = processWebhook(base);
    expect(first).toBe("paid");
    expect(orderStatuses.get("order-1")).toBe("paid");

    const second = processWebhook(base);
    expect(second).toBe("paid");
    expect(orderStatuses.get("order-1")).toBe("paid");

    const third = processWebhook({ ...base, signature_key: "sig2", transaction_status: "cancel" });
    expect(third).toBe("failed");
    expect(orderStatuses.get("order-1")).toBe("failed");
  });
});
