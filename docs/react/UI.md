# Shared UI Components (@jeongrae/ui)

`@jeongrae/ui`에서 가져옵니다. 내부적으로 shadcn/ui 프리미티브(Radix UI)를 기반으로 구성되어 있습니다.

## Alert

Components:
- `Alert`
- `AlertTitle`
- `AlertDescription`

Props:
- `Alert`: `React.HTMLAttributes<HTMLDivElement>` + `variant?: "default" | "destructive"`.
- `AlertTitle`: `React.HTMLAttributes<HTMLHeadingElement>`.
- `AlertDescription`: `React.HTMLAttributes<HTMLParagraphElement>`.

Return:
- `JSX.Element`.

Example:
```tsx
<Alert variant="destructive">
  <AlertTitle>Warning</AlertTitle>
  <AlertDescription>Something went wrong.</AlertDescription>
</Alert>
```

## Badge

Props:
- `variant?: "default" | "secondary" | "destructive" | "outline"`.
- `asChild?: boolean` (Radix Slot).
- `React.ComponentProps<"span">`.

Return:
- `JSX.Element`.

Example:
```tsx
<Badge variant="secondary">Beta</Badge>
```

## Button

Props:
- `variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"`.
- `size?: "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg"`.
- `asChild?: boolean` (Radix Slot).
- `React.ComponentProps<"button">`.

Return:
- `JSX.Element`.

Example:
```tsx
<Button variant="outline" size="sm">Save</Button>
```

## ButtonLink

Props:
- `href?: LinkProps["href"]`.
- `mode?: "internal" | "external"` (default `"external"`).
- `withIcon?: boolean` (external link icon).
- `disabled?: boolean`.
- `prefetch`, `replace`, `scroll`, `shallow`.
- All `Button` props except `asChild` and `children`.

Return:
- `JSX.Element`.

Example:
```tsx
<ButtonLink href="/about" mode="internal">About</ButtonLink>
<ButtonLink href="https://example.com" withIcon>Docs</ButtonLink>
```

## Callout

Props:
- `type?: "note" | "tip" | "important" | "warning" | "caution" | string`.
- `title?: string` (default: `type`).
- `children: React.ReactNode`.
- `className?: string`.

Return:
- `JSX.Element`.

Example:
```tsx
<Callout type="warning" title="Heads up">
  This action is irreversible.
</Callout>
```

Presets:
```tsx
<Callout.Note>Note text</Callout.Note>
<Callout.Tip>Tip text</Callout.Tip>
```

## Card

Components:
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.

Props:
- Each accepts `React.HTMLAttributes<HTMLDivElement>`.

Return:
- `JSX.Element`.

Example:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Subtitle</CardDescription>
  </CardHeader>
  <CardContent>Body</CardContent>
</Card>
```

## IconButton

Props:
- `icon: React.ReactNode`.
- `label?: string` (used as `aria-label`, default `"Icon Button"`).
- `position?: "left" | "right"` (default `"left"`).
- `size?: "icon" | "icon-sm" | "icon-lg"` (default `"icon-sm"`).
- All `Button` props except `aria-label`.

Return:
- `JSX.Element`.

Example:
```tsx
<IconButton icon={<CopyIcon />} label="Copy" />
```

## Image

Props:
- `src: string | StaticImageData`.
- `alt: string`.
- `caption?: string`.
- `border?: boolean`.
- `wide?: boolean`.
- `width?: number` (default `200` when `fill` is false).
- `height?: number` (default `200` when `fill` is false).
- `fill?: boolean`.
- All `NextImage` props (except `src`).

Return:
- `JSX.Element`.

Example:
```tsx
<Image src="/hero.jpg" alt="Hero" width={800} height={400} border />
```

## Input

Props:
- `React.ComponentProps<"input">`.

Return:
- `JSX.Element`.

Example:
```tsx
<Input placeholder="Search..." />
```

## Pagination

Components:
- `Pagination`, `PaginationContent`, `PaginationItem`, `PaginationLink`,
  `PaginationPrevious`, `PaginationNext`, `PaginationEllipsis`.

Props:
- `Pagination`: `React.ComponentProps<"nav">`.
- `PaginationContent`: `React.ComponentProps<"ul">`.
- `PaginationItem`: `React.ComponentProps<"li">`.
- `PaginationLink`: `Link` props + `isActive?: boolean`, `isDisabled?: boolean`, `size?: "default" | "sm"`.
- `PaginationPrevious`/`PaginationNext`: same as `PaginationLink` (+ optional `children`).
- `PaginationEllipsis`: `React.ComponentProps<"span">`.

Return:
- `JSX.Element`.

Example:
```tsx
<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href="/?page=1" />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="/?page=2" isActive>
        2
      </PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationNext href="/?page=3" />
    </PaginationItem>
  </PaginationContent>
</Pagination>
```

## Tabs

Components:
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` (Radix UI Tabs).

Props:
- Match Radix Tabs props.

Return:
- `JSX.Element`.

Example:
```tsx
<Tabs defaultValue="tab-1">
  <TabsList>
    <TabsTrigger value="tab-1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab-2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab-1">Content 1</TabsContent>
  <TabsContent value="tab-2">Content 2</TabsContent>
</Tabs>
```

## Typography

Exports:
- `Typography` namespace object with `H1`, `H2`, `H3`, `H4`, `H5`, `H6`,
  `P`, `Pre`, `Blockquote`, `List`, `OrderedList`, `InlineCode`, `Lead`,
  `Large`, `Small`, `Muted`, `Table`, `Thead`, `Tbody`, `Tr`, `Th`, `Td`, `Link`.
- Individual components: `TypographyH1`, `TypographyH2`, ... (same list).

Selected props:
- `TypographyH1`: `{ children: ReactNode; withBorder?: boolean }` (default `false`).
- `TypographyH2`: `{ children: ReactNode; withBorder?: boolean }` (default `true`).
- `TypographyH5` / `TypographyH6`: `{ children: ReactNode; className?: string }`.
- `TypographyP`: `{ children: ReactNode; className?: string }`.
- `TypographyInlineCode`: `ComponentPropsWithoutRef<"code">`.
- `TypographyPre`: `ComponentPropsWithoutRef<"pre">`.
- `TypographyLink`: `{ href: string; children: ReactNode }` (opens in new tab).

Return:
- `JSX.Element`.

Example:
```tsx
<Typography.H1 withBorder>Heading</Typography.H1>
<Typography.P>Body text</Typography.P>
<Typography.InlineCode>const x = 1</Typography.InlineCode>
```
