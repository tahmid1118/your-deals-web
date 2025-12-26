/** @type {import('next').NextConfig} */
const nextConfig = {
    basePath: "",
    reactStrictMode: false,
    async redirects() {
      return [
          {
        source: "/",
        destination: "/en/user-dashboard",
        permanent: true,
      },
      ];
    },
  
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'bdtmp.ultra-x.jp',
        },
        {
          protocol: 'http',
          hostname: 'localhost',
        },
        {
          protocol: 'http',
          hostname: '192.168.0.102',
        },
        {
          protocol: 'http',
          hostname: '192.168.88.49',
        },
      ],
      dangerouslyAllowSVG: true,
      unoptimized: true,
    },
  };
  
  export default nextConfig;
  