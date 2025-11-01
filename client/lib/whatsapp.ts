export const whatsappConfig = {
  phoneNumber: "250784123456",
  businessName: "LaundryPro",
};

export const defaultInquiryMessage =
  "Hello! I'd like to book a laundry service. Can you help me?";

export function getWhatsAppLink(message: string = defaultInquiryMessage): string {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${whatsappConfig.phoneNumber}?text=${encodedMessage}`;
}

export function openWhatsApp(message: string = defaultInquiryMessage): void {
  const link = getWhatsAppLink(message);
  window.open(link, "_blank", "noopener,noreferrer");
}

export function getDisplayPhoneNumber(): string {
  return whatsappConfig.phoneNumber.startsWith("+")
    ? whatsappConfig.phoneNumber
    : `+${whatsappConfig.phoneNumber}`;
}

export function getTelLink(): string {
  const digits = whatsappConfig.phoneNumber.replace(/^\+/, "");
  return `tel:+${digits}`;
}
