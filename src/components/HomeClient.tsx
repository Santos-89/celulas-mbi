"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { CellDetail } from "@/components/CellDetail";
import { SAMPLE_CELLS } from "@/data/cells";
import { CellGroup } from "@/types";
import { fetchLiveCells } from "@/lib/data-fetcher";
import { Search, SlidersHorizontal, Map as MapIcon, List as ListIcon, X, Loader2 } from "lucide-react";
import { Badge, Card } from "@/components/ui/Card";
import { ThemeToggle } from "@/components/ThemeToggle";

const CellMap = dynamic(() => import("@/components/CellMap"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-card animate-pulse flex items-center justify-center text-gray-400">Cargando mapa...</div>
});

export default function HomeClient() {
  const [cells, setCells] = useState<CellGroup[]>(SAMPLE_CELLS);
  const [loading, setLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState<CellGroup | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<string>("Todas");
  const [filterDay, setFilterDay] = useState<string>("Todos");

  useEffect(() => {
    async function initData() {
      try {
        const liveData = await fetchLiveCells();
        setCells(liveData);
      } catch (err) {
        console.error("Could not load live data, using samples", err);
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, []);

  const filteredCells = useMemo(() => {
    return cells.filter((cell) => {
      const matchesSearch =
        cell.leaderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cell.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cell.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === "Todas" || cell.type === filterType;
      const matchesDay = filterDay === "Todos" || cell.day === filterDay;
      return matchesSearch && matchesType && matchesDay;
    });
  }, [cells, searchQuery, filterType, filterDay]);

  const isFiltered = searchQuery !== "" || filterType !== "Todas" || filterDay !== "Todos";

  const clearFilters = () => {
    setFilterType("Todas");
    setFilterDay("Todos");
    setSearchQuery("");
  };

  return (
    <main className="relative flex flex-col h-screen h-[100dvh] bg-background text-foreground overflow-hidden">
      {/* Tu JSX actual de búsqueda, filtros y contenido... */}
      {/* (Mantén el resto de tu código igual aquí abajo) */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 md:p-6 bg-gradient-to-b from-background/95 via-background/60 to-transparent backdrop-blur-[1px]">
         {/* ... (Contenido del Header que ya tienes) */}
      </div>
      
      <div className="flex-1 relative overflow-hidden">
        {viewMode === "map" ? (
          <CellMap cells={filteredCells} onSelectCell={(cell) => setSelectedCell(cell)} />
        ) : (
          <div className="h-full pt-24 pb-8 px-4 overflow-y-auto bg-background">
             {/* ... (Contenido de la Lista que ya tienes) */}
          </div>
        )}
      </div>

      {selectedCell && <CellDetail cell={selectedCell} onClose={() => setSelectedCell(null)} />}
    </main>
  );
}
