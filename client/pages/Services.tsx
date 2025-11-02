import Layout from "@/components/Layout";
import { Droplets, Wind, Zap, Shirt, ShirtIcon, Sparkles, MapPin } from "lucide-react";
import { getWhatsAppLink, defaultInquiryMessage } from "@/lib/whatsapp";

export default function Services() {
  const services = [
    {
      icon: Droplets,
      title: "Washing & Ironing",
      description: "Professional washing and ironing services",
      price: "Competitive pricing",
      details: [
        "Professional washing with premium detergents",
        "Expert ironing and pressing",
        "Fast turnaround - within 4 hours",
        "All fabric types handled with care",
      ],
    },
    {
      icon: Wind,
      title: "Dry Cleaning",
      description: "Expert dry cleaning for formal and delicate wear",
      price: "Competitive pricing",
      details: [
        "Professional dry cleaning process",
        "Stain removal service",
        "Fabric preservation",
        "Premium care for special items",
      ],
    },
    {
      icon: MapPin,
      title: "Home Pickup & Delivery",
      description: "Convenient pickup and delivery service",
      price: "Free within Kigali",
      details: [
        "Free pickup & delivery in Kigali area",
        "Pick up & deliver within 4 hours",
        "Flexible scheduling",
        "Door-to-door service",
      ],
    },
    {
      icon: ShirtIcon,
      title: "Hospital & Business Laundry Solutions",
      description: "Specialized solutions for institutions",
      price: "Contact for pricing",
      details: [
        "Bulk laundry services",
        "Regular scheduled pickups",
        "Customized solutions",
        "Dedicated account management",
      ],
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
                Our Services
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Complete laundry solutions tailored to your needs. From everyday
                washing to specialized care, we have you covered.
              </p>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-12 md:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <div
                    key={index}
                    className="group bg-card border border-border rounded-2xl p-8 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{service.title}</h3>
                    <p className="text-muted-foreground mb-4">
                      {service.description}
                    </p>
                    <p className="text-lg font-semibold text-primary mb-6">
                      {service.price}
                    </p>
                    <ul className="space-y-2 mb-8">
                      {service.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                          <span className="text-muted-foreground text-sm">
                            {detail}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <a
                      href={getWhatsAppLink(defaultInquiryMessage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full px-4 py-2 border border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition-all inline-block text-center"
                    >
                      Inquire Now
                    </a>
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
              Ready to Use Our Services?
            </h2>
            <a
              href={getWhatsAppLink(defaultInquiryMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary rounded-xl font-semibold hover:shadow-xl transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.876 1.199l-.191.12-.197.012-2.039.659.671-2.447.04-.102.022-.158A9.879 9.879 0 0115.054 2C19.637 2 23.354 5.716 23.354 10.302c0 1.147-.224 2.288-.66 3.372l-.129.369 2.447.671-.102.04-.158.022c-1.185.566-2.336 1.346-3.302 2.306-2.664 2.667-4.145 6.268-4.145 10.069 0 .733.055 1.457.166 2.15h-18.6A1.501 1.501 0 010 20.5v-17C0 2.671 1.119 1.5 2.5 1.5h14.292A9.944 9.944 0 015.05 9.979z" />
              </svg>
              Contact Us on WhatsApp
            </a>
          </div>
        </section>
      </div>
    </Layout>
  );
}
