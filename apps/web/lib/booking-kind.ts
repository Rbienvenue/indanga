import type { House, RoomType } from "@/@types";

export type BookingKind = "home" | "hotel" | "car";

export type HouseWithRooms = House & { rooms?: RoomType[] };

export function getBookingKind(propertyType?: string): BookingKind {
  const normalized = propertyType?.trim().toLowerCase() ?? "";
  if (["car", "sedan", "suv", "pickup", "bus", "van"].some((value) => normalized.includes(value))) {
    return "car";
  }
  if (
    ["hotel", "apartment", "lodge", "guesthouse", "guest house", "resort", "motel"].some((value) =>
      normalized.includes(value),
    )
  ) {
    return "hotel";
  }
  return "home";
}

export function getPriceUnit(
  propertyType?: string,
  listingPurpose: House["listingPurpose"] = "RENT",
): string {
  if (listingPurpose === "SELL") return "";
  const kind = getBookingKind(propertyType);
  if (kind === "hotel") return "/ night";
  if (kind === "car") return "/ day";
  return "/ month";
}
