import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin-only routes
    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // Responsible + Admin routes
    if (
      path.startsWith("/responsible") &&
      token?.role !== "RESPONSIBLE" &&
      token?.role !== "ADMIN"
    ) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Runs before middleware() — if it returns false, redirect to signIn page
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

// Which routes the middleware should run on
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/responsible/:path*",
    "/profile/:path*",
  ],
};