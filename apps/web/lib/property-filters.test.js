import assert from "node:assert/strict";
import test from "node:test";

import { buildHousesUrl } from "./property-filters.js";

test("buildHousesUrl omits the property type filter for the all category", () => {
  const url = buildHousesUrl(1, { propertyType: "all", budget: "any" });

  assert.match(url, /\/houses\?/);
  assert.doesNotMatch(url, /propertyType=/);
});

test("buildHousesUrl maps the homes category to the supported house values", () => {
  const url = buildHousesUrl(1, { propertyType: "houses", budget: "any" });

  assert.match(url, /propertyType=House%2CApartment%2CStudio/);
});

test("buildHousesUrl sends a hotel filter for the hotels category", () => {
  const url = buildHousesUrl(1, { propertyType: "hotels", budget: "any" });

  assert.match(url, /propertyType=Hotel/);
});

test("buildHousesUrl sends a car filter for the cars category", () => {
  const url = buildHousesUrl(1, { propertyType: "cars", budget: "any" });

  assert.match(url, /propertyType=Car/);
});
