/** @type {import('next').NextConfig} */
const nextConfig = {
  // Defense-in-depth response headers. This app is a private, single-user
  // tool for real personal financial data, so these are set unconditionally
  // (not just for a "public site" case) to reduce clickjacking, MIME
  // sniffing, and referrer-leak risk on every response.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
