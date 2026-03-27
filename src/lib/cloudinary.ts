const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

if (!CLOUD_NAME) {
  throw new Error("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set.");
}

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
  if (publicId.startsWith("http")) {
    const match = publicId.match(/\/upload\/(?:[^/]+\/)*(.+)$/);
    publicId = match ? match[1] : publicId;
  }
  const { width, height, crop = "fill" } = options;
  const transforms: string[] = ["f_auto", "q_auto"];
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (width || height) transforms.push(`c_${crop}`);
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms.join(",")}/${publicId}`;
}
