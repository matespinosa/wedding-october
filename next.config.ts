import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    /* AVIF primero: pesa ~20-30% menos que WebP con la misma calidad y lo
       soportan todos los navegadores actuales. Next cae a WebP y luego al
       original según lo que acepte el navegador. */
    formats: ["image/avif", "image/webp"],
    /* Las fotos no cambian nunca: un año de caché en el CDN en vez de 60s. */
    minimumCacheTTL: 31536000,
  },
};

export default nextConfig;
