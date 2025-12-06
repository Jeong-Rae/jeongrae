import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * H1
 */
const typographyH1Variants = cva(
  "scroll-m-20 text-4xl font-extrabold tracking-tight text-balance",
)
export type TypographyH1Props = React.ComponentProps<"h1"> &
  VariantProps<typeof typographyH1Variants> & { asChild?: boolean }

export function TypographyH1({
  className,
  asChild = false,
  ...props
}: TypographyH1Props) {
  const Comp = asChild ? Slot : "h1"
  return (
    <Comp
      data-slot="typography-h1"
      className={cn(typographyH1Variants(), className)}
      {...props}
    />
  )
}

/**
 * H2
 */
const typographyH2Variants = cva(
  "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
)
export type TypographyH2Props = React.ComponentProps<"h2"> &
  VariantProps<typeof typographyH2Variants> & { asChild?: boolean }

export function TypographyH2({
  className,
  asChild = false,
  ...props
}: TypographyH2Props) {
  const Comp = asChild ? Slot : "h2"
  return (
    <Comp
      data-slot="typography-h2"
      className={cn(typographyH2Variants(), className)}
      {...props}
    />
  )
}

/**
 * H3
 */
const typographyH3Variants = cva(
  "scroll-m-20 text-2xl font-semibold tracking-tight",
)
export type TypographyH3Props = React.ComponentProps<"h3"> &
  VariantProps<typeof typographyH3Variants> & { asChild?: boolean }

export function TypographyH3({
  className,
  asChild = false,
  ...props
}: TypographyH3Props) {
  const Comp = asChild ? Slot : "h3"
  return (
    <Comp
      data-slot="typography-h3"
      className={cn(typographyH3Variants(), className)}
      {...props}
    />
  )
}

/**
 * H4
 */
const typographyH4Variants = cva(
  "scroll-m-20 text-xl font-semibold tracking-tight",
)
export type TypographyH4Props = React.ComponentProps<"h4"> &
  VariantProps<typeof typographyH4Variants> & { asChild?: boolean }

export function TypographyH4({
  className,
  asChild = false,
  ...props
}: TypographyH4Props) {
  const Comp = asChild ? Slot : "h4"
  return (
    <Comp
      data-slot="typography-h4"
      className={cn(typographyH4Variants(), className)}
      {...props}
    />
  )
}

/**
 * P
 */
const typographyPVariants = cva(
  "leading-7 [&:not(:first-child)]:mt-6",
)
export type TypographyPProps = React.ComponentProps<"p"> &
  VariantProps<typeof typographyPVariants> & { asChild?: boolean }

export function TypographyP({
  className,
  asChild = false,
  ...props
}: TypographyPProps) {
  const Comp = asChild ? Slot : "p"
  return (
    <Comp
      data-slot="typography-p"
      className={cn(typographyPVariants(), className)}
      {...props}
    />
  )
}

/**
 * Blockquote
 */
const typographyBlockquoteVariants = cva(
  "mt-6 border-l-2 pl-6 italic",
)
export type TypographyBlockquoteProps = React.ComponentProps<"blockquote"> &
  VariantProps<typeof typographyBlockquoteVariants> & { asChild?: boolean }

export function TypographyBlockquote({
  className,
  asChild = false,
  ...props
}: TypographyBlockquoteProps) {
  const Comp = asChild ? Slot : "blockquote"
  return (
    <Comp
      data-slot="typography-blockquote"
      className={cn(typographyBlockquoteVariants(), className)}
      {...props}
    />
  )
}

/**
 * List
 */
const typographyListVariants = cva(
  "my-6 ml-6 list-disc [&>li]:mt-2",
)
export type TypographyListProps = React.ComponentProps<"ul"> &
  VariantProps<typeof typographyListVariants> & { asChild?: boolean }

export function TypographyList({
  className,
  asChild = false,
  ...props
}: TypographyListProps) {
  const Comp = asChild ? Slot : "ul"
  return (
    <Comp
      data-slot="typography-list"
      className={cn(typographyListVariants(), className)}
      {...props}
    />
  )
}

/**
 * Lead
 */
const typographyLeadVariants = cva(
  "text-muted-foreground text-xl",
)
export type TypographyLeadProps = React.ComponentProps<"p"> &
  VariantProps<typeof typographyLeadVariants> & { asChild?: boolean }

export function TypographyLead({
  className,
  asChild = false,
  ...props
}: TypographyLeadProps) {
  const Comp = asChild ? Slot : "p"
  return (
    <Comp
      data-slot="typography-lead"
      className={cn(typographyLeadVariants(), className)}
      {...props}
    />
  )
}

/**
 * Large
 */
const typographyLargeVariants = cva(
  "text-lg font-semibold",
)
export type TypographyLargeProps = React.ComponentProps<"div"> &
  VariantProps<typeof typographyLargeVariants> & { asChild?: boolean }

export function TypographyLarge({
  className,
  asChild = false,
  ...props
}: TypographyLargeProps) {
  const Comp = asChild ? Slot : "div"
  return (
    <Comp
      data-slot="typography-large"
      className={cn(typographyLargeVariants(), className)}
      {...props}
    />
  )
}

/**
 * Small
 */
const typographySmallVariants = cva(
  "text-sm leading-none font-medium",
)
export type TypographySmallProps = React.ComponentProps<"small"> &
  VariantProps<typeof typographySmallVariants> & { asChild?: boolean }

export function TypographySmall({
  className,
  asChild = false,
  ...props
}: TypographySmallProps) {
  const Comp = asChild ? Slot : "small"
  return (
    <Comp
      data-slot="typography-small"
      className={cn(typographySmallVariants(), className)}
      {...props}
    />
  )
}

/**
 * Muted
 */
const typographyMutedVariants = cva(
  "text-muted-foreground text-sm",
)
export type TypographyMutedProps = React.ComponentProps<"p"> &
  VariantProps<typeof typographyMutedVariants> & { asChild?: boolean }

export function TypographyMuted({
  className,
  asChild = false,
  ...props
}: TypographyMutedProps) {
  const Comp = asChild ? Slot : "p"
  return (
    <Comp
      data-slot="typography-muted"
      className={cn(typographyMutedVariants(), className)}
      {...props}
    />
  )
}
