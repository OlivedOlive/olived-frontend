import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";

export function PageHero({
  image,
  eyebrow,
  title,
  lead,
  className,
  children,
}: {
  image: StaticImageData;
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <section className={className ? `page-hero ${className}` : "page-hero"}>
      <div className="page-hero-bg">
        <Image
          src={image}
          alt=""
          fill
          loading="eager"
          fetchPriority="high"
          sizes="100vw"
          className="object-cover"
          placeholder="blur"
        />
      </div>
      <div className="container">
        <div className="page-hero-content">
          <span className="page-hero-eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          {lead && <p className="page-hero-lead">{lead}</p>}
          {children}
        </div>
      </div>
    </section>
  );
}
