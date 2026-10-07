export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.indanga.com";

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
