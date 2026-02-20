"use client";

import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Check local storage or preference
        const savedTheme = localStorage.getItem("theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

        if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
            setIsDark(true);
            document.documentElement.classList.add("dark");
        }
    }, []);

    const toggleTheme = () => {
        if (isDark) {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
            setIsDark(false);
        } else {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
            setIsDark(true);
        }
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-card border border-border text-foreground hover:bg-border transition-all duration-300 shadow-premium active:scale-95"
            aria-label="Alternar modo oscuro"
        >
            {isDark ? (
                <Sun className="w-5 h-5 text-accent" />
            ) : (
                <Moon className="w-5 h-5 text-primary" />
            )}
        </button>
    );
}
