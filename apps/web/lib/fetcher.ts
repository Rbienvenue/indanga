/*
 * A wrapper around the fetch API that adds the necessary url, credentials and headers
 * @param url - The URL to fetch
 * @param options - The options to pass to the fetch API
 * @returns The response from the API
 */
export async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1${url}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || "Request failed");
  }
  return response.json() as T;
}
