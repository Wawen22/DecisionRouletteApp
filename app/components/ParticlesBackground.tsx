import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

type Particle = {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  xMovement: number[];
  yMovement: number[];
  scaleMovement: number[];
};

type ParticlesBackgroundProps = {
  count?: number;
  colors?: string[];
};

export default function ParticlesBackground({
  count = 20,
  colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"]
}: ParticlesBackgroundProps) {
  // Usa useRef per memorizzare le particelle e evitare re-render
  const particlesRef = useRef<Particle[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Genera le particelle solo una volta all'inizializzazione
  useEffect(() => {
    // Evita di rigenerare le particelle se sono già state create
    if (particlesRef.current.length > 0) return;

    const generatedParticles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      // Calcola i valori casuali una sola volta durante l'inizializzazione
      const xRandom = Math.random() * 100 - 50;
      const yRandom = Math.random() * 100 - 50;
      const scaleRandom = Math.random() * 0.5 + 0.5;

      generatedParticles.push({
        id: i,
        x: Math.random() * 100, // posizione in percentuale
        y: Math.random() * 100,
        size: Math.random() * 6 + 2, // dimensione tra 2 e 8px
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: Math.random() * 20 + 10, // durata tra 10 e 30 secondi
        // Memorizza i valori di movimento per evitare di ricalcolarli ad ogni render
        xMovement: [0, xRandom, -xRandom / 2, 0],
        yMovement: [0, yRandom, -yRandom / 2, 0],
        scaleMovement: [1, 1 + scaleRandom / 2, 1 + scaleRandom / 3, 1],
      });
    }

    particlesRef.current = generatedParticles;
    setIsInitialized(true);
  }, []);  // Dipendenza vuota per eseguire solo al mount

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {isInitialized && particlesRef.current.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full opacity-20 dark:opacity-30"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            x: particle.xMovement,
            y: particle.yMovement,
            scale: particle.scaleMovement,
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
