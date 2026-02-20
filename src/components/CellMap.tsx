"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import * as L from "leaflet";
import { CellGroup } from "@/types";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

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

export default function CellMap({ cells, onSelectCell }: CellMapProps) {
    const [icons, setIcons] = useState<Record<string, any>>({});
    const defaultCenter: [number, number] = [-0.1807, -78.4678]; // Quito

    useEffect(() => {
        if (typeof window !== "undefined") {
            const createIcon = (color: string) => (L as any).divIcon({
                className: "custom-div-icon",
                html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 12px rgba(0,0,0,0.4);"></div>`,
                iconSize: [14, 14],
                iconAnchor: [7, 7],
            });

            setIcons({
                "Adultos": createIcon("#0477BF"), // Dark Blue
                "Jóvenes": createIcon("#FF9A17"), // Orange
                "Niños": createIcon("#5CC8F2"),   // Light Blue/Cyan
                "Default": createIcon("#6B7280")  // Gray
            });
        }
    }, []);

    if (Object.keys(icons).length === 0) return null;

    return (
        <div className="w-full h-full rounded-b-[3rem] overflow-hidden shadow-premium z-0 relative">
            <MapContainer
                center={defaultCenter}
                zoom={14}
                scrollWheelZoom={true}
                className="w-full h-full"
            >
                <ResizeMap />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {cells.map((cell, index) => {
                    const jitterLat = (Math.sin(index) * 0.002);
                    const jitterLng = (Math.cos(index) * 0.002);
                    const cellIcon = icons[cell.type] || icons["Default"];

                    return (
                        <Marker
                            key={cell.id}
                            position={[cell.coordinates.lat + jitterLat, cell.coordinates.lng + jitterLng]}
                            {...({ icon: cellIcon } as any)}
                            eventHandlers={{
                                click: () => onSelectCell(cell),
                                mouseover: (e) => {
                                    e.target.openPopup();
                                },
                                mouseout: (e) => {
                                    e.target.closePopup();
                                }
                            }}
                        >
                            <Popup>
                                <div className="text-center p-1">
                                    <p className="font-bold text-primary">{cell.leaderName}</p>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold" style={{ color: cell.type === 'Jóvenes' ? '#FF9A17' : cell.type === 'Niños' ? '#5CC8F2' : '#0477BF' }}>
                                        {cell.type}
                                    </p>
                                    <p className="text-[10px] mt-1">{cell.neighborhood}</p>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
