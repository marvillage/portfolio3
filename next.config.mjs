/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // basic hardening for every page: no MIME sniffing, no framing by other sites, no
  // camera/mic/location access, and referrers trimmed to the origin
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  // The Daily Commit moved to its own site; links already shared keep working
  async redirects() {
    const DC = "https://dailycommit-gh.vercel.app";
    return [
      { source: "/daily-commit", destination: `${DC}/`, permanent: true },
      { source: "/api/daily-commit/og", destination: `${DC}/api/og`, permanent: true },
      { source: "/api/daily-commit/page-image", destination: `${DC}/api/page-image`, permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "github-readme-stats.vercel.app" },
      { protocol: "https", hostname: "leetcard.jacoblin.cool" },
      { protocol: "https", hostname: "streak-stats.demolab.com" },
      { protocol: "https", hostname: "github-readme-streak-stats.herokuapp.com" },
    ],
  },
};

export default nextConfig;
