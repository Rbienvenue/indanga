import { API_BASE_URL } from "./api-url";

/*
 * A wrapper around the fetch API that adds the necessary url, credentials and headers
 * @param url - The URL to fetch
 * @param options - The options to pass to the fetch API
 * @returns The response from the API
 */
export async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const target = url.startsWith("http") ? url : `${API_BASE_URL}/v1${url}`;
  // Only send a JSON Content-Type when a body is actually present. Adding
  // it to bodyless requests triggers a needless CORS preflight, and setting
  // it on FormData would break the browser-generated multipart boundary.
  const hasJsonBody =
    options?.body !== undefined && options?.body !== null && !(options.body instanceof FormData);
  const response = await fetch(target, {
    ...options,
    credentials: "include",
    headers: {
      ...(hasJsonBody ? { "Content-Type": "application/json" } : undefined),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || "Request failed");
  }
  return response.json() as T;
}
