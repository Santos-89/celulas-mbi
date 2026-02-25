"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap, Tooltip, useMapEvents } from "react-leaflet";
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

function ZoomTracker({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
    const map = useMapEvents({
        zoomend: () => {
            onZoomChange(map.getZoom());
        },
    });
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
    const [zoom, setZoom] = useState(14);
    const defaultCenter: [number, number] = [-0.2820, -78.5276]; // Sur de Quito

    useEffect(() => {
        if (typeof window !== "undefined") {
            const createIcon = (colorVar: string) => (L as any).divIcon({
                className: "custom-div-icon",
                html: `
                    <div class="relative flex items-center justify-center w-full h-full">
                        <div style="background-color: var(${colorVar});" class="w-4 h-4 rounded-full border-2 border-white shadow-premium z-10 transition-transform active:scale-90"></div>
                    </div>
                `,
                iconSize: [24, 24],
                iconAnchor: [12, 12],
            });

            setIcons({
                "Adultos": createIcon("--color-adultos"),
                "Jóvenes": createIcon("--color-jovenes"),
                "Niños": createIcon("--color-ninos"),
                "Online": createIcon("--color-online"),
                "Default": createIcon("--foreground")
            });
        }
    }, []);

    const createClusterCustomIcon = (cluster: any) => {
        const count = cluster.getChildCount();
        return (L as any).divIcon({
            html: `
                <div class="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold text-xs shadow-premium border-2 border-white ring-2 ring-primary/20 animate-in zoom-in duration-300">
                    ${count}
                </div>
            `,
            className: 'custom-marker-cluster',
            iconSize: L.point(32, 32, true),
        });
    };

    if (Object.keys(icons).length === 0) return null;

    const showLabels = zoom >= 15;

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
                <ZoomTracker onZoomChange={setZoom} />
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
                            {showLabels && (
                                <Tooltip
                                    className="premium-tooltip !bg-card/90 !backdrop-blur-md !border-border/50 !shadow-premium !rounded-xl !p-2 opacity-100 transition-opacity duration-300"
                                    direction="top"
                                    offset={[0, -10]}
                                    permanent
                                >
                                    <div className="text-center p-0.5">
                                        <p className="font-bold text-primary text-[10px] leading-tight mb-0.5">{cell.leaderName}</p>
                                        <div className="flex items-center justify-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `var(--color-${cell.type.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")})` }}></div>
                                            <span className="text-[7px] uppercase font-heavy tracking-widest text-foreground/70">{cell.type}</span>
                                        </div>
                                    </div>
                                </Tooltip>
                            )}
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
