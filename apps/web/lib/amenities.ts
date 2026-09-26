import {
  Coffee,
  Dumbbell,
  PlugZap,
  Snowflake,
  Sofa,
  SquareParking,
  Sun,
  Tv,
  WashingMachine,
  Waves,
  Wifi,
  type LucideIcon,
} from "lucide-react";

import { propertyAmenities, type PropertyAmenity } from "@/lib/validations/house";

export const amenityIcons: Record<PropertyAmenity, LucideIcon> = {
  wifi: Wifi,
  pool: Waves,
  parking: SquareParking,
  breakfast: Coffee,
  "air-conditioning": Snowflake,
  tv: Tv,
  "washing-machine": WashingMachine,
  "backup-power": PlugZap,
  furnished: Sofa,
  gym: Dumbbell,
  balcony: Sun,
};

export function parseAmenities(metadata: unknown): PropertyAmenity[] {
  if (!Array.isArray(metadata)) return [];
  return metadata.filter((item): item is PropertyAmenity =>
    propertyAmenities.includes(item as PropertyAmenity),
  );
}
