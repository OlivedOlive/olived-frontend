/**
 * Supplier-size 3D models of the glass bottles, in public/studio/models. Each is in metres with
 * its base at y = 0, and unlabelled: the Studio wraps the client's label on the real body.
 * Sizes without their own model are shown on the nearest one, scaled by volume.
 */
export type GlassModel = { name: "Marasca" | "Dorica"; url: string; volume: number };

const MODELS: GlassModel[] = [
  { name: "Marasca", url: "/studio/models/marasca-1l.glb", volume: 1000 },
  { name: "Dorica", url: "/studio/models/dorica-750ml.glb", volume: 750 },
];

/** The real model for a packaging format such as "Marasca glass", or null for PET, tin and others. */
export function glassModelFor(format: string): GlassModel | null {
  return MODELS.find((model) => format.startsWith(model.name)) ?? null;
}
