import Layout from "@/components/Layout";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import {
  getDisplayPhoneNumber,
  getTelLink,
  getWhatsAppLink,
  defaultInquiryMessage,
} from "@/lib/whatsapp";

export default function Contact() {
  const displayPhoneNumber = getDisplayPhoneNumber();
  const telLink = getTelLink();
  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      description: "Give us a call during business hours",
      value: displayPhoneNumber,
    },
    {
      icon: Mail,
      title: "Email",
      description: "Send us an email anytime",
      value: "info@laundrypro.rw",
    },
    {
      icon: MapPin,
      title: "Location",
      description: "Visit us in Kigali",
      value: "Kigali, Rwanda",
    },
    {
      icon: Clock,
      title: "Hours",
      description: "We're open every day",
      value: "8:00 AM - 8:00 PM",
    },
  ];

  return (
    <Layout>
      <div className="w-full">
        {/* Hero Section */}
        <section className="py-20 md:py-32 bg-gradient-to-br from-primary/10 to-secondary/10 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl opacity-50"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Contact Us
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Have questions? We'd love to hear from you. Get in touch with us
                via WhatsApp, phone, or email.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section className="py-12 md:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{info.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {info.description}
                    </p>
                    <p className="font-semibold text-primary">{info.value}</p>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-12 text-center border border-primary/20">
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                The fastest way to book your laundry service is through
                WhatsApp. We'll respond within minutes!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={getWhatsAppLink(defaultInquiryMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all"
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
                <a
                  href={telLink}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary/5 transition-all"
                >
                  <Phone className="w-5 h-5" />
                  Call Us
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
