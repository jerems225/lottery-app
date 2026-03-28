"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const FallingGolds = () => {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    // Save memory by not generating particles on mobile and tablet
    if (window.innerWidth < 1024) return;

    const count = 75; // More particles
    const newParticles = Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: 2 + Math.random() * 4, // Slightly larger
      duration: 8 + Math.random() * 15, // Slightly faster
      delay: Math.random() * 20,
      rotation: Math.random() * 360,
      opacity: 0.2 + Math.random() * 0.6, // Higher opacity
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="hidden lg:block fixed inset-0 pointer-events-none z-[-2] overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: "-10vh", x: `${p.x}vw`, rotate: p.rotation, opacity: 0 }}
          animate={{ 
            y: "110vh", 
            x: [`${p.x}vw`, `${p.x + (Math.random() * 15 - 7.5)}vw`],
            rotate: p.rotation + 1080, // More rotation
            opacity: [0, p.opacity, p.opacity, 0] 
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear",
          }}
          className="absolute bg-gradient-to-br from-primary-gold via-secondary-gold to-dark-gold rounded-full"
          style={{
            width: `${p.size}px`,
            height: `${p.size * 6}px`, 
            filter: "blur(0.4px)",
            boxShadow: "0 0 20px rgba(198, 163, 85, 0.5)", // Stronger glow
          }}
        />
      ))}
    </div>
  );
};
