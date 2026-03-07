import HomeClient from "@/components/HomeClient";
import { fetchLiveCells } from "@/lib/data-fetcher";
import { SAMPLE_CELLS } from "@/data/cells";

// Obligamos a Cloudflare/Vercel a usar el Edge Runtime y renderizado dinámico
export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function Page() {
  let initialData = SAMPLE_CELLS;
  try {
    initialData = await fetchLiveCells();
  } catch (error) {
    console.error("Failed to fetch live cells on server:", error);
  }

  return (
    <div className="w-full h-full min-h-screen bg-background">
      <HomeClient initialData={initialData} />
    </div>
  );
}
