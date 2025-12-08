import NextImage, { type ImageProps as NextImageProps } from "next/image";
import type { StaticImageData } from "next/image";

interface CustomImageProps extends Omit<NextImageProps, "src"> {
  src: StaticImageData | string;
  caption?: string;
}

export function Image({ src, alt, caption, ...props }: CustomImageProps) {
  return (
    <figure className="my-8 flex flex-col items-center justify-center">
      <NextImage
        src={src}
        alt={alt}
        width={200}
        height={200}
        className="w-3/4 h-auto rounded-lg border border-border"
        placeholder={typeof src === "object" ? "blur" : undefined}
        {...props}
      />
      {caption && (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
