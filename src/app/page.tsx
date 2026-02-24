// src/app/page.tsx
import HomeClient from "@/components/HomeClient";

// Esta línea es el "seguro de vida" contra el error 404 en Vercel
export const dynamic = "force-dynamic";

export default function Page() {
  return <HomeClient />;
}
