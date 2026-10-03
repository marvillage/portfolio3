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
