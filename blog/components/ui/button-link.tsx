"use client";

import * as React from "react";
import Link, { type LinkProps } from "next/link";
import { Button } from "@/components/ui/button";

type ButtonLinkProps = {
  href?: LinkProps["href"];
  children: React.ReactNode;
  disabled?: boolean;

  prefetch?: LinkProps["prefetch"];
  replace?: LinkProps["replace"];
  scroll?: LinkProps["scroll"];
  shallow?: LinkProps["shallow"];
} & Omit<React.ComponentProps<typeof Button>, "asChild" | "children">;

export function ButtonLink({
  href,
  children,
  disabled,
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

  return (
    <Button asChild {...buttonProps}>
      <Link
        href={href}
        prefetch={prefetch}
        replace={replace}
        scroll={scroll}
        shallow={shallow}
      >
        {children}
      </Link>
    </Button>
  );
}
