const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";

export type CloudinaryCrop = "fill" | "fit" | "scale" | "thumb";

export interface CloudinaryOptions {
  width?: number;
  height?: number;
  crop?: CloudinaryCrop;
}

export function buildImageUrl(
  publicId: string,
  options: CloudinaryOptions = {}
): string {
  if (!publicId) return "";
  // If it's already a full Cloudinary URL, extract the public ID
  if (publicId.startsWith("http")) {
    // If it's a full URL from a different host or no cloud name, return as-is
    if (!CLOUD_NAME || !publicId.includes("cloudinary.com")) return publicId;
    const match = publicId.match(/\/upload\/(?:[^/]+\/)*(.+)$/);
    publicId = match ? match[1] : publicId;
  }
  // No cloud name configured — return empty (component will render fallback)
  if (!CLOUD_NAME) return "";
  const { width, height, crop = "fill" } = options;
  const transforms: string[] = ["f_auto", "q_auto"];
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (width || height) transforms.push(`c_${crop}`);
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms.join(",")}/${publicId}`;
}
