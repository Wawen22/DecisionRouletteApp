import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuthContext } from '../../components/AuthProvider';
import type { FormEvent } from '../../types/global';
import type { Route } from './+types/login';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Accedi - Decision Roulette' },
    { name: 'description', content: 'Accedi al tuo account Decision Roulette' },
  ];
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetPasswordMode, setResetPasswordMode] = useState(false);
  const [resetPasswordEmail, setResetPasswordEmail] = useState('');
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState(false);
  const { signIn, resetPassword, user } = useAuthContext();
  const navigate = useNavigate();

  // Reindirizza se l'utente è già autenticato
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      navigate('/');
    } catch (err: any) {
      console.error('Errore durante l\'accesso:', err);
      setError(err.message || 'Si è verificato un errore durante l\'accesso');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await resetPassword(resetPasswordEmail);

      if (error) throw error;

      setResetPasswordSuccess(true);
    } catch (err: any) {
      console.error('Errore durante il reset della password:', err);
      setError(err.message || 'Si è verificato un errore durante il reset della password');
    } finally {
      setLoading(false);
    }
  };

  const toggleResetPasswordMode = () => {
    setResetPasswordMode(!resetPasswordMode);
    setError(null);
    setResetPasswordSuccess(false);
    // Precompila l'email se è già stata inserita nel form di login
    if (!resetPasswordMode && email) {
      setResetPasswordEmail(email);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center">
          <img src="/logo.svg" alt="Decision Roulette Logo" className="w-24 h-24 mb-4" />
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {resetPasswordMode ? 'Recupera la tua password' : 'Accedi al tuo account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {resetPasswordMode ? (
              <button
                type="button"
                onClick={toggleResetPasswordMode}
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Torna al login
              </button>
            ) : (
              <>
                Oppure{' '}
                <Link to="/auth/register" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                  registrati se non hai un account
                </Link>
              </>
            )}
          </p>
        </div>

        {resetPasswordMode ? (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            {resetPasswordSuccess ? (
              <div className="rounded-md bg-green-50 dark:bg-green-900/30 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      Ti abbiamo inviato un'email con le istruzioni per reimpostare la tua password. Controlla la tua casella di posta.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Indirizzo Email
                  </label>
                  <input
                    id="reset-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={resetPasswordEmail}
                    onChange={(e) => setResetPasswordEmail(e.target.value)}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    placeholder="esempio@email.com"
                  />
                </div>

                {error && (
                  <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                          {error}
                        </h3>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Invio in corso...
                    </>
                  ) : 'Invia istruzioni'}
                </button>
              </div>
            )}
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Indirizzo Email
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="esempio@email.com"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="La tua password"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                      {error}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-800 dark:border-gray-700"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  Ricordami
                </label>
              </div>

              <div className="text-sm">
                <button
                  type="button"
                  onClick={toggleResetPasswordMode}
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  Password dimenticata?
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Accesso in corso...
                  </>
                ) : 'Accedi'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
