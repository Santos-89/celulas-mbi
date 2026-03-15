"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  onComplete: () => void;
  durationMs?: number;
}

export function SplashScreen({ onComplete, durationMs = 2500 }: SplashScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Handlers para asegurar que al terminar se limpie el componente
    const finishSplash = () => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Darle tiempo a Framer Motion de hacer su exit animation
    };

    // Timer principal de duración del splash
    const timer = setTimeout(finishSplash, durationMs);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    // Configurar canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Lógica de partículas
    const particles: Particle[] = [];
    // Ajustar número de partículas según tamaño de pantalla
    const numParticles = Math.min(Math.floor((window.innerWidth * window.innerHeight) / 10000), 100);

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = (Math.random() - 0.5) * 1.5;
        this.radius = Math.random() * 2 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Rebote en bordes
        if (this.x < 0 || this.x > canvas!.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas!.height) this.vy *= -1;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        // Color primary ajustado
        ctx.fillStyle = "rgba(17, 82, 212, 0.8)"; 
        ctx.fill();
      }
    }

    for (let i = 0; i < numParticles; i++) {
      particles.push(new Particle());
    }

    const connectParticles = () => {
      if (!ctx) return;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Rango de conexión
          if (distance < 150) {
            // Opacidad basada en distancia (más lejos, más transparente)
            const opacity = 1 - distance / 150;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(17, 82, 212, ${opacity * 0.5})`; // Lineas más sutiles
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      connectParticles();

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [durationMs, onComplete]);

  return (
    <>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Canvas en el fondo */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
          />
          
          {/* Contenido centrado arriba del canvas */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative z-10 flex flex-col items-center"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30 mb-6 drop-shadow-[0_0_15px_rgba(17,82,212,0.5)]">
              {/* Icono de ubicación o logotipo (Reutizando el estilo del manifest) */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-white">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <h1 className="text-2xl md:text-3xl font-heavy text-foreground tracking-tight">Células MBI</h1>
            <p className="text-muted-foreground font-medium mt-2 tracking-wide uppercase text-xs">Conectando la comunidad</p>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
