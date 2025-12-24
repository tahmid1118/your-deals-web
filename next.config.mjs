/** @type {import('next').NextConfig} */
const nextConfig = {
    basePath: "",
    reactStrictMode: false,
    async redirects() {
      return [
          {
        source: "/",
        destination: "/en/login",
        permanent: true,
      },
      ];
    },
  
    images: {
      domains: ["bdtmp.ultra-x.jp"],
    },
  };
  
  export default nextConfig;
  