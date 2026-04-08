const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";

export type CloudinaryCrop = "fill" | "fit" | "scale" | "thumb";

export interface CloudinaryOptions {
  width?: number;
  height?: number;
  crop?: CloudinaryCrop;
}

/**
 * Builds a Cloudinary image URL from a publicId or returns a full URL as-is.
 *
 * Rules:
 *  - Full HTTP/HTTPS URL → returned unchanged (backend already gave us the final URL)
 *  - Plain Cloudinary public ID (e.g. "stores/logo_abc") → builds a URL with transforms
 *  - Empty / no cloud name → returns ""
 */
export function buildImageUrl(
  publicId: string,
  options: CloudinaryOptions = {}
): string {
  if (!publicId || publicId.trim() === "") return "";

  // If backend already returns a full URL, use it directly — no re-processing
  if (publicId.startsWith("http://") || publicId.startsWith("https://")) {
    return publicId;
  }

  // Need cloud name to build a Cloudinary URL from a public ID
  if (!CLOUD_NAME) return "";

  const { width, height, crop = "fill" } = options;
  const transforms: string[] = ["f_auto", "q_auto"];
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (width || height) transforms.push(`c_${crop}`);

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms.join(",")}/${publicId}`;
}
