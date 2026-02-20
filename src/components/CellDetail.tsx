import { CellGroup } from "@/types";
import { Button } from "./ui/Button";
import { Badge, Card } from "./ui/Card";
import { Phone, MessageCircle, Navigation, Clock, MapPin, X } from "lucide-react";

interface CellDetailProps {
    cell: CellGroup;
    onClose: () => void;
}

export function CellDetail({ cell, onClose }: CellDetailProps) {
    const handleCall = () => {
        window.open(`tel:${cell.leaderPhone}`, "_self");
    };

    const handleWhatsApp = () => {
        // Clean number: remove non-digits and leading zero
        let cleanNumber = cell.leaderPhone.replace(/\D/g, "");
        if (cleanNumber.startsWith("0")) {
            cleanNumber = cleanNumber.substring(1);
        }
        // Add Ecuador country code if not present
        const fullNumber = cleanNumber.startsWith("593") ? cleanNumber : `593${cleanNumber}`;

        const message = encodeURIComponent(`¡Hola ${cell.leaderName}! Vi tu célula en la app de la iglesia y me gustaría asistir. ¿Me puedes ayudar con la ubicación exacta?`);
        window.open(`https://wa.me/${fullNumber}?text=${message}`, "_blank");
    };

    const handleNavigate = () => {
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cell.address)}`, "_blank");
    };

    return (
        <Card className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[3rem] animate-in slide-in-from-bottom duration-300 md:max-w-md md:left-1/2 md:-translate-x-1/2 md:bottom-6 md:rounded-3xl shadow-2xl border-t border-border">
            <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl uppercase">
                        {cell.leaderName.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">{cell.leaderName}</h2>
                        <p className="text-sm text-gray-400 uppercase tracking-tighter">Líder de Célula</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-border rounded-full transition-colors">
                    <X className="w-6 h-6 text-gray-400" />
                </button>
            </div>

            <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                    <Badge variant={cell.type === "Niños" ? "niños" : cell.type === "Jóvenes" ? "jóvenes" : "adultos"}>
                        {cell.type}
                    </Badge>
                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{cell.day} {cell.time}</span>
                    </div>
                </div>

                <div className="flex items-start gap-3 bg-background p-4 rounded-2xl border border-border">
                    <MapPin className="w-5 h-5 text-primary mt-0.5" />
                    <div className="text-sm">
                        <p className="font-semibold text-foreground">{cell.neighborhood}</p>
                        <p className="text-gray-400">{cell.address}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Button onClick={handleCall} className="gap-2">
                    <Phone className="w-4 h-4" />
                    Llamar
                </Button>
                <Button onClick={handleWhatsApp} className="gap-2 bg-green-500 hover:bg-green-600 border-none">
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                </Button>
                <Button onClick={handleNavigate} variant="secondary" className="col-span-2 gap-2">
                    <Navigation className="w-4 h-4" />
                    ¿Cómo llegar?
                </Button>
            </div>
        </Card>
    );
}
