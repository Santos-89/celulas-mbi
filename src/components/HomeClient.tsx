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
      {/* Header / Search Bar */}
      <div className="fixed top-0 left-0 right-0 z-[100] p-4 md:p-6 bg-gradient-to-b from-background via-background/80 to-transparent mt-safe">
        <div className="flex flex-col gap-4 max-w-2xl mx-auto">
          <div className="flex gap-2 items-center bg-card/95 backdrop-blur-2xl rounded-[2rem] p-2 shadow-premium border border-border">
            <div className="pl-4 text-primary">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Buscar barrio o líder..."
              className="flex-1 bg-transparent border-none outline-none text-foreground py-3 text-sm font-medium placeholder:text-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="flex items-center gap-1.5 pr-1.5">
              <ThemeToggle />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2.5 rounded-2xl transition-all duration-300 ${showFilters ? "bg-primary text-white shadow-lg scale-105" : "hover:bg-primary/10 text-primary"}`}
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <Card className="animate-in fade-in slide-in-from-top-4 duration-300 bg-card/90 backdrop-blur-xl border-border/50">
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Tipo de Célula</p>
                    {filterType !== "Todas" && <Badge variant={filterType.toLowerCase() as any} className="h-5">{filterType}</Badge>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["Todas", "Niños", "Jóvenes", "Adultos", "Online"].map((type) => (
                      <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterType === type ? "bg-primary text-white shadow-md" : "bg-background/50 text-foreground hover:bg-border border border-border/30"
                          }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Día de Reunión</p>
                  <div className="flex flex-wrap gap-2">
                    {["Todos", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"].map((day) => (
                      <button
                        key={day}
                        onClick={() => setFilterDay(day)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterDay === day ? "bg-primary text-white shadow-md" : "bg-background/50 text-foreground hover:bg-border border border-border/30"
                          }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setShowFilters(false);
                      if (filteredCells.length > 0) setViewMode("list");
                    }}
                    className="w-full py-3.5 bg-primary text-white text-sm font-bold rounded-2xl hover:bg-primary-dark transition-all shadow-lg active:scale-[0.98]"
                  >
                    Ver {filteredCells.length} células
                  </button>
                </div>
              </div>
            </Card>
          )}

          {isFiltered && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-5 py-2 bg-card/80 backdrop-blur-md border border-border/50 rounded-full text-[10px] font-heavy tracking-widest uppercase text-foreground shadow-premium hover:bg-border transition-all self-center animate-in zoom-in-95 duration-200"
            >
              <X className="w-3.5 h-3.5" />
              Limpiar Filtros
            </button>
          )}

          {loading && cells.length === 0 && (
            <div className="flex items-center justify-center gap-2 py-2 text-primary animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs font-bold uppercase tracking-widest">Sincronizando...</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden">
        {viewMode === "map" ? (
          <CellMap
            cells={filteredCells}
            onSelectCell={(cell) => setSelectedCell(cell)}
          />
        ) : (
          <div className="h-full pt-24 pb-8 px-4 overflow-y-auto bg-background">
            <div className="max-w-2xl mx-auto space-y-3">
              <h1 className="text-lg font-heavy text-foreground px-2 mb-4 animate-fluid">
                Células encontradas ({filteredCells.length})
              </h1>
              {filteredCells.map((cell) => (
                <Card
                  key={cell.id}
                  onClick={() => setSelectedCell(cell)}
                  className="p-4 cursor-pointer hover:border-primary/30 transition-all border-none shadow-md bg-card"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-foreground">{cell.leaderName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={cell.type === "Niños" ? "niños" : cell.type === "Jóvenes" ? "jóvenes" : cell.type === "Online" ? "online" : "adultos"}>
                          {cell.type}
                        </Badge>
                        <span className="text-xs text-gray-500 uppercase">{cell.day} • {cell.time}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-2 font-medium">{cell.neighborhood}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls (Mobile) */}
      <div className="absolute bottom-8 left-0 right-0 z-10 pointer-events-none flex justify-center px-6">
        <div className="bg-background/80 backdrop-blur-md p-1.5 rounded-2xl shadow-premium border border-border flex gap-1 pointer-events-auto">
          <button
            onClick={() => {
              setViewMode("map");
              setSelectedCell(null);
            }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === "map" ? "bg-primary text-white shadow-lg" : "text-foreground hover:bg-border"}`}
          >
            <MapIcon className="w-4 h-4" />
            Mapa
          </button>
          <button
            onClick={() => {
              setViewMode("list");
              setSelectedCell(null);
            }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === "list" ? "bg-primary text-white shadow-lg" : "text-foreground hover:bg-border"}`}
          >
            <ListIcon className="w-4 h-4" />
            Lista
          </button>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedCell && (
        <CellDetail
          cell={selectedCell}
          onClose={() => setSelectedCell(null)}
        />
      )}
    </main>
  );
}
