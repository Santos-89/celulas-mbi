// src/app/page.tsx
import HomeClient from "@/components/HomeClient";

// Obligamos a Cloudflare/Vercel a usar el Edge Runtime y renderizado dinámico
export const runtime = "edge";
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <div className="w-full h-full min-h-screen bg-background">
      <HomeClient />
    </div>
  );
}
