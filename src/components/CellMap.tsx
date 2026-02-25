"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap, Tooltip } from "react-leaflet";
import * as L from "leaflet";
import { CellGroup } from "@/types";
import { useEffect, useState, useCallback } from "react";
import { Navigation } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet with Next.js
const fixLeafletIcons = () => {
    if (typeof window !== "undefined") {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
            iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
            shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });
    }
};

fixLeafletIcons();

interface CellMapProps {
    cells: CellGroup[];
    onSelectCell: (cell: CellGroup) => void;
}

function ResizeMap() {
    const map = useMap();
    useEffect(() => {
        map.invalidateSize();
        const timeouts = [100, 500, 1000, 2000].map(delay =>
            setTimeout(() => map.invalidateSize(), delay)
        );
        return () => timeouts.forEach(clearTimeout);
    }, [map]);
    return null;
}


function LocationButton() {
    const map = useMap();
    const [loading, setLoading] = useState(false);

    const findMe = useCallback(() => {
        setLoading(true);
        map.locate().on("locationfound", (e) => {
            map.flyTo(e.latlng, 15);
            setLoading(false);
        }).on("locationerror", () => {
            setLoading(false);
            alert("No se pudo obtener tu ubicación");
        });
    }, [map]);

    return (
        <div className="leaflet-bottom leaflet-right mb-24 mr-4">
            <button
                onClick={findMe}
                className={`p-3 bg-card border border-border rounded-2xl shadow-premium text-primary hover:bg-border transition-all active:scale-95 pointer-events-auto ${loading ? "animate-pulse" : ""}`}
                aria-label="Mi ubicación"
            >
                <Navigation className={`w-5 h-5 ${loading ? "fill-primary" : ""}`} />
            </button>
        </div>
    );
}

export default function CellMap({ cells, onSelectCell }: CellMapProps) {
    const [icons, setIcons] = useState<Record<string, any>>({});
    const defaultCenter: [number, number] = [-0.2820, -78.5276]; // Sur de Quito

    useEffect(() => {
        if (typeof window !== "undefined") {
            const createIcon = (colorVar: string, emoji: string) => (L as any).divIcon({
                className: "custom-div-icon",
                html: `
                    <div class="relative flex items-center justify-center w-6 h-6 animate-in zoom-in duration-300">
                        <div style="background-color: var(${colorVar});" class="w-full h-full rounded-full border-2 border-white shadow-premium flex items-center justify-center text-[10px] transform transition-transform hover:scale-110 active:scale-95">
                            ${emoji}
                        </div>
                        <div style="border-top-color: var(${colorVar});" class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] z-0"></div>
                    </div>
                `,
                iconSize: [24, 24],
                iconAnchor: [12, 24],
            });

            setIcons({
                "Adultos": createIcon("--color-adultos", "🏠"),
                "Jóvenes": createIcon("--color-jovenes", "🏃"),
                "Niños": createIcon("--color-ninos", "👶"),
                "Online": createIcon("--color-online", "🌐"),
                "Default": createIcon("--foreground", "⛪")
            });
        }
    }, []);

    if (Object.keys(icons).length === 0) return null;

    return (
        <div className="w-full h-full rounded-b-[3.5rem] overflow-hidden shadow-premium z-0 relative border-b border-border/50">
            <MapContainer
                center={defaultCenter}
                zoom={14}
                scrollWheelZoom={true}
                className="w-full h-full"
                zoomControl={false}
            >
                <ResizeMap />
                <LocationButton />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {cells.map((cell, index) => {
                    const jitterLat = (Math.sin(index * 13) * 0.0001);
                    const jitterLng = (Math.cos(index * 13) * 0.0001);
                    const cellIcon = icons[cell.type] || icons["Default"];

                    return (
                        <Marker
                            key={cell.id}
                            position={[cell.coordinates.lat + jitterLat, cell.coordinates.lng + jitterLng]}
                            {...({ icon: cellIcon } as any)}
                            eventHandlers={{
                                click: () => onSelectCell(cell)
                            }}
                        >
                            <Tooltip
                                className="premium-tooltip !bg-card/95 !backdrop-blur-md !border-border/50 !shadow-premium !rounded-2xl !px-3 !py-2"
                                direction="top"
                                offset={[0, -25]}
                            >
                                <div className="text-center min-w-[120px]">
                                    <p className="font-bold text-foreground text-xs leading-tight mb-1">{cell.leaderName}</p>
                                    <div className="flex items-center justify-center gap-1.5 py-0.5 px-2 bg-secondary/30 rounded-full">
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `var(--color-${cell.type.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")})` }}></div>
                                        <span className="text-[8px] uppercase font-heavy tracking-wider text-muted-foreground">{cell.type}</span>
                                    </div>
                                    <p className="text-[9px] text-muted-foreground mt-1.5 italic">Toca para más info</p>
                                </div>
                            </Tooltip>
                            <Popup className="premium-popup">
                                <div className="text-center p-0.5">
                                    <p className="font-bold text-foreground text-sm leading-tight">{cell.leaderName}</p>
                                    <p className="text-[10px] uppercase font-heavy tracking-wider mt-0.5"
                                        style={{ color: `var(--color-${cell.type.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")})` }}>
                                        {cell.type}
                                    </p>
                                    <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">{cell.neighborhood}</p>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
