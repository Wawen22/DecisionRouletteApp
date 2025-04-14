import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuthContext } from '../../components/AuthProvider';
import { supabase } from '../../utils/supabase';
import type { FormEvent } from '../../types/global';
import type { Route } from './+types/register';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Registrati - Decision Roulette' },
    { name: 'description', content: 'Crea un nuovo account Decision Roulette' },
  ];
}

export default function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { signUp, user } = useAuthContext();
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

    // Validazione
    if (!username.trim()) {
      setError('Il nome utente è obbligatorio');
      return;
    }

    if (password !== confirmPassword) {
      setError('Le password non corrispondono');
      return;
    }

    if (password.length < 6) {
      setError('La password deve contenere almeno 6 caratteri');
      return;
    }

    setLoading(true);

    try {
      // Verifica se il nome utente è già in uso
      const { data: existingUsers, error: usernameError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .limit(1);

      if (usernameError) throw usernameError;

      if (existingUsers && existingUsers.length > 0) {
        setError('Questo nome utente è già in uso. Scegline un altro.');
        setLoading(false);
        return;
      }

      // Registra l'utente
      const { data, error: signUpError } = await signUp(email, password);

      if (signUpError) throw signUpError;

      if (data?.session) {
        // L'utente è stato autenticato immediatamente
        // Crea il profilo utente
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: data.user?.id,
            username,
            created_at: new Date().toISOString()
          }]);

        if (profileError) {
          console.error('Errore nella creazione del profilo:', profileError);
          // Continua comunque, il profilo può essere creato in seguito
        }

        navigate('/');
      } else {
        // È necessaria la conferma via email
        setSuccessMessage('Ti abbiamo inviato un\'email di conferma. Per favore, controlla la tua casella di posta. Dopo la conferma, il tuo profilo verrà creato automaticamente.');
      }
    } catch (err: any) {
      console.error('Errore durante la registrazione:', err);
      setError(err.message || 'Si è verificato un errore durante la registrazione');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center">
          <img src="/logo.svg" alt="Decision Roulette Logo" className="w-24 h-24 mb-4" />
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Crea un nuovo account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Oppure{' '}
            <Link to="/auth/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
              accedi se hai già un account
            </Link>
          </p>
        </div>

        {successMessage ? (
          <div className="rounded-md bg-green-50 dark:bg-green-900/30 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  {successMessage}
                </p>
              </div>
            </div>
          </div>
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
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome Utente
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="Il tuo nome utente"
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
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="Almeno 6 caratteri"
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Conferma Password
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="Ripeti la password"
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
                    Registrazione in corso...
                  </>
                ) : 'Registrati'}
              </button>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Registrandoti, accetti i nostri{' '}
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                    Termini di Servizio
                  </a>{' '}
                  e la nostra{' '}
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                    Privacy Policy
                  </a>
                </p>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
