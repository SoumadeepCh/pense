'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface SparklesCoreProps {
  id?: string;
  className?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number;
  particleColor?: string;
  particleSpeed?: number;
}

export const SparklesCore = ({
  id = 'sparkles',
  className,
  background = 'transparent',
  minSize = 0.4,
  maxSize = 1,
  particleDensity = 120,
  particleColor = '#FFF',
  particleSpeed = 1,
}: SparklesCoreProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      opacitySpeed: number;
    }> = [];

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    const createParticle = () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * (maxSize - minSize) + minSize,
      speedX: (Math.random() - 0.5) * particleSpeed,
      speedY: (Math.random() - 0.5) * particleSpeed,
      opacity: Math.random(),
      opacitySpeed: (Math.random() - 0.5) * 0.005,
    });

    const initParticles = () => {
      particles.length = 0;
      const particleCount = Math.floor((canvas.width * canvas.height) / 10000) * particleDensity / 100;
      
      for (let i = 0; i < particleCount; i++) {
        particles.push(createParticle());
      }
    };

    const updateParticles = () => {
      particles.forEach((particle) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.opacity += particle.opacitySpeed;

        if (particle.opacity <= 0) {
          particle.opacity = 0;
          particle.opacitySpeed = Math.abs(particle.opacitySpeed);
        } else if (particle.opacity >= 1) {
          particle.opacity = 1;
          particle.opacitySpeed = -Math.abs(particle.opacitySpeed);
        }

        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
      });
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle) => {
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = particleColor;
        
        const gradient = ctx.createRadialGradient(
          particle.x, 
          particle.y, 
          0,
          particle.x, 
          particle.y, 
          particle.size
        );
        gradient.addColorStop(0, particleColor);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    };

    const animate = () => {
      updateParticles();
      drawParticles();
      animationId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      resizeCanvas();
      initParticles();
    };

    resizeCanvas();
    initParticles();
    animate();

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [id, minSize, maxSize, particleDensity, particleColor, particleSpeed]);

  return (
    <canvas
      ref={canvasRef}
      id={id}
      className={cn('absolute inset-0 pointer-events-none', className)}
      style={{ background }}
    />
  );
};
