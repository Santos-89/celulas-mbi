// src/app/page.tsx
import HomeClient from "@/components/HomeClient";

// Obligamos a Vercel a renderizar dinámicamente (adiós 404)
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <div className="w-full h-full min-h-screen bg-background">
      <HomeClient />
    </div>
  );
}
