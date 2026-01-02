import { isBrowser } from "es-toolkit";
import { useCallback } from "react";

type DownloadParams = {
  filename: string;
  content: string;
  mime?: string;
};

export function useTextDownload() {
  return useCallback(
    ({ filename, content, mime = "text/plain" }: DownloadParams) => {
      if (!isBrowser()) return;
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
    },
    [],
  );
}
