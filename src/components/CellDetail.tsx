import { useMemo } from "react";
import { CellGroup } from "@/types";
import { Button } from "./ui/Button";
import { Badge, Card } from "./ui/Card";
import { Phone, MessageCircle, Navigation, Clock, MapPin, X } from "lucide-react";

interface CellDetailProps {
    cell: CellGroup;
    onClose: () => void;
}

export function CellDetail({ cell, onClose }: CellDetailProps) {
    const whatsappData = useMemo(() => {
        let cleanNumber = cell.leaderPhone.replace(/\D/g, "");
        if (cleanNumber.startsWith("0")) {
            cleanNumber = cleanNumber.substring(1);
        }
        const fullNumber = cleanNumber.startsWith("593") ? cleanNumber : `593${cleanNumber}`;
        const message = encodeURIComponent(`¡Hola ${cell.leaderName}! Vi tu célula en la app de la iglesia y me gustaría asistir. ¿Me puedes ayudar con más información por favor?`);
        return {
            url: `https://wa.me/${fullNumber}?text=${message}`,
            isValid: cleanNumber.length >= 7
        };
    }, [cell]);

    const handleCall = () => {
        window.open(`tel:${cell.leaderPhone}`, "_self");
    };

    const handleNavigate = () => {
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cell.address)}`, "_blank");
    };

    const handleWhatsApp = () => {
        if (whatsappData.isValid) {
            window.location.href = whatsappData.url;
        }
    };

    return (
        <Card className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[3.5rem] animate-fluid md:max-w-md md:left-1/2 md:-translate-x-1/2 md:bottom-32 md:rounded-[3rem] shadow-premium bg-card/95 backdrop-blur-2xl border-t border-border/50 pb-32 md:pb-8">
            <div className="w-12 h-1.5 bg-border/50 rounded-full mx-auto mb-6 md:hidden" />

            <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary font-bold text-xl uppercase shadow-inner">
                        {cell.leaderName.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-xl font-heavy text-foreground leading-tight">{cell.leaderName}</h2>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-1">Líder de Célula</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2.5 bg-background/50 hover:bg-background rounded-2xl border border-border/50 transition-all active:scale-90">
                    <X className="w-5 h-5 text-gray-400" />
                </button>
            </div>

            <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4">
                    <Badge variant={cell.type.toLowerCase() as any} className="py-1.5 px-4 rounded-xl">
                        {cell.type}
                    </Badge>
                    <div className="flex items-center gap-2 text-gray-500 text-xs font-bold">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>{cell.day} {cell.time}</span>
                    </div>
                </div>

                <div className="flex items-start gap-4 bg-background/40 p-5 rounded-[2rem] border border-border/30">
                    <div className="p-2.5 bg-primary/10 rounded-xl">
                        <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-sm">
                        <p className="font-bold text-foreground mb-1">{cell.neighborhood}</p>
                        <p className="text-gray-400 text-xs leading-relaxed">{cell.address}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Button onClick={handleCall} className="gap-2.5 rounded-2xl h-14">
                    <Phone className="w-4.5 h-4.5" />
                    Llamar
                </Button>

                {whatsappData.isValid ? (
                    <button
                        onClick={handleWhatsApp}
                        className="flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-2xl shadow-lg shadow-green-500/20 h-14 transition-all active:scale-95 w-full"
                    >
                        <MessageCircle className="w-4.5 h-4.5" />
                        WhatsApp
                    </button>
                ) : (
                    <Button
                        disabled
                        className="gap-2.5 bg-gray-300 text-gray-500 font-bold rounded-2xl h-14 w-full"
                    >
                        <MessageCircle className="w-4.5 h-4.5" />
                        WhatsApp
                    </Button>
                )}


                <Button onClick={handleNavigate} variant="secondary" className="col-span-2 gap-2.5 h-14 rounded-2xl border-border/50 font-bold bg-background/50">
                    <Navigation className="w-4.5 h-4.5 text-primary" />
                    ¿Cómo llegar?
                </Button>
            </div>
        </Card>
    );
}
