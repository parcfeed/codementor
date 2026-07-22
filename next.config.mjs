/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          { key: "X-XSS-Protection", value: "0" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            // CSP :
            //   - 'unsafe-inline' sur script-src : next-themes (FOUC),
            //     Next.js App Router (_NEXT_DATA_ bootstrap inline)
            //   - 'unsafe-eval' en dev : Fast Refresh (eval() interne)
            //   - cdn.jsdelivr.net : Monaco Editor (@monaco-editor/react)
            //   - worker-src blob: : web workers de Monaco (syntax highlighting)
            key: "Content-Security-Policy",
            value: (() => {
              const isDev = process.env.NODE_ENV === "development";
              const scriptSrc = isDev
                ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net"
                : "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net";
              return [
                "default-src 'self'",
                `${scriptSrc}`,
                "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
                "worker-src 'self' blob:",
                "connect-src 'self' https://cdn.jsdelivr.net",
                "font-src 'self' data: https://cdn.jsdelivr.net",
                "frame-ancestors 'none'",
              ].join("; ");
            })(),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
