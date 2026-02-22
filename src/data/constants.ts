/**
 * Area = famous neighbourhood (e.g. Silom, Sukhumvit)
 * Used for filters and restaurant listing.
 */
export const AREAS = [
  "Sukhumvit",
  "Silom",
  "Thonglor",
  "Siam",
  "Chinatown",
  "Riverside",
  "Ari",
  "Asok",
  "Phrom Phong",
  "Ekkamai",
] as const;

/**
 * Cuisine types - enum-like list for restaurant tags.
 * Used for filters and restaurant form (multi-select).
 */
export const CUISINES = [
  "Thai",
  "Burmese",
  "Indian",
  "Chinese",
  "Korean",
  "Seafood",
  "Vegetarian",
  "Asian",
] as const;

export type Area = (typeof AREAS)[number];
export type Cuisine = (typeof CUISINES)[number];
