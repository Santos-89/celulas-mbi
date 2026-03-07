import { useMemo } from "react";
import { motion } from "framer-motion";
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
        
        const chatMessage = encodeURIComponent(`¡Hola ${cell.leaderName}! Vi tu célula en la app de la iglesia y me gustaría asistir. ¿Me puedes ayudar con más información por favor?`);
        
        return {
            chatUrl: `https://wa.me/${fullNumber}?text=${chatMessage}`,
            isValid: cleanNumber.length >= 7
        };
    }, [cell]);

    const handleCall = () => {
        window.open(`tel:${cell.leaderPhone}`, "_self");
    };

    const handleNavigate = () => {
        const { lat, lng } = cell.coordinates;
        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        window.open(url, "_blank");
    };

    const handleWhatsApp = () => {
        if (whatsappData.isValid) {
            window.location.href = whatsappData.chatUrl;
        }
    };

    return (
        <Card className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[3.5rem] md:max-w-md md:left-1/2 md:-translate-x-1/2 md:bottom-32 md:rounded-[3rem] shadow-premium bg-card/95 backdrop-blur-2xl border-t border-border/50 pb-32 md:pb-8 h-auto max-h-[90vh] overflow-y-auto">
            <div className="w-12 h-1.5 bg-border/50 rounded-full mx-auto mb-6 md:hidden sticky top-0" />

            <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4 items-center">
                    <motion.div 
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="w-16 h-16 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary font-bold text-xl uppercase shadow-inner"
                    >
                        {cell.leaderName.charAt(0)}
                    </motion.div>
                    <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h2 className="text-xl font-heavy text-foreground leading-tight">{cell.leaderName}</h2>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-1">Líder de Célula</p>
                    </motion.div>
                </div>
                <button onClick={onClose} className="p-2.5 bg-background/50 hover:bg-background rounded-2xl border border-border/50 transition-all active:scale-90">
                    <X className="w-5 h-5 text-gray-400" />
                </button>
            </div>

            <div className="space-y-4 mb-8">
                <div className="flex flex-wrap items-center gap-3">
                    <Badge variant={cell.type.toLowerCase() as any} className="py-1.5 px-4 rounded-xl">
                        {cell.type}
                    </Badge>
                    {cell.distance !== undefined && (
                        <div className="px-3 py-1 bg-primary/10 rounded-lg text-[10px] font-bold text-primary">
                            A {cell.distance.toFixed(1)} km de ti
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-500 text-xs font-bold">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>{cell.day} {cell.time}</span>
                    </div>
                </div>

                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-start gap-4 bg-background/40 p-4 rounded-3xl border border-border/30"
                >
                    <div className="p-2 bg-primary/10 rounded-2xl shrink-0 mt-0.5">
                        <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-foreground leading-snug">{cell.neighborhood}</p>
                        <p className="text-xs text-gray-400 mt-1">{cell.address}</p>
                    </div>
                </motion.div>
            </div>

            <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                    {/* 1. Llamada Normal */}
                    <motion.div whileTap={{ scale: 0.95 }} className="w-full">
                        <button 
                            onClick={handleCall} 
                            className="flex items-center justify-center gap-3 bg-primary text-white font-bold rounded-2xl shadow-lg h-14 w-full transition-all"
                        >
                            <Phone className="w-5 h-5" />
                            <span className="text-sm">Llamar</span>
                        </button>
                    </motion.div>

                    {/* 2. WhatsApp Chat */}
                    {whatsappData.isValid ? (
                        <motion.div whileTap={{ scale: 0.95 }} className="w-full">
                            <button
                                onClick={handleWhatsApp}
                                className="flex items-center justify-center gap-3 bg-[#25D366] text-white font-bold rounded-2xl shadow-lg shadow-green-500/20 h-14 w-full transition-all"
                            >
                                <MessageCircle className="w-5 h-5" />
                                <span className="text-sm">WhatsApp</span>
                            </button>
                        </motion.div>
                    ) : (
                        <div className="flex items-center justify-center gap-3 bg-gray-100 text-gray-400 font-bold rounded-2xl h-14 w-full opacity-50 cursor-not-allowed">
                            <MessageCircle className="w-5 h-5" />
                            <span className="text-sm">WhatsApp</span>
                        </div>
                    )}
                </div>

                {/* 3. Navegación GPS */}
                <motion.div whileTap={{ scale: 0.98 }} className="w-full">
                    <button 
                        onClick={handleNavigate}
                        className="flex items-center justify-center gap-3 bg-background border border-border hover:bg-muted/30 text-foreground font-bold rounded-2xl h-14 w-full transition-all"
                    >
                        <Navigation className="w-5 h-5 text-primary" />
                        <span className="text-sm">¿Cómo llegar?</span>
                    </button>
                </motion.div>
            </div>
        </Card>
    );
}
