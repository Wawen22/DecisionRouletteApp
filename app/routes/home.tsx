// Link component is not used, using <a> tags instead
import { useAuthContext } from "../components/AuthProvider";
import Layout from "../components/Layout";
import type { Route } from "./+types/home";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import ParticlesBackground from "../components/ParticlesBackground";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Decision Roulette" },
    { name: "description", content: "Una app social e colorata per decidere insieme!" },
  ];
}

// Animation variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

const buttonVariants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.05,
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  },
  tap: { scale: 0.95 }
};

// Definizione dei tipi per le props del componente BackgroundCircle
type BackgroundCircleProps = {
  size: number;
  color: string;
  x: number;
  y: number;
  duration: number;
  delay: number;
};

// Background circle component for animated background
const BackgroundCircle = ({ size, color, x, y, duration, delay }: BackgroundCircleProps) => {
  return (
    <motion.div
      className="absolute rounded-full opacity-30 dark:opacity-20"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        left: x,
        top: y,
        filter: "blur(40px)"
      }}
      animate={{
        x: [0, 30, -20, 0],
        y: [0, -40, 20, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }}
    />
  );
};

export default function Home() {
  const { user } = useAuthContext();
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate loading to ensure animations trigger properly
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Layout>
      <div className="container mx-auto p-4 relative overflow-hidden" ref={containerRef}>
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <BackgroundCircle size={300} color="#3b82f6" x={-50} y={-50} duration={15} delay={0} />
          <BackgroundCircle size={200} color="#10b981" x={400} y={100} duration={18} delay={2} />
          <BackgroundCircle size={250} color="#f59e0b" x={150} y={400} duration={20} delay={1} />
          <BackgroundCircle size={180} color="#8b5cf6" x={500} y={300} duration={17} delay={3} />
        </div>

        {/* Animated particles */}
        <ParticlesBackground count={30} />

        {/* Content with animations */}
        <AnimatePresence>
          {isLoaded && (
            <motion.div
              className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] relative z-10"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Animated logo */}
              <motion.div
                className="mb-8 relative"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 300, damping: 15 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-blue-500/30 dark:to-purple-500/30 rounded-full blur-xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "easeInOut"
                  }}
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <motion.img
                    src="/logo.svg"
                    alt="Decision Roulette Logo"
                    className="w-40 h-40 drop-shadow-xl relative z-10"
                    whileHover={{ scale: 1.1, rotate: -10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
                  />
                </motion.div>
              </motion.div>

              <motion.div className="text-center max-w-2xl mx-auto" variants={itemVariants}>
                <motion.div
                  className="relative mb-6"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
                >
                  <motion.h1
                    className="text-5xl font-bold text-gray-900 dark:text-white relative z-10"
                  >
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400">
                      Decision Roulette
                    </span>
                  </motion.h1>
                  <motion.div
                    className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 rounded-full"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "100%", opacity: 1 }}
                    transition={{ delay: 1, duration: 0.8 }}
                  />
                </motion.div>

                <motion.p
                  className="text-2xl mb-4 text-center text-gray-700 dark:text-gray-300 font-medium"
                  variants={itemVariants}
                >
                  Una app social e colorata per decidere insieme!
                </motion.p>

                <motion.div
                  className="mb-10 text-center max-w-md mx-auto bg-white/50 dark:bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm shadow-lg border border-gray-200 dark:border-gray-700"
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center justify-center mb-3">
                    <motion.div
                      className="w-8 h-8 bg-blue-500 rounded-full mr-2"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 1, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
                    />
                    <motion.div
                      className="w-8 h-8 bg-green-500 rounded-full mr-2"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 1, delay: 0.2, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
                    />
                    <motion.div
                      className="w-8 h-8 bg-amber-500 rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 1, delay: 0.4, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
                    />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    Crea ruote della fortuna personalizzate, condividile con i tuoi amici e prendi decisioni in modo divertente.
                  </p>
                </motion.div>
              </motion.div>

              <motion.div
                className="w-full max-w-md mx-auto"
                variants={itemVariants}
              >
                {user ? (
                  <motion.div
                    className="flex flex-col items-center gap-6"
                    variants={containerVariants}
                  >
                    <motion.p
                      className="text-xl font-medium text-gray-800 dark:text-gray-200"
                      variants={itemVariants}
                    >
                      Bentornato! Cosa vuoi fare oggi?
                    </motion.p>

                    <motion.div
                      className="flex flex-wrap justify-center gap-6 w-full"
                      variants={containerVariants}
                    >
                      <motion.div
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                        className="w-full sm:w-auto"
                      >
                        <a
                          href="/wheels"
                          className="bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg flex items-center justify-center w-full transition-all duration-300 border border-blue-400 dark:border-blue-600 backdrop-blur-sm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                          Le mie ruote
                        </a>
                      </motion.div>

                      <motion.div
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                        className="w-full sm:w-auto"
                      >
                        <a
                          href="/wheels/new"
                          className="bg-gradient-to-r from-green-500 to-green-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg flex items-center justify-center w-full transition-all duration-300 border border-green-400 dark:border-green-600 backdrop-blur-sm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          Crea nuova ruota
                        </a>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    className="flex flex-col sm:flex-row justify-center gap-6 w-full"
                    variants={containerVariants}
                  >
                    <motion.div
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className="w-full sm:w-auto"
                    >
                      <a
                        href="/auth/login"
                        className="bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg flex items-center justify-center w-full transition-all duration-300 border border-blue-400 dark:border-blue-600 backdrop-blur-sm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Accedi
                      </a>
                    </motion.div>

                    <motion.div
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className="w-full sm:w-auto"
                    >
                      <a
                        href="/auth/register"
                        className="bg-gradient-to-r from-green-500 to-green-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg flex items-center justify-center w-full transition-all duration-300 border border-green-400 dark:border-green-600 backdrop-blur-sm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                        </svg>
                        Registrati
                      </a>
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>

              {/* Il pulsante flottante è stato spostato nel menu di navigazione */}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
