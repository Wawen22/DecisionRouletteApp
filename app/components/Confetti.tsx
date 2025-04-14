import { useEffect, useRef } from 'react';

interface ConfettiProps {
  active: boolean;
  duration?: number;
}

export default function Confetti({ active, duration = 3000 }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const confettiRef = useRef<any[]>([]);
  const frameRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Imposta le dimensioni del canvas
    const setCanvasSize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Crea i confetti
    const createConfetti = () => {
      const colors = ['#FF3366', '#FF9933', '#FFCC33', '#33CC66', '#3399FF', '#9966FF', '#FF6699'];
      const shapes = ['circle', 'square', 'triangle'];
      const confetti = [];

      for (let i = 0; i < 150; i++) {
        confetti.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height - canvas.height,
          size: Math.random() * 10 + 5,
          color: colors[Math.floor(Math.random() * colors.length)],
          shape: shapes[Math.floor(Math.random() * shapes.length)],
          speed: Math.random() * 3 + 2,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 5,
          oscillationSpeed: Math.random() * 2,
          oscillationDistance: Math.random() * 5,
        });
      }

      confettiRef.current = confetti;
    };

    // Disegna i confetti
    const drawConfetti = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      confettiRef.current.forEach((confetto) => {
        ctx.save();
        ctx.translate(confetto.x, confetto.y);
        ctx.rotate((confetto.rotation * Math.PI) / 180);
        ctx.fillStyle = confetto.color;

        if (confetto.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, confetto.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (confetto.shape === 'square') {
          ctx.fillRect(-confetto.size / 2, -confetto.size / 2, confetto.size, confetto.size);
        } else if (confetto.shape === 'triangle') {
          ctx.beginPath();
          ctx.moveTo(0, -confetto.size / 2);
          ctx.lineTo(confetto.size / 2, confetto.size / 2);
          ctx.lineTo(-confetto.size / 2, confetto.size / 2);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();

        // Aggiorna la posizione
        confetto.y += confetto.speed;
        confetto.x += Math.sin(confetto.y * confetto.oscillationSpeed) * confetto.oscillationDistance;
        confetto.rotation += confetto.rotationSpeed;

        // Resetta il confetto se esce dallo schermo
        if (confetto.y > canvas.height) {
          confetto.y = -confetto.size;
          confetto.x = Math.random() * canvas.width;
        }
      });

      frameRef.current = requestAnimationFrame(drawConfetti);
    };

    createConfetti();
    drawConfetti();

    // Ferma l'animazione dopo la durata specificata
    timerRef.current = setTimeout(() => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    }, duration);

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [active, duration]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-50"
    />
  );
}
