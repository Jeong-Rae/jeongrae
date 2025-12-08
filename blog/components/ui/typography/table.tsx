import type { ReactNode } from "react";

export function TypographyTable({ children }: { children: ReactNode }) {
  return (
    <div className="my-6 w-full overflow-y-auto">
      <table className="w-full">{children}</table>
    </div>
  );
}
