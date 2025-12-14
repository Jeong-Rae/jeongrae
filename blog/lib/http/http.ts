import { isEmpty, isNil, isObjectLike } from "es-toolkit/compat";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type HttpRequestOptions<TBody = unknown> = {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: TBody;
  query?: Record<string, string | number | boolean | null | undefined>;
  signal?: AbortSignal;
  credentials?: RequestCredentials;
  cache?: RequestCache;
};

export type HttpErrorPayload = unknown;

export class HttpError extends Error {
  public readonly status: number;
  public readonly payload: HttpErrorPayload;

  constructor(args: {
    status: number;
    message: string;
    payload: HttpErrorPayload;
  }) {
    super(args.message);
    this.name = "HttpError";
    this.status = args.status;
    this.payload = args.payload;
  }
}

const buildUrl = (url: string, query?: HttpRequestOptions["query"]) => {
  if (isNil(query) || isEmpty(query)) {
    return url;
  }

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (isNil(value)) {
      continue;
    }

    params.set(key, String(value));
  }

  const queryString = params.toString();

  if (isEmpty(queryString)) {
    return url;
  }

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${queryString}`;
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return (await response.text()) as unknown as T;
  }

  return (await response.json()) as T;
};

const isJsonPayload = (body: unknown) =>
  !isNil(body) && isObjectLike(body) && !(body instanceof FormData);

const buildBody = (body: unknown): BodyInit | undefined => {
  if (isNil(body)) {
    return undefined;
  }

  if (isJsonPayload(body)) {
    return JSON.stringify(body);
  }

  return body as BodyInit;
};

const buildHeaders = (
  headers: HttpRequestOptions["headers"],
  body: unknown,
): Record<string, string> => {
  const requestHeaders = { ...(headers ?? {}) };

  if (isJsonPayload(body)) {
    requestHeaders["Content-Type"] ??= "application/json";
  }

  return requestHeaders;
};

const readErrorPayload = async (response: Response) => {
  try {
    return await parseResponse<unknown>(response);
  } catch {
    return null;
  }
};

export type HttpClient = {
  request: <TResponse, TBody = unknown>(
    url: string,
    options?: HttpRequestOptions<TBody>,
  ) => Promise<TResponse>;

  get: <TResponse>(
    url: string,
    options?: Omit<HttpRequestOptions<never>, "method" | "body">,
  ) => Promise<TResponse>;

  post: <TResponse, TBody = unknown>(
    url: string,
    options?: Omit<HttpRequestOptions<TBody>, "method">,
  ) => Promise<TResponse>;
};

export const http: HttpClient = {
  async request<TResponse, TBody = unknown>(
    url: string,
    options: HttpRequestOptions<TBody> = {},
  ) {
    const {
      method = "GET",
      headers,
      body,
      query,
      signal,
      credentials,
      cache,
    } = options;

    const finalUrl = buildUrl(url, query);

    const response = await fetch(finalUrl, {
      method,
      headers: buildHeaders(headers, body),
      body: buildBody(body),
      signal,
      credentials,
      cache,
    });

    if (response.ok) {
      return await parseResponse<TResponse>(response);
    }

    const payload = await readErrorPayload(response);

    throw new HttpError({
      status: response.status,
      message: `HTTP Error ${response.status}`,
      payload,
    });
  },

  get<TResponse>(url: string, options = {}) {
    return http.request<TResponse>(url, { ...options, method: "GET" });
  },

  post<TResponse, TBody = unknown>(
    url: string,
    options: Omit<HttpRequestOptions<TBody>, "method"> = {},
  ) {
    return http.request<TResponse, TBody>(url, { ...options, method: "POST" });
  },
};
