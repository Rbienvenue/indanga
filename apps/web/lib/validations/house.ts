import { z } from "zod";

export const propertyTypes = ["House", "Hotel", "Car"] as const;

export type PropertyType = (typeof propertyTypes)[number];

export const subTypesByPropertyType: Record<PropertyType, readonly string[]> = {
  House: [
    "Studio",
    "1 Bedroom",
    "2 Bedroom",
    "3 Bedroom",
    "Apartment",
    "Family House",
    "Villa",
    "Economic House",
    "House",
  ],
  Hotel: ["Hotel", "Lodge", "Guesthouse", "Resort", "Motel"],
  Car: ["Sedan", "SUV", "Pickup", "Bus", "Van"],
};

const typesWithRooms: PropertyType[] = ["House", "Hotel"];

export function typeHasRooms(type: PropertyType): boolean {
  return typesWithRooms.includes(type);
}

export const propertyAmenities = [
  "wifi",
  "pool",
  "parking",
  "breakfast",
  "air-conditioning",
  "tv",
  "washing-machine",
  "backup-power",
  "furnished",
  "gym",
  "balcony",
] as const;

export type PropertyAmenity = (typeof propertyAmenities)[number];

export const propertyAmenityLabels: Record<PropertyAmenity, string> = {
  wifi: "WiFi",
  pool: "Pool",
  parking: "Parking",
  breakfast: "Breakfast",
  "air-conditioning": "Air conditioning",
  tv: "TV",
  "washing-machine": "Washing machine",
  "backup-power": "Backup power",
  furnished: "Furnished",
  gym: "Gym",
  balcony: "Balcony",
};

export const roomTypeSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Room name must be at least 2 characters"),
  price: z.coerce.number<number>().positive("Enter a valid price"),
  totalRooms: z.coerce.number<number>().int().min(1, "At least 1 room"),
});

export type RoomTypeValues = z.infer<typeof roomTypeSchema>;

const optionalPrice = z.preprocess(
  (value) => (value === "" || value === undefined || value === null ? undefined : value),
  z.coerce.number<number>().positive("Enter a valid price").optional(),
);

export const createHouseSchema = z
  .object({
    name: z.string().trim().min(2, "Property name must be at least 2 characters"),
    propertyType: z.enum(propertyTypes, { message: "Select a property type" }),
    subType: z.string().trim().optional(),
    price: optionalPrice,
    rooms: z.array(roomTypeSchema).optional(),
    bedrooms: z.coerce.number<number>().min(0, "Bedrooms cannot be negative").optional(),
    bathrooms: z.coerce.number<number>().min(0, "Bathrooms cannot be negative").optional(),
    province: z.string().trim().optional(),
    district: z.string().trim().min(1, "District is required"),
    sector: z.string().trim().min(1, "Sector is required"),
    cell: z.string().trim().min(1, "Cell is required"),
    village: z.string().trim().min(1, "Village is required"),
    address: z.string().trim().optional(),
    description: z.string().trim().min(10, "Description must be at least 10 characters"),
    metadata: z.array(z.enum(propertyAmenities)).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.propertyType === "Hotel") {
      if (!data.rooms || data.rooms.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["rooms"],
          message: "Add at least one room type",
        });
      }
      return;
    }
    if (data.price === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["price"],
        message: "Enter a valid price",
      });
    }
  });

export type CreateHouseValues = z.infer<typeof createHouseSchema>;
