"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface SafeImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  onError?: () => void;
  priority?: boolean;
  unoptimized?: boolean;
}

/**
 * Composant d'image sécurisé qui utilise Next.js Image si possible,
 * sinon fallback sur une balise <img> native pour les URLs externes
 */
export function SafeImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
  onError,
  priority,
  unoptimized = false,
}: SafeImageProps) {
  const [useNativeImg, setUseNativeImg] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleError = () => {
    if (!useNativeImg) {
      // Si Next.js Image échoue, basculer vers <img> natif
      setUseNativeImg(true);
    } else {
      // Si <img> natif échoue aussi, appeler le callback d'erreur
      setImgError(true);
      onError?.();
    }
  };

  // Si on doit utiliser <img> natif (soit par erreur, soit si src est une URL externe non configurée)
  if (useNativeImg || imgError) {
    if (imgError) {
      return null; // Ne rien afficher si l'image ne peut pas être chargée
    }

    return (
      <img
        src={src}
        alt={alt}
        className={cn("object-cover", className)}
        style={fill ? { width: "100%", height: "100%", objectFit: "cover" } : undefined}
        onError={handleError}
      />
    );
  }

  // Essayer d'utiliser Next.js Image
  try {
    if (fill) {
      return (
        <Image
          src={src}
          alt={alt}
          fill
          className={className}
          onError={handleError}
          priority={priority}
          unoptimized={unoptimized}
        />
      );
    }

    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onError={handleError}
        priority={priority}
        unoptimized={unoptimized}
      />
    );
  } catch {
    // Si Next.js Image échoue à la construction, utiliser <img> natif
    return (
      <img
        src={src}
        alt={alt}
        className={cn("object-cover", className)}
        style={fill ? { width: "100%", height: "100%", objectFit: "cover" } : undefined}
        onError={handleError}
      />
    );
  }
}

