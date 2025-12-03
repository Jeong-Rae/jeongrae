import { isArray } from "es-toolkit/compat"

type QueryInput = string | string[] | undefined
type ParseType = "string" | "number" | "boolean" | "object"

function takeFirst(value: QueryInput): string | undefined {
  if (isArray(value)) return value[0]
  return value
}

function parseString(
  value: QueryInput,
  defaultValue?: string,
): string | undefined {
  const raw = takeFirst(value)
  return raw ?? defaultValue
}

function parseNumber(
  value: QueryInput,
  defaultValue?: number,
): number | undefined {
  const raw = takeFirst(value)
  if (raw == null) return defaultValue

  const parsed = Number(raw)
  return Number.isNaN(parsed) ? defaultValue : parsed
}

function parseBoolean(
  value: QueryInput,
  defaultValue?: boolean,
): boolean | undefined {
  const raw = takeFirst(value)
  if (raw == null) return defaultValue

  switch (raw.toLowerCase()) {
    case "true":
    case "1":
      return true
    case "false":
    case "0":
      return false
    default:
      return defaultValue
  }
}

function parseObject<T = Record<string, any>>(
  value: QueryInput,
  defaultValue?: T,
): T | undefined {
  const raw = takeFirst(value)
  if (raw == null) return defaultValue

  try {
    return JSON.parse(raw) as T
  } catch {
    return defaultValue
  }
}

export function getQueryParam(
  value: QueryInput,
  type?: undefined,
  defaultValue?: string,
): string | undefined

export function getQueryParam(
  value: QueryInput,
  type: "string",
  defaultValue?: string,
): string | undefined

export function getQueryParam(
  value: QueryInput,
  type: "number",
  defaultValue?: number,
): number | undefined

export function getQueryParam(
  value: QueryInput,
  type: "boolean",
  defaultValue?: boolean,
): boolean | undefined

export function getQueryParam<T = Record<string, any>>(
  value: QueryInput,
  type: "object",
  defaultValue?: T,
): T | undefined

export function getQueryParam(
  value: QueryInput,
  type: ParseType = "string",
  defaultValue?: unknown,
): unknown {
  switch (type) {
    case "string":
      return parseString(value, defaultValue as string)

    case "number":
      return parseNumber(value, defaultValue as number)

    case "boolean":
      return parseBoolean(value, defaultValue as boolean)

    case "object":
      return parseObject(value, defaultValue as Record<string, any>)

    default:
      return defaultValue
  }
}