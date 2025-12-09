"use client";

import Link, { type LinkProps } from "next/link";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { ComponentProps, ReactNode } from "react";

type LinkMode = "internal" | "external";

type ButtonLinkProps = {
  href?: LinkProps["href"];
  children: ReactNode;
  disabled?: boolean;

  mode?: LinkMode;
  withIcon?: boolean;

  prefetch?: LinkProps["prefetch"];
  replace?: LinkProps["replace"];
  scroll?: LinkProps["scroll"];
  shallow?: LinkProps["shallow"];
} & Omit<ComponentProps<typeof Button>, "asChild" | "children">;

type TunedLinkProps = {
  prefetch?: LinkProps["prefetch"];
  replace?: LinkProps["replace"];
  scroll?: LinkProps["scroll"];
  shallow?: LinkProps["shallow"];
  target?: string;
  rel?: string;
};

export function ButtonLink({
  href,
  children,
  disabled,
  mode = "external",
  withIcon = false,
  prefetch,
  replace,
  scroll,
  shallow,
  ...buttonProps
}: ButtonLinkProps) {
  if (disabled || !href) {
    return (
      <Button disabled {...buttonProps}>
        {children}
      </Button>
    );
  }

  const isExternal = mode === "external";

  const linkProps: TunedLinkProps = {
    prefetch,
    replace,
    scroll,
    shallow,
  };

  if (isExternal) {
    linkProps.target = "_blank";
    linkProps.rel = "noopener noreferrer";
    delete linkProps.shallow;
    delete linkProps.scroll;
  } else {
    if (linkProps.shallow === undefined) {
      linkProps.shallow = true;
    }
    if (linkProps.scroll === undefined) {
      linkProps.scroll = false;
    }
  }

  return (
    <Button asChild {...buttonProps}>
      <Link href={href} {...linkProps} className="flex items-center gap-1">
        {children}
        {isExternal && withIcon && (
          <ExternalLink className="h-3 w-3 opacity-70" />
        )}
      </Link>
    </Button>
  );
}
