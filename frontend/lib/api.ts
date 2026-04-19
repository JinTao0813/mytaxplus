export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getApiBase(): string {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  return base.replace(/\/$/, "");
}

export type FetchOptions = RequestInit & {
  token?: string | null;
};

type IdTokenUser = {
  getIdToken?: (forceRefresh?: boolean) => Promise<string>;
};

export async function getTokenForApi(user: unknown): Promise<string | undefined> {
  const u = user as IdTokenUser | null | undefined;
  if (!u || typeof u.getIdToken !== "function") return undefined;
  try {
    return await u.getIdToken();
  } catch {
    return undefined;
  }
}

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { token, headers: initHeaders, ...rest } = options;
  const url = `${getApiBase()}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(initHeaders);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(url, { ...rest, headers });
  const text = await res.text();
  let data: unknown = text;
  if (text.length > 0) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!res.ok) {
    throw new ApiError(`HTTP ${res.status}`, res.status, data);
  }
  return data as T;
}
