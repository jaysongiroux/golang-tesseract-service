"use client";

import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

export function Particles({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>(0);

  const createParticle = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const width = canvas.width;
    const height = canvas.height;

    const colors = ["#60A5FA", "#A78BFA", "#818CF8", "#34D399"];

    const particle: Particle = {
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      life: 0,
      maxLife: Math.random() * 100 + 100,
    };

    particlesRef.current.push(particle);
  }, []);

  const updateParticles = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particlesRef.current.forEach((particle, index) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life++;

      // Remove particles that have exceeded their lifespan
      if (particle.life >= particle.maxLife) {
        particlesRef.current.splice(index, 1);
        return;
      }

      // Calculate opacity based on life
      const opacity = 1 - particle.life / particle.maxLife;

      // Draw particle
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = `${particle.color}${Math.floor(opacity * 255)
        .toString(16)
        .padStart(2, "0")}`;
      ctx.fill();
    });

    // Add new particles occasionally
    if (Math.random() < 0.1 && particlesRef.current.length < 100) {
      createParticle();
    }

    animationFrameRef.current = requestAnimationFrame(updateParticles);
  }, [createParticle]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const updateDimensions = () => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const { width, height } = canvas.getBoundingClientRect();

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    // Initialize with some particles
    for (let i = 0; i < 50; i++) {
      createParticle();
    }

    // Start animation loop
    animationFrameRef.current = requestAnimationFrame(updateParticles);

    return () => {
      window.removeEventListener("resize", updateDimensions);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [createParticle, updateParticles]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 z-0 h-full w-full opacity-30", className)}
    />
  );
}
