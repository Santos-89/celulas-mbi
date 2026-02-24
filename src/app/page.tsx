// src/app/page.tsx
import HomeClient from "@/components/HomeClient";

// 1. Forzamos a que la página se genere en el servidor en cada petición
export const dynamic = "force-dynamic";

// 2. Evitamos que Vercel intente guardar una copia estática vacía
export const revalidate = 0;

export default function Page() {
  return (
    // Envolvemos el cliente para asegurar que el HTML inicial exista
    <div className="min-h-screen bg-background">
      <HomeClient />
    </div>
  );
}
