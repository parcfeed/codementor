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
            // CSP : 'unsafe-inline' sur script-src est necessaire pour :
            //   - next-themes (script inline de theme FOUC)
            //   - Next.js App Router (bootstrap inline _NEXT_DATA_)
            // 'unsafe-eval' est necessaire en dev (Fast Refresh utilise eval()),
            // mais retire en prod car inutile dans le bundle buildé.
            key: "Content-Security-Policy",
            value: (() => {
              const isDev = process.env.NODE_ENV === "development";
              const scriptSrc = isDev
                ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
                : "script-src 'self' 'unsafe-inline'";
              return `default-src 'self'; ${scriptSrc}; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'`;
            })(),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
