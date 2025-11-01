
import {
	PickupOrderRequest,
	OrderItem,
	WhatsAppResponse,
} from "../shared/api.js";
import twilio from "twilio";


interface WhatsAppConfig {
	accessToken: string;
	phoneNumberId: string;
	apiVersion: string;
	baseUrl: string;
}

function getWhatsAppConfig(): WhatsAppConfig {
	const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
	const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
	const apiVersion = process.env.WHATSAPP_API_VERSION || "v18.0";

	if (!accessToken) {
		throw new Error(
			"WHATSAPP_ACCESS_TOKEN environment variable is required",
		);
	}

	if (!phoneNumberId) {
		throw new Error(
			"WHATSAPP_PHONE_NUMBER_ID environment variable is required",
		);
	}

	return {
		accessToken,
		phoneNumberId,
		apiVersion,
		baseUrl: `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
	};
}

export function formatPickupOrderMessage(
	order: PickupOrderRequest,
): string {
	const itemsList = order.items
		.map((item) => `  • ${item.quantity}x ${item.name}`)
		.join("\n");

	const pickupTimeFormatted = (() => {
		if (!order.pickupDateTime) {
			return "Not specified";
		}

		try {
			const date = new Date(order.pickupDateTime);
			if (Number.isNaN(date.getTime())) {
				return order.pickupDateTime;
			}

			return date.toLocaleString("en-US", {
				weekday: "short",
				year: "numeric",
				month: "short",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			});
		} catch {
			return order.pickupDateTime;
		}
	})();

	let message = `🧺 *NEW PICKUP ORDER*\n\n`;
	message += `📋 *Customer:* ${order.customerName}\n`;
	message += `📍 *Address:* ${order.pickupAddress}\n`;
	message += `⏰ *Preferred Pickup:* ${pickupTimeFormatted}\n\n`;
	message += `📦 *Items:*\n${itemsList}\n`;

	if (order.customerNotes && order.customerNotes.trim()) {
		message += `\n📝 *Notes:*\n${order.customerNotes.trim()}\n`;
	}

	message += `\n_Order received at ${new Date().toLocaleString()}_`;

	return message;
}

export function formatCustomerConfirmationMessage(
	customerName: string,
	pickupDateTime: string,
): string {
	const pickupTimeFormatted = (() => {
		if (!pickupDateTime) {
			return "your preferred time";
		}

		try {
			const date = new Date(pickupDateTime);
			if (Number.isNaN(date.getTime())) {
				return pickupDateTime;
			}

			return date.toLocaleString("en-US", {
				weekday: "long",
				year: "numeric",
				month: "long",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			});
		} catch {
			return pickupDateTime;
		}
	})();

	let message = `✅ *Order Confirmed*\n\n`;
	message += `Hi ${customerName}! 👋\n\n`;
	message += `Thank you for choosing LaundryPro! Your pickup order has been received.\n\n`;
	message += `📅 *Scheduled Pickup:* ${pickupTimeFormatted}\n\n`;
	message += `We'll send you a reminder before pickup. If you need to make any changes, please contact us.\n\n`;
	message += `Thank you! 🙏`;

	return message;
}

export async function sendWhatsAppMessage(
	to: string,
	message: string,
): Promise<WhatsAppResponse> {
	try {
		const config = getWhatsAppConfig();

		let phoneNumber = to.replace(/[\s+\-()]/g, "").trim();

		if (!/^\d{10,15}$/.test(phoneNumber)) {
			return {
				success: false,
				error: `Invalid phone number format: ${to} (cleaned to: ${phoneNumber}). Expected 10-15 digits in international format (e.g., 250792875310 for Rwanda).`,
			};
		}

		let response = await fetch(config.baseUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${config.accessToken}`,
			},
			body: JSON.stringify({
				messaging_product: "whatsapp",
				recipient_type: "individual",
				to: phoneNumber,
				type: "text",
				text: {
					preview_url: false,
					body: message,
				},
			}),
		});

		let data = await response.json();

		if (!response.ok && data.error && 
				(data.error.message?.includes("not in allowed list") || data.error.code === 131031)) {
			response = await fetch(config.baseUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${config.accessToken}`,
				},
				body: JSON.stringify({
					messaging_product: "whatsapp",
					recipient_type: "individual",
					to: `+${phoneNumber}`,
					type: "text",
					text: {
						preview_url: false,
						body: message,
					},
				}),
			});
			data = await response.json();
		}

		if (!response.ok) {
			const errorMessage =
				data.error?.message || `HTTP ${response.status}: ${response.statusText}`;
			const errorCode = data.error?.code;
			const errorDetails = data.error;
			let helpfulMessage = errorMessage;
			if (errorMessage.includes("not in allowed list") || errorCode === 131031) {
				helpfulMessage = `Recipient number not in allowed list.\n\n` +
					`Number being sent to API: ${phoneNumber}\n` +
					`Number with + prefix: +${phoneNumber}\n\n` +
					`IMPORTANT: Make sure this number is in your Meta allowed recipient list.\n\n` +
					`In Meta Business Suite:\n` +
					`1. Go to WhatsApp → API Setup → "To" field settings\n` +
					`2. Add the number: ${phoneNumber} (digits only, without + prefix)\n` +
					`3. Meta UI may show it as +${phoneNumber}, but add it as ${phoneNumber}\n` +
					`4. Wait a few minutes after adding before trying again\n\n` +
					`Note: If your .env has a local format (e.g., 0792875310), it's automatically converted to ${phoneNumber}\n\n` +
					`Full API error: ${JSON.stringify(errorDetails)}`;
			}
			return {
				success: false,
				error: helpfulMessage,
			};
		}

		return {
			success: true,
			messageId: data.messages?.[0]?.id,
		};
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error occurred";
		return {
			success: false,
			error: errorMessage,
		};
	}
}

