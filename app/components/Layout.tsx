import { useLocation } from 'react-router';
import { useState, useEffect } from 'react';
import type { ReactNode } from '../types/global';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Imposta il tema in base alle preferenze del sistema, ma solo lato client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);

      if (prefersDark && typeof document !== 'undefined') {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark');
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <a href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
            Decision Roulette
          </a>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label={isDarkMode ? 'Passa alla modalità chiara' : 'Passa alla modalità scura'}
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <a
              href="/profile"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"
              aria-label="Profilo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-20"> {/* Aggiunto padding-bottom per evitare che il contenuto venga nascosto dal menu */}
        {children}
      </main>

      <nav id="mobileNav" className="bg-white dark:bg-gray-900 fixed bottom-0 left-0 right-0 z-[9999] mobile-nav" style={{ position: 'fixed !important', bottom: '0 !important', left: '0 !important', right: '0 !important', zIndex: '9999 !important', transform: 'translate3d(0,0,0) !important', WebkitTransform: 'translate3d(0,0,0) !important' }}>
        <div className="container mx-auto px-4 py-2">
          <ul className="flex justify-around items-center relative">
            <li>
              <a
                href="/"
                className={`flex flex-col items-center p-2 mobile-nav-item ${
                  isActive('/') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-xs mt-1">Home</span>
              </a>
            </li>
            <li>
              <a
                href="/wheels"
                className={`flex flex-col items-center p-2 mobile-nav-item ${
                  isActive('/wheels') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs mt-1">Ruote</span>
              </a>
            </li>

            {/* Pulsante centrale per aggiungere una nuova ruota */}
            <li className="relative -top-5">
              <div className="relative">
                {/* Effetto glow */}
                <div className="absolute inset-0 rounded-full bg-amber-500/30 blur-md animate-pulse"></div>
                <a
                  href="/wheels/new"
                  className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-amber-700 text-white shadow-xl border-4 border-white dark:border-gray-900 relative z-10 transition-transform hover:scale-110 active:scale-95"
                  aria-label="Crea nuova ruota"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
              <span className="text-xs text-center block mt-1 text-amber-600 dark:text-amber-400 font-medium">Nuova</span>
            </li>

            <li>
              <a
                href="/groups"
                className={`flex flex-col items-center p-2 mobile-nav-item ${
                  isActive('/groups') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-xs mt-1">Gruppi</span>
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* Non abbiamo più bisogno di questo spazio perché abbiamo aggiunto padding-bottom al main */}
    </div>
  );
}
