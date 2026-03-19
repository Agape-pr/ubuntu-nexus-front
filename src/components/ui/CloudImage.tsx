import { buildImageUrl, CloudinaryOptions } from "@/lib/cloudinary";

interface CloudImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  publicId: string;
  width?: number;
  height?: number;
  crop?: CloudinaryOptions["crop"];
  priority?: boolean;
}

export function CloudImage({
  publicId, width, height, crop,
  alt = "", className, priority = false, ...rest
}: CloudImageProps) {
  const src = buildImageUrl(publicId, { width, height, crop });
  if (!src) return null;
  return (
    <img
      src={src} alt={alt} width={width} height={height}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      className={className} {...rest}
    />
  );
}
