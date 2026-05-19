"use client";

import { useState } from "react";
import { buildImageUrl, CloudinaryOptions } from "@/lib/cloudinary";

interface CloudImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  publicId: string;
  width?: number;
  height?: number;
  crop?: CloudinaryOptions["crop"];
  priority?: boolean;
  /** Rendered when the image fails to load or has no src */
  fallback?: React.ReactNode;
}

export function CloudImage({
  publicId,
  width,
  height,
  crop,
  alt = "",
  className,
  priority = false,
  fallback = null,
  ...rest
}: CloudImageProps) {
  const src = buildImageUrl(publicId, { width, height, crop });
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return fallback ? <>{fallback}</> : null;
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      className={className}
      onError={() => setFailed(true)}
      {...rest}
    />
  );
}
