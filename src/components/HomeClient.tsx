"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { CellDetail } from "@/components/CellDetail";
import { SAMPLE_CELLS } from "@/data/cells";
import { CellGroup } from "@/types";
import { fetchLiveCells } from "@/lib/data-fetcher";
import { Search, SlidersHorizontal, Map as MapIcon, List as ListIcon, X, Loader2, RefreshCw, Navigation } from "lucide-react";
import { Badge, Card } from "@/components/ui/Card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Skeleton } from "@/components/ui/Skeleton";

const CellMap = dynamic(() => import("@/components/CellMap"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-card animate-pulse flex items-center justify-center text-gray-400">Cargando mapa...</div>
});

export default function HomeClient({ initialData = SAMPLE_CELLS }: { initialData?: CellGroup[] }) {
  const [cells, setCells] = useState<CellGroup[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [selectedCell, setSelectedCell] = useState<CellGroup | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<string>("Todas");
  const [filterDay, setFilterDay] = useState<string>("Todos");

  const [lastSync, setLastSync] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Haversine formula to calculate distance in km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setIsLocating(false);
      },
      () => {
        alert("No se pudo obtener tu ubicación. Asegúrate de dar permisos.");
        setIsLocating(false);
      }
    );
  };

  const initData = async () => {
    setIsRefreshing(true);
    try {
      const liveData = await fetchLiveCells();
      setCells(liveData);
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSync(now);
      if (typeof window !== "undefined") {
        localStorage.setItem("last_sync_time", now);
      }
    } catch (err) {
      console.error("Could not load live data", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTime = localStorage.getItem("last_sync_time");
      if (savedTime) setLastSync(savedTime);
    }
  }, []);

  const filteredCells = useMemo(() => {
    let result = cells.filter((cell) => {
      const matchesSearch =
        cell.leaderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cell.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cell.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === "Todas" || cell.type === filterType;
      const matchesDay = filterDay === "Todos" || cell.day === filterDay;
      return matchesSearch && matchesType && matchesDay;
    });

    if (userLocation) {
      return result.map(cell => ({
        ...cell,
        distance: calculateDistance(userLocation.lat, userLocation.lng, cell.coordinates.lat, cell.coordinates.lng)
      })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    return result.sort((a, b) => a.leaderName.localeCompare(b.leaderName));
  }, [cells, searchQuery, filterType, filterDay, userLocation]);

  const isFiltered = searchQuery !== "" || filterType !== "Todas" || filterDay !== "Todos" || userLocation !== null;

  const clearFilters = () => {
    setFilterType("Todas");
    setFilterDay("Todos");
    setSearchQuery("");
    setUserLocation(null);
  };

  return (
    <main className="relative flex flex-col h-screen h-[100dvh] bg-background text-foreground overflow-hidden">
      {/* Header / Search Bar */}
      <div className="fixed top-0 left-0 right-0 z-[100] p-4 md:p-6 bg-gradient-to-b from-background via-background/80 to-transparent mt-safe">
        <div className="flex flex-col gap-4 max-w-2xl mx-auto">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex gap-2 items-center bg-card/95 backdrop-blur-2xl rounded-[2rem] p-2 shadow-premium border border-border"
          >
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
              <button
                onClick={() => initData()}
                disabled={isRefreshing}
                className={`p-2.5 rounded-2xl transition-all duration-300 ${isRefreshing ? "animate-spin text-primary" : "hover:bg-primary/10 text-primary"}`}
                title="Sincronizar ahora"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <ThemeToggle />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2.5 rounded-2xl transition-all duration-300 ${showFilters ? "bg-primary text-white shadow-lg scale-105" : "hover:bg-primary/10 text-primary"}`}
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-10"
                  onClick={() => setShowFilters(false)}
                />
                <motion.div
                  initial={{ y: -20, opacity: 0, scale: 0.95 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: -20, opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="relative z-20"
                >
                  <Card className="bg-card/90 backdrop-blur-xl border-border/50">
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
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterType === type ? "bg-primary text-white shadow-md" : "bg-background/50 text-foreground hover:bg-border border border-border/30"}`}
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
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterDay === day ? "bg-primary text-white shadow-md" : "bg-background/50 text-foreground hover:bg-border border border-border/30"}`}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Tu Ubicación</p>
                        <button
                          onClick={requestLocation}
                          disabled={isLocating}
                          className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold transition-all ${userLocation ? "bg-primary text-white shadow-md" : "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"}`}
                        >
                          <Navigation className={`w-4 h-4 ${isLocating ? "animate-pulse" : ""}`} />
                          {isLocating ? "Buscando..." : userLocation ? "Ubicación activada (Cercanas primero)" : "Activar GPS para ver cercanas"}
                        </button>
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
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {isFiltered && (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-5 py-2 bg-card/80 backdrop-blur-md border border-border/50 rounded-full text-[10px] font-heavy tracking-widest uppercase text-foreground shadow-premium hover:bg-border transition-all self-center"
            >
              <X className="w-3.5 h-3.5" />
              Limpiar Filtros
            </motion.button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {viewMode === "map" ? (
            <motion.div
              key="map-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full"
            >
              <CellMap
                cells={filteredCells}
                onSelectCell={(cell) => setSelectedCell(cell)}
                onMapClick={() => setSelectedCell(null)}
                selectedCellId={selectedCell?.id}
              />
            </motion.div>
          ) : (
            <motion.div
              key="list-view"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="h-full pt-24 pb-8 px-4 overflow-y-auto bg-background"
            >
              <div className="max-w-2xl mx-auto space-y-3">
                <h1 className="text-lg font-heavy text-foreground px-2 mb-4">
                  Células encontradas ({filteredCells.length})
                </h1>
                
                {isRefreshing ? (
                  // Skeleton list
                  Array.from({ length: 5 }).map((_, i) => (
                    <Card key={`skeleton-${i}`} className="p-4 border-none shadow-md bg-card space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-5 w-1/3" />
                          <div className="flex gap-2">
                            <Skeleton className="h-4 w-16 rounded-full" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                          <Skeleton className="h-3 w-1/2 mt-2" />
                        </div>
                        <Skeleton className="h-8 w-12 rounded-lg" />
                      </div>
                    </Card>
                  ))
                ) : (
                  filteredCells.map((cell) => (
                    <motion.div
                      layout
                      key={cell.id}
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card
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
                          {cell.distance !== undefined && (
                            <div className="flex flex-col items-end gap-1">
                              <div className="px-2 py-1 bg-primary/10 rounded-lg text-[10px] font-bold text-primary">
                                {cell.distance.toFixed(1)} km
                              </div>
                              <span className="text-[8px] text-muted-foreground uppercase tracking-widest">de ti</span>
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Controls (Mobile) */}
      <div className="absolute bottom-8 left-0 right-0 z-[60] pointer-events-none flex justify-center px-6">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 30, stiffness: 200, delay: 0.2 }}
          className="bg-background/80 backdrop-blur-md p-1.5 rounded-2xl shadow-premium border border-border flex gap-1 pointer-events-auto"
        >
          <button
            onClick={() => {
              setViewMode("map");
              setSelectedCell(null);
            }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${viewMode === "map" ? "bg-primary text-white shadow-lg" : "text-foreground hover:bg-border"}`}
          >
            <MapIcon className="w-4 h-4" />
            Mapa
          </button>
          <button
            onClick={() => {
              setViewMode("list");
              setSelectedCell(null);
            }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${viewMode === "list" ? "bg-primary text-white shadow-lg" : "text-foreground hover:bg-border"}`}
          >
            <ListIcon className="w-4 h-4" />
            Lista
          </button>
        </motion.div>
      </div>

      {/* Detail Panel */}
      <AnimatePresence>
        {selectedCell && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 40, stiffness: 400 }}
            className="fixed inset-0 z-[200] pointer-events-none"
          >
            <div className="pointer-events-auto h-full">
              <CellDetail
                cell={selectedCell}
                onClose={() => setSelectedCell(null)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
