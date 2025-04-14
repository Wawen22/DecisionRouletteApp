import { useState, useEffect } from 'react';
// Link component is not used, using <a> tags instead
import { supabase } from '../../utils/supabase';
import { useAuthContext } from '../../components/AuthProvider';
import Layout from '../../components/Layout';
import type { Group } from '../../utils/supabase';
import type { Route } from './+types/index';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Gruppi - Decision Roulette' },
    { name: 'description', content: 'Gestisci i tuoi gruppi di amici' },
  ];
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();

  useEffect(() => {
    if (!user) return;

    const fetchGroups = async () => {
      try {
        setLoading(true);

        // Ottieni i gruppi di cui l'utente è membro
        const { data, error } = await supabase
          .from('groups')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setGroups(data || []);
      } catch (err: any) {
        console.error('Errore nel recupero dei gruppi:', err);
        setError('Impossibile caricare i gruppi. Riprova più tardi.');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [user]);

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto p-4 text-center">
          <p className="mb-4">Devi accedere per visualizzare i tuoi gruppi.</p>
          <a href="/auth/login" className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            Accedi
          </a>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">I miei gruppi</h1>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Nuovo Gruppo
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : groups.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Non hai ancora creato nessun gruppo.</p>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              I gruppi ti permettono di condividere ruote della fortuna con i tuoi amici e giocare insieme.
            </p>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Crea il tuo primo gruppo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <div
                key={group.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                    {group.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Creato il {new Date(group.created_at).toLocaleDateString('it-IT')}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex justify-between">
                  <button
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    Visualizza
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                  >
                    Elimina
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
