import NextImage, { type ImageProps as NextImageProps } from "next/image";
import type { StaticImageData } from "next/image";
import { cn } from "@/lib/utils";

interface CustomImageProps extends Omit<NextImageProps, "src"> {
  src: StaticImageData | string;
  caption?: string;
  border?: boolean;
  wide?: boolean;
}

export function Image({
  src,
  alt,
  caption,
  border = false,
  wide = false,
  width = 200,
  height = 200,
  fill,
  className,
  ...props
}: CustomImageProps) {
  return (
    <figure className="my-8 flex flex-col items-center justify-center">
      <NextImage
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        placeholder={typeof src === "object" ? "blur" : undefined}
        className={cn(
          "h-auto rounded-lg",
          wide && "w-3/4",
          border && "border border-border",
          className,
        )}
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
