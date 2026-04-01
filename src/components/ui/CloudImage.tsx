import { buildImageUrl, CloudinaryOptions } from "@/lib/cloudinary";

interface CloudImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  publicId: string;
  width?: number;
  height?: number;
  crop?: CloudinaryOptions["crop"];
  priority?: boolean;
  fallbackSrc?: string;
}

export function CloudImage({
  publicId, width, height, crop,
  alt = "", className, priority = false, fallbackSrc, ...rest
}: CloudImageProps) {
  const src = buildImageUrl(publicId, { width, height, crop });
  // If we get a full HTTP url back (non-cloudinary or cloudinary direct), use it as-is
  const imgSrc = src || fallbackSrc || "";
  if (!imgSrc) return null;
  return (
    <img
      src={imgSrc} alt={alt} width={width} height={height}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      className={className} {...rest}
    />
  );
}
