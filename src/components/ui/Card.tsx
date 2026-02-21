import { cn } from "@/lib/utils";

export function Card({ className, children, onClick }: { className?: string; children: React.ReactNode; onClick?: () => void }) {
    return (
        <div
            onClick={onClick}
            className={cn("bg-card rounded-[2.5rem] p-6 shadow-premium border border-border/50 transition-all duration-300", className)}
        >
            {children}
        </div>
    );
}

export function Badge({ children, className, variant = "default" }: { children: React.ReactNode; className?: string; variant?: "default" | "accent" | "niños" | "jóvenes" | "adultos" }) {
    const variants = {
        default: "bg-primary/10 text-primary",
        accent: "bg-accent-soft text-accent",
        niños: "bg-ninos/10 text-ninos",
        jóvenes: "bg-jovenes/10 text-jovenes",
        adultos: "bg-adultos/10 text-adultos",
    };

    return (
        <span className={cn("px-4 py-1.5 rounded-xl text-[10px] font-heavy uppercase tracking-widest", variants[variant], className)}>
            {children}
        </span>
    );
}
