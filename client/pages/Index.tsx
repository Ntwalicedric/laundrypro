import { useState } from "react";
import Layout from "@/components/Layout";
import {
  Droplets,
  Wind,
  Zap,
  Clock,
  MapPin,
  ChevronRight,
  Check,
  Plus,
  Trash,
  Loader2,
} from "lucide-react";
import { getWhatsAppLink, defaultInquiryMessage } from "@/lib/whatsapp";
import { useToast } from "@/hooks/use-toast";
import type { PickupOrderRequest, OrderSubmissionResponse } from "@shared/api";

export default function Index() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingData, setBookingData] = useState({
    name: "",
    phone: "",
    address: "",
    serviceType: "washing",
    pickupDateTime: "",
    items: [{ name: "", quantity: "1" }],
    notes: "",
  });

  const handleBookingChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (
    index: number,
    field: "name" | "quantity",
    value: string,
  ) => {
    setBookingData((prev) => {
      const updatedItems = [...prev.items];
      updatedItems[index] = { ...updatedItems[index], [field]: value };
      return { ...prev, items: updatedItems };
    });
  };

  const addItemField = () => {
    setBookingData((prev) => ({
      ...prev,
      items: [...prev.items, { name: "", quantity: "1" }],
    }));
  };

  const removeItemField = (index: number) => {
    setBookingData((prev) => ({
      ...prev,
      items: prev.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Filter out empty items and convert quantities to numbers
      const validItems = bookingData.items
        .filter((item) => item.name.trim())
        .map((item) => ({
          name: item.name.trim(),
          quantity: Number.parseInt(item.quantity || "1", 10) || 1,
        }));

      if (validItems.length === 0) {
        toast({
          title: "Validation Error",
          description: "Please add at least one item to your order.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Clean phone number (remove spaces, +, etc.)
      const cleanedPhone = bookingData.phone.replace(/[\s+\-()]/g, "");

      const orderData: PickupOrderRequest = {
        customerName: bookingData.name.trim(),
        pickupAddress: bookingData.address.trim(),
        pickupDateTime: bookingData.pickupDateTime || undefined,
        items: validItems,
        customerNotes: bookingData.notes.trim() || undefined,
        customerPhone: cleanedPhone || undefined,
      };

      const response = await fetch("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const result: OrderSubmissionResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to submit order");
      }

      // Success toast
      toast({
        title: "Order Submitted Successfully! 🎉",
        description: `Order ID: ${result.orderId}. The dry cleaner has been notified via WhatsApp.`,
      });

      // Reset form
      setBookingData({
        name: "",
        phone: "",
        address: "",
        serviceType: "washing",
        pickupDateTime: "",
        items: [{ name: "", quantity: "1" }],
        notes: "",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.";
      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const services = [
    {
      icon: Droplets,
      title: "Washing",
      description:
        "Professional washing with premium detergents for all fabric types",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Wind,
      title: "Dry Cleaning",
      description: "Expert dry cleaning for delicate and formal wear",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Zap,
      title: "Pressing",
      description: "Fast professional pressing and ironing services",
      color: "from-orange-500 to-red-500",
    },
  ];

  const features = [
    {
      icon: Clock,
      title: "Fast & Reliable",
      description: "Same-day delivery available in select areas",
    },
    {
      icon: MapPin,
      title: "Free Pickup & Delivery",
      description: "We come to you, anywhere in Kigali",
    },
    {
      icon: Droplets,
      title: "Quality Assured",
      description: "100% satisfaction guaranteed on all services",
    },
  ];

  return (
    <Layout>
      <div className="w-full">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 pt-20 pb-12 md:pt-32 md:pb-20">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl opacity-50"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="animate-fade-in">
                <div className="inline-block mb-6 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                  <span className="text-sm font-semibold text-primary">
                    🚀 Professional Laundry Service
                  </span>
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                  Fresh, Clean{" "}
                  <span className="text-gradient bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Clothes
                  </span>{" "}
                  Delivered
                </h1>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
                  Experience premium laundry service in Kigali. Book your pickup
                  in one click, and we'll handle the rest with care and
                  precision.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => {
                      document
                        .getElementById("booking")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-primary/25 transition-all hover:scale-105"
                  >
                    Book Pickup <ChevronRight className="w-5 h-5" />
                  </button>
                  <a
                    href={getWhatsAppLink(defaultInquiryMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary/5 transition-all"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.876 1.199l-.191.12-.197.012-2.039.659.671-2.447.04-.102.022-.158A9.879 9.879 0 0115.054 2C19.637 2 23.354 5.716 23.354 10.302c0 1.147-.224 2.288-.66 3.372l-.129.369 2.447.671-.102.04-.158.022c-1.185.566-2.336 1.346-3.302 2.306-2.664 2.667-4.145 6.268-4.145 10.069 0 .733.055 1.457.166 2.15h-18.6A1.501 1.501 0 010 20.5v-17C0 2.671 1.119 1.5 2.5 1.5h14.292A9.944 9.944 0 015.05 9.979z" />
                    </svg>
                    WhatsApp
                  </a>
                </div>
              </div>

              <div className="hidden lg:block animate-slide-up">
                <div className="relative w-full h-full min-h-96">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-2xl"></div>
                  <div className="relative bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur rounded-3xl p-8 border border-primary/20">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        "🧺 Professional Washing",
                        "🌬️ Express Dry Cleaning",
                        "👔 Premium Pressing",
                        "📦 Free Pickup & Delivery",
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <Check className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-medium text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Booking Section */}
        <section
          id="booking"
          className="py-12 md:py-20 bg-gradient-to-b from-background to-primary/5"
        >
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  Book Your Pickup
                </h2>
                <p className="text-xl text-muted-foreground">
                  Schedule a laundry pickup in just one click
                </p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm">
                <form onSubmit={handleBookingSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={bookingData.name}
                        onChange={handleBookingChange}
                        placeholder="Your name"
                        required
                        className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={bookingData.phone}
                        onChange={handleBookingChange}
                        placeholder="+250 700 000 000"
                        required
                        className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Delivery Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={bookingData.address}
                      onChange={handleBookingChange}
                      placeholder="Your address in Kigali"
                      required
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Service Type
                      </label>
                      <select
                        name="serviceType"
                        value={bookingData.serviceType}
                        onChange={handleBookingChange}
                        className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      >
                        <option value="washing">Washing</option>
                        <option value="dry-cleaning">Dry Cleaning</option>
                        <option value="pressing">Pressing</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Preferred Pickup Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        name="pickupDateTime"
                        value={bookingData.pickupDateTime}
                        onChange={handleBookingChange}
                        className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-lg font-semibold">
                        Laundry Items
                      </label>
                      <button
                        type="button"
                        onClick={addItemField}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border border-border rounded-lg hover:bg-primary/5 transition-all"
                      >
                        <Plus className="w-4 h-4" /> Add Item
                      </button>
                    </div>
                    <div className="space-y-4">
                      {bookingData.items.map((item, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-1 md:grid-cols-[2fr,1fr,auto] gap-4 items-end"
                        >
                          <div>
                            <label className="block text-sm font-semibold mb-2">
                              Item Name
                            </label>
                            <input
                              type="text"
                              value={item.name}
                              onChange={(event) =>
                                handleItemChange(index, "name", event.target.value)
                              }
                              placeholder="e.g., Shirts"
                              className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-2">
                              Quantity
                            </label>
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(event) =>
                                handleItemChange(index, "quantity", event.target.value)
                              }
                              className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                          </div>
                          {bookingData.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItemField(index)}
                              className="h-12 md:h-full px-4 py-3 text-sm font-semibold text-destructive border border-destructive rounded-lg hover:bg-destructive/10 transition-all flex items-center justify-center gap-2"
                              aria-label={`Remove item ${index + 1}`}
                            >
                              <Trash className="w-4 h-4" />
                              <span className="md:hidden">Remove</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      name="notes"
                      value={bookingData.notes}
                      onChange={(event) =>
                        setBookingData((prev) => ({
                          ...prev,
                          notes: event.target.value,
                        }))
                      }
                      placeholder="Share any special instructions or preferences"
                      rows={4}
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Submitting Order...
                      </>
                    ) : (
                      "Submit Order via WhatsApp"
                    )}
                  </button>
                </form>

                <p className="text-sm text-muted-foreground text-center mt-6">
                  We'll confirm your booking and arrange the pickup time via
                  WhatsApp
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-12 md:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Our Services
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Premium laundry care for every need
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <div
                    key={index}
                    className="group relative bg-card border border-border rounded-2xl p-8 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`}
                    ></div>
                    <div className="relative">
                      <div
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">
                        {service.title}
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        {service.description}
                      </p>
                      <a
                        href={getWhatsAppLink(defaultInquiryMessage)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all"
                      >
                        Learn More <ChevronRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 md:py-20 bg-gradient-to-b from-background to-primary/5">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-20 bg-gradient-to-r from-primary via-primary/90 to-secondary">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Experience Premium Laundry Service?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join hundreds of satisfied customers in Kigali who trust
              LaundryPro for their laundry needs.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  document
                    .getElementById("booking")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary rounded-xl font-semibold hover:shadow-xl transition-all"
              >
                Book Now <ChevronRight className="w-5 h-5" />
              </button>
              <a
                href={getWhatsAppLink(defaultInquiryMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white/10 transition-all"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.876 1.199l-.191.12-.197.012-2.039.659.671-2.447.04-.102.022-.158A9.879 9.879 0 0115.054 2C19.637 2 23.354 5.716 23.354 10.302c0 1.147-.224 2.288-.66 3.372l-.129.369 2.447.671-.102.04-.158.022c-1.185.566-2.336 1.346-3.302 2.306-2.664 2.667-4.145 6.268-4.145 10.069 0 .733.055 1.457.166 2.15h-18.6A1.501 1.501 0 010 20.5v-17C0 2.671 1.119 1.5 2.5 1.5h14.292A9.944 9.944 0 015.05 9.979z" />
                </svg>
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