/**
 * Validates and normalizes phone numbers
 * @param phone - Phone number to normalize
 * @param defaultCountryCode - Default country code (default: "250" for Rwanda)
 * @returns Normalized phone number or null if invalid
 */
function normalizePhoneNumber(phone: string | undefined | null, defaultCountryCode: string = "250"): string | null {
	if (!phone || typeof phone !== "string") {
		return null;
	}

	// Remove all non-digit characters except +
	let cleaned = phone.replace(/[\s\-()]/g, "").trim();
	
	// Remove leading + if present
	if (cleaned.startsWith("+")) {
		cleaned = cleaned.substring(1);
	}

	// Validate: must be digits only and reasonable length
	if (!/^\d{9,15}$/.test(cleaned)) {
		return null;
	}

	// Handle local format (starts with 0)
	if (cleaned.startsWith("0") && cleaned.length === 10) {
		cleaned = defaultCountryCode + cleaned.substring(1);
	}
	
	// Handle 9-digit numbers (assume local without leading 0)
	if (cleaned.length === 9 && /^\d{9}$/.test(cleaned)) {
		cleaned = defaultCountryCode + cleaned;
	}

	// Final validation: must be 10-15 digits
	if (!/^\d{10,15}$/.test(cleaned)) {
		return null;
	}

	return cleaned;
}

/**
 * Validates phone number format for WhatsApp API
 * @param phone - Phone number to validate
 * @returns true if valid, false otherwise
 */
function isValidPhoneNumber(phone: string): boolean {
	const normalized = normalizePhoneNumber(phone);
	return normalized !== null && /^\d{10,15}$/.test(normalized);
}

export async function sendPickupOrderToDryCleaner(
	order: PickupOrderRequest,
): Promise<WhatsAppResponse> {
	const dryCleanerPhone = process.env.DRY_CLEANER_WHATSAPP_NUMBER;

	if (!dryCleanerPhone) {
		const envDebug = Object.keys(process.env)
			.filter((key) =>
				key.toUpperCase().includes("WHATSAPP") || key.toUpperCase().includes("DRY"),
			)
			.map((key) => `${key}=${process.env[key] ? "***" : "undefined"}`)
			.join(", ");
		return {
			success: false,
			error: `DRY_CLEANER_WHATSAPP_NUMBER environment variable is not set. Found env vars: ${envDebug || "none"}. Please check your .env file and restart the server.`,
		};
	}

	// Normalize and validate phone number
	const normalizedPhoneNumber = normalizePhoneNumber(dryCleanerPhone);
	if (!normalizedPhoneNumber) {
		return {
			success: false,
			error: `Invalid dry cleaner phone number format: ${dryCleanerPhone}. Expected a valid international phone number (10-15 digits).`,
		};
	}

	const normalizedPhone = `+${normalizedPhoneNumber}`;
	const message = formatPickupOrderMessage(order);
	
	// Validate message length (WhatsApp limit is 4096 characters)
	if (message.length > 4096) {
		return {
			success: false,
			error: `Order message is too long (${message.length} characters). Maximum allowed is 4096 characters.`,
		};
	}

	return sendWhatsAppMessageTwilio(normalizedPhone, message);
}

