import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../../utils/supabase';
import { useAuthContext } from '../../components/AuthProvider';
import Layout from '../../components/Layout';
import type { FormEvent } from '../../types/global';
import type { Profile } from '../../utils/supabase';
import type { Route } from './+types/index';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Profilo - Decision Roulette' },
    { name: 'description', content: 'Gestisci il tuo profilo Decision Roulette' },
  ];
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { user, signOut } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);

        // Ottieni il profilo dell'utente
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          // PGRST116 significa che non è stato trovato nessun record
          throw error;
        }

        if (data) {
          setProfile(data);
          setUsername(data.username || '');
        }
      } catch (err: any) {
        console.error('Errore nel recupero del profilo:', err);
        setError('Impossibile caricare il profilo. Riprova più tardi.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!user) return;

    // Validazione
    if (!username.trim()) {
      setError('Il nome utente è obbligatorio');
      return;
    }

    setUpdating(true);

    try {
      const updates = {
        id: user.id,
        username,
        updated_at: new Date().toISOString(),
      };

      // Se il profilo non esiste, crealo
      if (!profile) {
        const { error } = await supabase
          .from('profiles')
          .insert([updates]);

        if (error) throw error;
      } else {
        // Altrimenti, aggiornalo
        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id);

        if (error) throw error;
      }

      setSuccessMessage('Profilo aggiornato con successo');
      setProfile({ ...profile, username } as Profile);
    } catch (err: any) {
      console.error('Errore nell\'aggiornamento del profilo:', err);
      setError('Impossibile aggiornare il profilo. Riprova più tardi.');
    } finally {
      setUpdating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (err: any) {
      console.error('Errore durante il logout:', err);
      setError('Impossibile effettuare il logout. Riprova più tardi.');
    }
  };

  if (!user) {
    navigate('/auth/login');
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Il mio profilo</h1>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
            <p>{successMessage}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={user.email || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  L'indirizzo email non può essere modificato
                </p>
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome utente
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Il tuo nome utente"
                  required
                />
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm7 2a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1zm0 6a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                  </svg>
                  Logout
                </button>

                <button
                  type="submit"
                  disabled={updating}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {updating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Aggiornamento...
                    </>
                  ) : (
                    'Salva Profilo'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}
