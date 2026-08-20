import { z } from "zod";

export const propertyTypes = ["House", "Hotel", "Car"] as const;

export type PropertyType = (typeof propertyTypes)[number];

export const subTypesByPropertyType: Record<PropertyType, readonly string[]> = {
  House: ["Economic House", "Apartment", "House", "Villa", "Studio"],
  Hotel: ["Hotel", "Lodge", "Guesthouse", "Resort", "Motel"],
  Car: ["Sedan", "SUV", "Pickup", "Bus","Van"],
};

const typesWithRooms: PropertyType[] = ["House", "Hotel"];

export function typeHasRooms(type: PropertyType): boolean {
  return typesWithRooms.includes(type);
}

export const createHouseSchema = z.object({
  name: z.string().trim().min(2, "Property name must be at least 2 characters"),
  propertyType: z.enum(propertyTypes, { message: "Select a property type" }),
  subType: z.string().trim().optional(),
  price: z.coerce.number<number>().positive("Enter a valid price"),
  bedrooms: z.coerce.number<number>().min(0, "Bedrooms cannot be negative").optional(),
  bathrooms: z.coerce.number<number>().min(0, "Bathrooms cannot be negative").optional(),
  province: z.string().trim().optional(),
  district: z.string().trim().min(1, "District is required"),
  sector: z.string().trim().min(1, "Sector is required"),
  cell: z.string().trim().min(1, "Cell is required"),
  village: z.string().trim().min(1, "Village is required"),
  address: z.string().trim().optional(),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
});

export type CreateHouseValues = z.infer<typeof createHouseSchema>;
