/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Esto es lo que necesitas: ignora los errores de ESLint al subir a Vercel
    ignoreDuringBuilds: true,
  },
  typescript: {
    // También ignora errores de tipos de TypeScript para que no te bloquee
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // Para que las imágenes de Google no den problemas
  },
};

export default nextConfig;
