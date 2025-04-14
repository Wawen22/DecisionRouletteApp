import { useState, useEffect, useRef } from 'react';
import type { WheelOption } from '../utils/supabase';
import Confetti from './Confetti';

interface RouletteWheelProps {
  options: Omit<WheelOption, 'id' | 'wheel_id'>[];
  onSpinEnd?: (option: Omit<WheelOption, 'id' | 'wheel_id'>) => void;
}

export default function RouletteWheel({ options, onSpinEnd }: RouletteWheelProps) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedOption, setSelectedOption] = useState<Omit<WheelOption, 'id' | 'wheel_id'> | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const wheelRef = useRef<SVGSVGElement>(null);
  const spinSoundRef = useRef<HTMLAudioElement | null>(null);
  const resultSoundRef = useRef<HTMLAudioElement | null>(null);

  // Inizializza i suoni
  useEffect(() => {
    if (typeof window !== 'undefined') {
      spinSoundRef.current = new Audio('/sounds/spinning.mp3');
      resultSoundRef.current = new Audio('/sounds/result.mp3');
    }
  }, []);

  // Gestisce la visibilità del menu durante l'animazione
  useEffect(() => {
    const mobileNav = document.getElementById('mobileNav');
    if (!mobileNav) return;

    // Aggiungiamo una classe al body per prevenire lo scroll durante l'animazione
    if (spinning) {
      document.body.classList.add('overflow-hidden');
      // Nascondi il menu durante l'animazione usando una classe invece di stili inline
      mobileNav.classList.add('nav-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
      // Mostra il menu quando l'animazione è terminata
      mobileNav.classList.remove('nav-hidden');
    }

    // Cleanup function
    return () => {
      document.body.classList.remove('overflow-hidden');
      if (mobileNav) mobileNav.classList.remove('nav-hidden');
    };
  }, [spinning]);

  // Funzione per generare colori vivaci
  const getColor = (color?: string, index?: number) => {
    if (color) return color;

    // Colori vivaci predefiniti
    const colors = [
      '#FF3366', '#FF9933', '#FFCC33', '#33CC66',
      '#3399FF', '#9966FF', '#FF6699', '#66CCCC',
      '#FF5733', '#C70039', '#44BD32', '#3498DB',
      '#8E44AD', '#F1C40F', '#16A085', '#E74C3C'
    ];

    // Se viene fornito un indice, usa quello, altrimenti scegli casualmente
    if (index !== undefined) {
      return colors[index % colors.length];
    }

    return colors[Math.floor(Math.random() * colors.length)];
  };

  const spinWheel = () => {
    if (spinning || options.length === 0) return;

    setSpinning(true);
    setSelectedOption(null);

    // Nascondi il menu durante l'animazione
    const mobileNav = document.getElementById('mobileNav');
    if (mobileNav) {
      // Nascondi il menu usando una classe invece di stili inline
      mobileNav.classList.add('nav-hidden');
      // Previeni lo scroll durante l'animazione
      document.body.classList.add('overflow-hidden');
    }

    // Riproduci il suono di rotazione
    if (spinSoundRef.current) {
      spinSoundRef.current.currentTime = 0;
      spinSoundRef.current.play().catch(e => console.error('Errore nella riproduzione del suono:', e));
    }

    // Calcola un numero casuale di rotazioni (da 3 a 5 giri completi)
    const spinDegrees = 1080 + Math.floor(Math.random() * 720);

    // Calcola la posizione finale
    const finalRotation = rotation + spinDegrees;
    setRotation(finalRotation);

    // Determina l'opzione selezionata dopo la rotazione
    setTimeout(() => {
      // Il menu verrà mostrato automaticamente quando setSpinning(false) viene chiamato
      // grazie all'useEffect che abbiamo implementato

      // Ferma il suono di rotazione
      if (spinSoundRef.current) {
        spinSoundRef.current.pause();
      }

      // Riproduci il suono del risultato
      if (resultSoundRef.current) {
        resultSoundRef.current.currentTime = 0;
        resultSoundRef.current.play().catch(e => console.error('Errore nella riproduzione del suono:', e));
      }

      const degreesPerOption = 360 / options.length;
      const normalizedDegrees = finalRotation % 360;
      const optionIndex = Math.floor(normalizedDegrees / degreesPerOption);
      const selected = options[options.length - 1 - optionIndex];

      setSelectedOption(selected);
      setSpinning(false);

      // Attiva i confetti
      setShowConfetti(true);

      // Disattiva i confetti dopo 3 secondi
      setTimeout(() => {
        setShowConfetti(false);
      }, 3000);

      if (onSpinEnd) {
        onSpinEnd(selected);
      }
    }, 5000); // Durata dell'animazione
  };

  // Funzione per troncare il testo se è troppo lungo
  const truncateText = (text: string, maxLength: number = 12) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  };

  // Calcola le coordinate SVG per la ruota
  const svgSize = 500; // Dimensione del SVG
  const centerX = svgSize / 2;
  const centerY = svgSize / 2;
  const radius = svgSize / 2 - 10; // Raggio della ruota

  // Genera i settori della ruota
  const sectors = options.map((option, index) => {
    const anglePerSector = 360 / options.length;
    const startAngle = index * anglePerSector;
    const endAngle = (index + 1) * anglePerSector;

    // Converti gli angoli in radianti
    const startRad = (startAngle - 90) * Math.PI / 180; // -90 per iniziare dall'alto
    const endRad = (endAngle - 90) * Math.PI / 180;

    // Calcola i punti del settore
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    // Flag per l'arco
    const largeArcFlag = anglePerSector > 180 ? 1 : 0;

    // Crea il path SVG per il settore
    const path = `
      M ${centerX} ${centerY}
      L ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
      Z
    `;

    // Calcola la posizione del testo
    const textAngle = startAngle + anglePerSector / 2;
    const textRad = (textAngle - 90) * Math.PI / 180;
    const textDistance = radius * 0.65; // Posiziona il testo a 65% del raggio
    const textX = centerX + textDistance * Math.cos(textRad);
    const textY = centerY + textDistance * Math.sin(textRad);

    // Determina se il testo deve essere capovolto per essere leggibile
    // Testo nella parte superiore della ruota (270-90 gradi)
    const needsFlip = textAngle > 90 && textAngle < 270;
    const adjustedTextAngle = needsFlip ? textAngle + 180 : textAngle;

    // Tronca il testo se necessario
    const displayText = truncateText(option.text, options.length > 8 ? 8 : 12);

    return {
      path,
      color: getColor(option.color, index),
      text: displayText,
      textX,
      textY,
      textAngle: adjustedTextAngle,
      needsFlip
    };
  });

  return (
    <div className="flex flex-col items-center gap-8 relative z-10 transform-gpu overflow-hidden max-w-full" style={{ willChange: 'transform', isolation: 'isolate', position: 'relative' }}>
      <Confetti active={showConfetti} duration={3000} />
      <div className="wheel-container" style={{ position: 'relative', zIndex: 10, marginTop: '15px' }}>
        {/* Indicatore */}
        <div className="wheel-pointer">
          <svg viewBox="0 0 40 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="pointerShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.3" />
              </filter>
              <linearGradient id="pointerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>
            <path d="M20 20L40 0H0L20 20Z" fill="url(#pointerGradient)" filter="url(#pointerShadow)" />
          </svg>
        </div>

        <div className="wheel-svg-container">
          <svg
            ref={wheelRef}
            className="wheel-svg"
            viewBox={`0 0 ${svgSize} ${svgSize}`}
            style={{ transform: `rotate(${rotation}deg)`, willChange: 'transform', transformStyle: 'preserve-3d' }}
          >
            <defs>
              <filter id="wheelShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#000" floodOpacity="0.3" />
              </filter>
              <linearGradient id="wheelBorder" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f0f0f0" />
                <stop offset="100%" stopColor="#d0d0d0" />
              </linearGradient>
            </defs>

            {/* Effetto glow esterno */}
            <circle
              cx={centerX}
              cy={centerY}
              r={radius + 15}
              fill="none"
              stroke="url(#wheelBorder)"
              strokeWidth="2"
              opacity="0.5"
              className="animate-pulse-slow"
            />

            {/* Bordo esterno */}
            <circle
              cx={centerX}
              cy={centerY}
              r={radius + 5}
              fill="url(#wheelBorder)"
              filter="url(#wheelShadow)"
              stroke="#e0e0e0"
              strokeWidth="2"
            />

            {/* Riflesso */}
            <ellipse
              cx={centerX}
              cy={centerY - radius * 0.6}
              rx={radius * 0.8}
              ry={radius * 0.2}
              fill="white"
              opacity="0.1"
            />

            {/* Settori della ruota */}
            <g>
              {sectors.map((sector, index) => (
                <path
                  key={index}
                  d={sector.path}
                  fill={sector.color}
                  stroke="white"
                  strokeWidth="2"
                />
              ))}
            </g>

            {/* Testo per ogni settore */}
            <g>
              {sectors.map((sector, index) => (
                <text
                  key={`text-${index}`}
                  x={sector.textX}
                  y={sector.textY}
                  className="wheel-text"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${sector.textAngle}, ${sector.textX}, ${sector.textY})`}
                  fontSize={options.length > 8 ? '12px' : '14px'}
                  fontWeight="bold"
                >
                  {sector.text}
                </text>
              ))}
            </g>

            {/* Centro della ruota */}
            <circle
              cx={centerX}
              cy={centerY}
              r={radius * 0.15}
              className="wheel-center"
            />
          </svg>
        </div>
      </div>

      <button
        onClick={spinWheel}
        disabled={spinning || options.length === 0}
        className="spin-button relative overflow-hidden group"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
        <span className="relative z-10">
          {spinning ? (
            <>
              <span className="inline-block animate-spin mr-2">⟳</span>
              Girando...
            </>
          ) : (
            <>Gira la Ruota! <span className="ml-1">🎯</span></>
          )}
        </span>
      </button>

      {selectedOption && (
        <div className="wheel-result bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 border-none shadow-xl">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
            Risultato
          </div>
          <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mt-2">{selectedOption.text}</p>
          {selectedOption.penalty && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg border-l-4 border-red-500">
              <p className="text-red-600 dark:text-red-400 font-semibold flex items-center">
                <span className="mr-2">⚠️</span> Penitenza: {selectedOption.penalty}
              </p>
            </div>
          )}
          {selectedOption.bonus && (
            <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg border-l-4 border-green-500">
              <p className="text-green-600 dark:text-green-400 font-semibold flex items-center">
                <span className="mr-2">🎁</span> Bonus: {selectedOption.bonus}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
