/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Order item with quantity
 */
export interface OrderItem {
  name: string;
  quantity: number;
}

/**
 * Dry cleaning pickup order request
 */
export interface PickupOrderRequest {
  customerName: string;
  pickupAddress: string;
  pickupDateTime?: string;
  items: OrderItem[];
  customerNotes?: string;
  customerPhone?: string; // Optional: for sending confirmation back to customer
}

/**
 * WhatsApp API response
 */
export interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Order submission response
 */
export interface OrderSubmissionResponse {
  success: boolean;
  orderId?: string;
  messageId?: string;
  message?: string;
  error?: string;
}