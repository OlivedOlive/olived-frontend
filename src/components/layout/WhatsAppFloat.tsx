import { WhatsAppIcon } from "@/components/icons";
import { site } from "@/lib/site";

export function WhatsAppFloat({ label }: { label: string }) {
  return (
    // Browser extensions (autofill/password managers) nudge floating corner buttons with an
    // inline style before React loads; that is harmless, so React ignores attribute changes here.
    <a
      href={site.whatsappHref}
      className="whatsapp-float"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      suppressHydrationWarning
    >
      <WhatsAppIcon />
    </a>
  );
}
