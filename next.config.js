/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/guess-the-name",
        destination: "/name-quest",
        permanent: true,
      },
      {
        source: "/marble-royale",
        destination: "/marble-battles",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
