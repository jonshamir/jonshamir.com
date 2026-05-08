import type { StaticImageData } from "next/image";

import leonard from "./images/leonard.jpg";
import michael from "./images/michael.jpg";
import mike from "./images/mike.jpg";
import mom from "./images/mom.jpg";
import samantha from "./images/samantha.jpg";

const IMAGES: Record<string, StaticImageData> = {
  samantha,
  leonard,
  michael,
  mike,
  mom
};

export function getContactImage(name: string): StaticImageData | null {
  const first = name.trim().toLowerCase().split(/\s+/)[0];
  if (!first) return null;
  const cleaned = first.replace(/[^a-z]/g, "");
  return IMAGES[cleaned] ?? null;
}
