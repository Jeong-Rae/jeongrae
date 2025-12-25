import { createHash } from "node:crypto";

/**
 * name -> stable id
 * - sha256(name) hex
 * - 짧게 쓰려면 slice 길이 조절
 */
export function toolIdFromName(name: string): string {
  return createHash("sha256").update(name, "utf8").digest("hex").slice(0, 16);
}
