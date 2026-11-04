import { WhatsAppIcon } from "@/components/icons";
import { site } from "@/lib/site";

export function WhatsAppFloat() {
  return (
    <a
      href={site.whatsappHref}
      className="whatsapp-float"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with OLIVED on WhatsApp"
    >
      <WhatsAppIcon />
    </a>
  );
}