export async function sendCustomerConfirmation(
	customerPhone: string,
	customerName: string,
	pickupDateTime: string,
): Promise<WhatsAppResponse> {
	// Normalize and validate phone number
	const normalizedPhoneNumber = normalizePhoneNumber(customerPhone);
	if (!normalizedPhoneNumber) {
		return {
			success: false,
			error: `Invalid customer phone number format: ${customerPhone}. Expected a valid international phone number (10-15 digits).`,
		};
	}

	// Sanitize customer name
	const sanitizedName = (customerName || "").trim().substring(0, 100);
	if (!sanitizedName) {
		return {
			success: false,
			error: "Customer name is required and cannot be empty.",
		};
	}

	const normalizedPhone = `+${normalizedPhoneNumber}`;
	const message = formatCustomerConfirmationMessage(sanitizedName, pickupDateTime || "");
	
	// Validate message length (WhatsApp limit is 4096 characters)
	if (message.length > 4096) {
		return {
			success: false,
			error: `Confirmation message is too long (${message.length} characters). Maximum allowed is 4096 characters.`,
		};
	}

	return sendWhatsAppMessageTwilio(normalizedPhone, message);
}

function getTwilioClient() {
	const accountSid = process.env.TWILIO_ACCOUNT_SID;
	const authToken = process.env.TWILIO_AUTH_TOKEN;
	const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;

	if (!accountSid || !authToken || !twilioWhatsAppNumber) {
		const missingVars = [];
		if (!accountSid) missingVars.push("TWILIO_ACCOUNT_SID");
		if (!authToken) missingVars.push("TWILIO_AUTH_TOKEN");
		if (!twilioWhatsAppNumber) missingVars.push("TWILIO_WHATSAPP_NUMBER");
		
		throw new Error(
			`Missing required Twilio environment variables: ${missingVars.join(", ")}. ` +
			`Please set these in your deployment environment variables.`
		);
	}

	return {
		client: twilio(accountSid, authToken),
		whatsAppNumber: twilioWhatsAppNumber,
	};
}

/**
 * Sends WhatsApp message via Twilio with timeout and better error handling
 */
export async function sendWhatsAppMessageTwilio(to: string, message: string): Promise<WhatsAppResponse> {
	// Input validation
	if (!to || typeof to !== "string" || !to.trim()) {
		return {
			success: false,
			error: "Recipient phone number is required.",
		};
	}

	if (!message || typeof message !== "string" || !message.trim()) {
		return {
			success: false,
			error: "Message content is required.",
		};
	}

	// Validate message length (Twilio/WhatsApp limit)
	if (message.length > 4096) {
		return {
			success: false,
			error: `Message is too long (${message.length} characters). Maximum allowed is 4096 characters.`,
		};
	}

	try {
		const { client, whatsAppNumber } = getTwilioClient();
		
		// Validate phone number format before sending
		const cleanTo = to.replace(/^whatsapp:/, "").replace(/^\+/, "").trim();
		if (!/^\d{10,15}$/.test(cleanTo)) {
			return {
				success: false,
				error: `Invalid phone number format: ${to}. Expected 10-15 digits.`,
			};
		}

		// Create a promise with timeout (30 seconds)
		const timeoutPromise = new Promise<never>((_, reject) => {
			setTimeout(() => reject(new Error("Request timeout: Twilio API call exceeded 30 seconds")), 30000);
		});

		const sendPromise = client.messages.create({
			from: whatsAppNumber.trim(),
			to: `whatsapp:${to.trim()}`,
			body: message.substring(0, 4096), // Ensure we don't exceed limit
		});

		const response = await Promise.race([sendPromise, timeoutPromise]);
		
		if (!response || !response.sid) {
			return {
				success: false,
				error: "Twilio returned an invalid response (missing message SID).",
			};
		}

		return { 
			success: true, 
			messageId: response.sid 
		};
	} catch (error: any) {
		// Handle specific Twilio error codes
		let errorMessage = "Unknown error occurred while sending WhatsApp message";
		
		if (error instanceof Error) {
			errorMessage = error.message;
			
			// Provide helpful error messages for common issues
			if (error.message.includes("timeout")) {
				errorMessage = "Request timeout: The messaging service did not respond in time. Please try again.";
			} else if (error.message.includes("Invalid") || error.message.includes("invalid")) {
				errorMessage = `Invalid request: ${error.message}. Please check phone number format and credentials.`;
			} else if (error.message.includes("Authentication")) {
				errorMessage = "Authentication failed: Please check your Twilio credentials (TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN).";
			} else if (error.message.includes("not in allowed list")) {
				errorMessage = "Phone number not in allowed list: The recipient number must be added to your Twilio allowed list for WhatsApp.";
			}
		}
		
		return { 
			success: false, 
			error: errorMessage 
		};
	}
}
