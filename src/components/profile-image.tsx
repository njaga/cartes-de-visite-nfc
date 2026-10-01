"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

type Props = Omit<ImageProps, "src" | "onError"> & {
  src: string;
  fallbackSrc?: string;
  fallbackText?: string;
};

export function ProfileImage({
  src,
  fallbackSrc,
  fallbackText,
  ...props
}: Props) {
  const [failedSrc, setFailedSrc] = useState<string>();
  const displaySrc = failedSrc === src ? fallbackSrc : src;
  if (!displaySrc)
    return (
      <span className="vp-initials" aria-label={props.alt || undefined}>
        {fallbackText || ""}
      </span>
    );
  return (
    <Image
      {...props}
      src={displaySrc}
      unoptimized
      onError={() => setFailedSrc(src)}
    />
  );
}
