import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { getSession, type User } from "@/lib/auth-client";

const protectedPaths = ["/dashboard", "/bookings", "/settings", "/admin"];
const adminPaths = ["/admin"];

function getCallbackUrl(request: NextRequest) {
  const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");

  if (!callbackUrl?.startsWith("/") || callbackUrl.startsWith("//")) return null;

  return new URL(callbackUrl, request.url);
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  let user: User | undefined;
  try {
    const session = await getSession({
      fetchOptions: { headers: await headers() },
    });
    user = session.data?.user;
  } catch {
    user = undefined;
  }

  const isAuthenticated = !!user;

  const isProtectedRoute = protectedPaths.some((path) => pathname.startsWith(path));
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  const isAdminRoute = adminPaths.some((path) => pathname.startsWith(path));
  if (isAdminRoute && user?.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname === "/dashboard" && user?.role === "admin") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  const isAuthRoute = pathname.startsWith("/auth");
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(getCallbackUrl(request) ?? new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|uploads|favicon.ico|robots.txt|sitemap.xml|manifest.json|.*\\.(?:ico|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot|csv)).*)",
  ],
};
