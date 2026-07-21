import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isModerationPage = req.nextUrl.pathname.startsWith("/moderation");

    if (isModerationPage && !token?.isModerator) {
      return NextResponse.redirect(new URL("/forbidden", req.url));
    }
  },
  {
    pages: {
      signIn: "/login",
    },
    callbacks: {
      authorized({ token }) {
        return !!token;
      },
    },
  },
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/snippets/:path*",
    "/reviews/:path*",
    "/profile/:path*",
    "/moderation/:path*",
    "/leaderboard/:path*",
  ],
};
