import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from "zod";
import {
  sendPickupOrderToDryCleaner,
  sendCustomerConfirmation,
} from "./whatsapp";

const orderSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  pickupAddress: z.string().min(1, "Pickup address is required"),
  pickupDateTime: z.string().optional(),
  items: z
    .array(
      z.object({
        name: z.string().min(1, "Item name is required"),
        quantity: z
          .number()
          .int()
          .positive("Quantity must be a positive integer")
          .or(z.string().transform((val) => {
            const num = Number.parseInt(val, 10);
            if (Number.isNaN(num) || num <= 0) {
              throw new z.ZodError([
                {
                  code: "custom",
                  message: "Quantity must be a positive integer",
                  path: ["quantity"],
                },
              ]);
            }
            return num;
          })),
      }),
    )
    .min(1, "At least one item is required"),
  customerNotes: z.string().optional(),
  customerPhone: z.string().optional(),
});

function generateOrderId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `ORD-${timestamp}-${random}`.toUpperCase();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ success: false, error: "Method not allowed" });
      return;
    }

    let body = req.body;
    // Vercel may not parse JSON automatically
    if (!body || typeof body === "string") {
      try {
        body = JSON.parse(body || '{}');
      } catch {
        res.status(400).json({ success: false, error: "Invalid JSON" });
        return;
      }
    }

    const validationResult = orderSchema.safeParse(body);
    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        error: validationResult.error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", "),
      });
      return;
    }

  const order = validationResult.data as import("../shared/api").PickupOrderRequest;
    const orderId = generateOrderId();

    const dryCleanerResponse = await sendPickupOrderToDryCleaner(order);
    if (!dryCleanerResponse.success) {
      res.status(500).json({
        success: false,
        orderId,
        error: `Failed to send order to dry cleaner: ${dryCleanerResponse.error}`,
      });
      return;
    }

    let customerMessageId;
    if (order.customerPhone) {
      const customerResponse = await sendCustomerConfirmation(
        order.customerPhone,
        order.customerName,
        order.pickupDateTime || "",
      );
      if (customerResponse.success) {
        customerMessageId = customerResponse.messageId;
      }
    }

    res.status(200).json({
      success: true,
      orderId,
      messageId: dryCleanerResponse.messageId,
      message: "Order submitted successfully",
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || "An unexpected server error occurred"
    });
  }
}
