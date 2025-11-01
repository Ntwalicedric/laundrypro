import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from "zod";
import {
  sendPickupOrderToDryCleaner,
  sendCustomerConfirmation,
} from "./whatsapp.js";

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
    // Method validation
    if (req.method !== "POST") {
      res.status(405).json({ 
        success: false, 
        error: `Method not allowed. Expected POST, got ${req.method}.` 
      });
      return;
    }

    // Parse request body
    let body = req.body;
    if (!body || typeof body === "string") {
      try {
        body = JSON.parse(body || '{}');
      } catch (parseError) {
        res.status(400).json({ 
          success: false, 
          error: "Invalid JSON format in request body." 
        });
        return;
      }
    }

    // Validate request body structure
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      res.status(400).json({ 
        success: false, 
        error: "Request body must be a valid JSON object." 
      });
      return;
    }

    // Schema validation
    const validationResult = orderSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors
        .map((e) => {
          const path = e.path.length > 0 ? e.path.join(".") : "root";
          return `${path}: ${e.message}`;
        })
        .join(", ");
      
      res.status(400).json({
        success: false,
        error: `Validation failed: ${errorMessages}`,
      });
      return;
    }

    const order = validationResult.data as import("../shared/api.js").PickupOrderRequest;
    
    // Additional sanitization
    order.customerName = (order.customerName || "").trim();
    order.pickupAddress = (order.pickupAddress || "").trim();
    order.customerNotes = order.customerNotes ? order.customerNotes.trim() : undefined;
    
    // Validate required fields are not empty after trimming
    if (!order.customerName) {
      res.status(400).json({
        success: false,
        error: "Customer name is required and cannot be empty.",
      });
      return;
    }

    if (!order.pickupAddress) {
      res.status(400).json({
        success: false,
        error: "Pickup address is required and cannot be empty.",
      });
      return;
    }

    // Validate items
    if (!order.items || order.items.length === 0) {
      res.status(400).json({
        success: false,
        error: "At least one item is required in the order.",
      });
      return;
    }

    // Validate item names and quantities
    for (let i = 0; i < order.items.length; i++) {
      const item = order.items[i];
      if (!item.name || !item.name.trim()) {
        res.status(400).json({
          success: false,
          error: `Item at index ${i} has an empty or invalid name.`,
        });
        return;
      }
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        res.status(400).json({
          success: false,
          error: `Item "${item.name}" has an invalid quantity. Must be a positive integer.`,
        });
        return;
      }
    }

    // Generate order ID
    const orderId = generateOrderId();

    // Send order to dry cleaner (critical operation)
    const dryCleanerResponse = await sendPickupOrderToDryCleaner(order);
    if (!dryCleanerResponse.success) {
      // Log error but don't expose internal details to client
      console.error("Failed to send order to dry cleaner:", {
        orderId,
        error: dryCleanerResponse.error,
        customerName: order.customerName,
      });

      res.status(500).json({
        success: false,
        orderId,
        error: `Failed to send order notification. Please contact support with order ID: ${orderId}`,
      });
      return;
    }

    // Send confirmation to customer (non-critical, don't fail if it errors)
    let customerMessageId: string | undefined;
    if (order.customerPhone) {
      try {
        const customerResponse = await sendCustomerConfirmation(
          order.customerPhone,
          order.customerName,
          order.pickupDateTime || "",
        );
        
        if (customerResponse.success) {
          customerMessageId = customerResponse.messageId;
        } else {
          // Log but don't fail the order
          console.warn("Failed to send customer confirmation:", {
            orderId,
            phone: order.customerPhone,
            error: customerResponse.error,
          });
        }
      } catch (customerError) {
        // Log but don't fail the order
        console.warn("Exception while sending customer confirmation:", {
          orderId,
          phone: order.customerPhone,
          error: customerError instanceof Error ? customerError.message : "Unknown error",
        });
      }
    }

    res.status(200).json({
      success: true,
      orderId,
      messageId: dryCleanerResponse.messageId,
      message: "Order submitted successfully",
    });
  } catch (err: unknown) {
    // Comprehensive error handling
    const errorMessage = err instanceof Error 
      ? err.message 
      : "An unexpected server error occurred";
    
    // Log full error details for debugging
    console.error("Order handler error:", {
      error: err,
      method: req.method,
      url: req.url,
      headers: req.headers,
    });

    res.status(500).json({
      success: false,
      error: "An unexpected server error occurred. Please try again or contact support.",
    });
  }
}
