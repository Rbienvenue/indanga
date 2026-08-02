export function buildHousesUrl(page, filters) {
  const params = new URLSearchParams({
    page: String(page),
    limit: "20",
    status: "AVAILABLE",
  });

  const propertyTypeFilter = getPropertyTypeFilter(filters.propertyType);

  if (propertyTypeFilter) {
    params.set("propertyType", propertyTypeFilter);
  }

  if (filters.budget !== "any") {
    const { minPrice, maxPrice } = getBudgetRange(filters.budget);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
  }

  return `/houses?${params.toString()}`;
}

function getBudgetRange(budget) {
  const [minimum, maximum] = budget.split("-");

  return {
    minPrice: minimum && minimum !== "0" ? minimum : undefined,
    maxPrice: maximum || undefined,
  };
}

function getPropertyTypeFilter(propertyType) {
  const normalizedPropertyType = propertyType?.trim().toLowerCase();

  switch (normalizedPropertyType) {
    case "all":
    case "":
    case undefined:
    case null:
      return null;
    case "houses":
    case "house":
    case "homes":
    case "home":
      return "House,Apartment,Studio";
    case "hotels":
    case "hotel":
      return "Hotel";
    case "cars":
    case "car":
      return "Car";
    default:
      return propertyType;
  }
}
