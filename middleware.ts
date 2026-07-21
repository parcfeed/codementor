import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "0");
  return response;
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isModerationPage = req.nextUrl.pathname.startsWith("/moderation");

    if (isModerationPage && !token?.isModerator) {
      return addSecurityHeaders(
        NextResponse.redirect(new URL("/forbidden", req.url)),
      );
    }

    return addSecurityHeaders(NextResponse.next());
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
