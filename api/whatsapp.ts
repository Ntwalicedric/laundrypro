
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

function normalizePhoneNumber(phone: string, defaultCountryCode: string = "250"): string {
	let cleaned = phone.replace(/[\s+\-()]/g, "").trim();
	if (cleaned.startsWith("0") && cleaned.length === 10) {
		cleaned = defaultCountryCode + cleaned.substring(1);
	}
	if (cleaned.length === 9 && /^\d{9}$/.test(cleaned)) {
		cleaned = defaultCountryCode + cleaned;
	}
	return cleaned;
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

	const normalizedPhone = dryCleanerPhone.startsWith("+") ? dryCleanerPhone : `+${dryCleanerPhone}`;
	const message = formatPickupOrderMessage(order);
	return sendWhatsAppMessageTwilio(normalizedPhone, message);
}

export async function sendCustomerConfirmation(
	customerPhone: string,
	customerName: string,
	pickupDateTime: string,
): Promise<WhatsAppResponse> {
	const normalizedPhone = customerPhone.startsWith("+") ? customerPhone : `+${customerPhone}`;
	const message = formatCustomerConfirmationMessage(customerName, pickupDateTime);
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

export async function sendWhatsAppMessageTwilio(to: string, message: string): Promise<WhatsAppResponse> {
	try {
		const { client, whatsAppNumber } = getTwilioClient();
		
		const response = await client.messages.create({
			from: whatsAppNumber.trim(),
			to: `whatsapp:${to.trim()}`,
			body: message,
		});
		
		return { 
			success: true, 
			messageId: response.sid 
		};
	} catch (error: any) {
		const errorMessage = error instanceof Error 
			? error.message 
			: "Unknown error occurred while sending WhatsApp message";
		return { 
			success: false, 
			error: errorMessage 
		};
	}
}
