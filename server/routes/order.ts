import { RequestHandler } from "express";
import {
  PickupOrderRequest,
  OrderSubmissionResponse,
} from "@shared/api";
import {
  sendPickupOrderToDryCleaner,
  sendCustomerConfirmation,
} from "../../api/whatsapp";
import { z } from "zod";

/**
 * Validation schema for pickup order
 */
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

/**
 * Generate a simple order ID
 */
function generateOrderId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `ORD-${timestamp}-${random}`.toUpperCase();
}

/**
 * Handle pickup order submission
 */
export const handlePickupOrder: RequestHandler<
  unknown,
  OrderSubmissionResponse,
  PickupOrderRequest
> = async (req, res) => {
  try {
    // Validate request body
    const validationResult = orderSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: validationResult.error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", "),
      });
    }

    const order = validationResult.data as PickupOrderRequest;

    // Generate order ID
    const orderId = generateOrderId();

    // Send order to dry cleaner
    const dryCleanerResponse = await sendPickupOrderToDryCleaner(order);

    if (!dryCleanerResponse.success) {
      return res.status(500).json({
        success: false,
        orderId,
        error: `Failed to send order to dry cleaner: ${dryCleanerResponse.error}`,
      });
    }

    // Optionally send confirmation to customer if phone is provided
    let customerMessageId: string | undefined;
    if (order.customerPhone) {
      const customerResponse = await sendCustomerConfirmation(
        order.customerPhone,
        order.customerName,
        order.pickupDateTime || "",
      );

      if (customerResponse.success) {
        customerMessageId = customerResponse.messageId;
      }
      // Note: We don't fail the request if customer confirmation fails
      // since the order was successfully sent to the dry cleaner
    }

    return res.status(200).json({
      success: true,
      orderId,
      messageId: dryCleanerResponse.messageId,
      message: "Order submitted successfully",
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return res.status(500).json({
      success: false,
      error: `Internal server error: ${errorMessage}`,
    });
  }
};

