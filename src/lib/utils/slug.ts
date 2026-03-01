/**
 * Generate a URL-friendly slug from a string
 */
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')  // Remove special chars
    .replace(/\s+/g, '-')       // Spaces to hyphens
    .replace(/-+/g, '-')        // Collapse multiple hyphens
    .replace(/^-|-$/g, '');     // Trim leading/trailing hyphens
};
