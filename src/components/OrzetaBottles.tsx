import Image from "next/image";
import grove from "@/assets/images/orzeta-grove.webp";
import organic from "@/assets/images/orzeta-organic.webp";
import sun from "@/assets/images/orzeta-sun.webp";

export const orzetaBottles = { sun, grove, organic };

/**
 * The three ORZETA bottles as a line-up, Grove in front. Size it with CSS `height` on the
 * container. Leave `alts` out where the line-up is decorative.
 */
export function OrzetaBottles({
  className,
  alts,
  eager,
}: {
  className?: string;
  alts?: { sun: string; grove: string; organic: string };
  eager?: boolean;
}) {
  const loading = eager ? ({ loading: "eager", fetchPriority: "high" } as const) : {};
  return (
    <div className={className ? `orzeta-trio ${className}` : "orzeta-trio"}>
      <Image src={sun} alt={alts?.sun ?? ""} className="orzeta-trio-sun" sizes="180px" {...loading} />
      <Image src={grove} alt={alts?.grove ?? ""} className="orzeta-trio-grove" sizes="180px" {...loading} />
      <Image src={organic} alt={alts?.organic ?? ""} className="orzeta-trio-organic" sizes="180px" {...loading} />
    </div>
  );
}
