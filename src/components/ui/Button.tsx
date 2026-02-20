import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "accent" | "ghost" | "outline";
    size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", ...props }, ref) => {
        const variants = {
            primary: "bg-primary text-white hover:bg-primary-dark shadow-md active:scale-95",
            secondary: "bg-card text-foreground hover:bg-border border border-border shadow-sm",
            accent: "bg-accent text-white hover:opacity-90 shadow-md active:scale-95",
            outline: "border-2 border-primary text-primary hover:bg-primary/5",
            ghost: "hover:bg-primary/10 text-foreground",
        };

        const sizes = {
            sm: "px-3 py-1.5 text-sm",
            md: "px-6 py-3 text-base",
            lg: "px-8 py-4 text-lg font-semibold",
        };

        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-2xl transition-all duration-200 outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:pointer-events-none",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";
