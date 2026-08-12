// Mirrors PRODUCT_CATEGORIES in the seller dashboard's "Add Product" form —
// the category names sellers pick from when listing an item. A handful of
// older product records only ever got the raw category id persisted instead
// of its resolved name (e.g. "1" instead of "Clothing & Fashion"); this maps
// those ids back to the same name so they group and filter correctly.
export const CATEGORY_NAMES = [
  "Clothing & Fashion",
  "Electronics & Gadgets",
  "Beauty & Personal Care",
  "Bags & Accessories",
  "Home & Living",
  "Jewelry",
  "Books",
  "Other",
];

export function resolveCategoryName(category?: string | null): string | null {
  if (!category) return null;
  if (/^\d+$/.test(category)) {
    return CATEGORY_NAMES[Number(category) - 1] ?? category;
  }
  return category;
}
