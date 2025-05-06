import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  // Clone the request headers
  const requestHeaders = new Headers(request.headers);

  // Add the pathname to a custom header
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  // Get the session token
  const session = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Check if the path is in the platform directory (protected route)
  if (request.nextUrl.pathname.startsWith("/platform")) {
    // If the user is not logged in, redirect to the login page
    if (!session) {
      const url = new URL("/auth/login", request.url);
      url.searchParams.set("callbackUrl", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  // Check if the user is trying to access auth pages while already logged in
  if (request.nextUrl.pathname.startsWith("/auth") && session) {
    // Redirect already authenticated users to the platform page
    return NextResponse.redirect(new URL("/platform", request.url));
  }

  // Return the response with the modified headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Match all paths except static files and public assets
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
    // match all paths including /platform
    "/platform/:path*",
  ],
};
