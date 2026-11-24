"use client";

import { useDeferredValue, useState } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";

interface PhotoUrlPreviewProps {
  url: string;
  label: string;
  className?: string;
}

export default function PhotoUrlPreview({ url, label, className = "w-20 h-14" }: PhotoUrlPreviewProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const deferredUrl = useDeferredValue(url);

  const value = deferredUrl.trim();
  const isValidUrl = value !== "" && /^https?:\/\//i.test(value) && URL.canParse(value);
  const failed = failedUrl === value;

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-btn bg-surface-muted flex items-center justify-center ${className}`}
      role="img"
      aria-label={label}
    >
      {isValidUrl && !failed ? (
        <Image
          src={value}
          alt=""
          fill
          sizes="80px"
          unoptimized
          className="object-cover"
          onError={() => setFailedUrl(value)}
        />
      ) : (
        <ImageIcon size={20} className="text-muted" aria-hidden="true" />
      )}
    </div>
  );
}