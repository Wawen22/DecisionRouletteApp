import { useState, useEffect } from 'react';
// Link component is not used, using <a> tags instead
import { supabase } from '../../utils/supabase';
import { useAuthContext } from '../../components/AuthProvider';
import WheelCard from '../../components/WheelCard';
import Layout from '../../components/Layout';
import type { Wheel } from '../../utils/supabase';
import type { Route } from './+types/index';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Le mie ruote - Decision Roulette' },
    { name: 'description', content: 'Gestisci le tue ruote della fortuna' },
  ];
}

export default function WheelsList() {
  const [wheels, setWheels] = useState<Wheel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();

  useEffect(() => {
    if (!user) return;

    const fetchWheels = async () => {
      try {
        setLoading(true);

        // Ottieni le ruote personali dell'utente
        const { data, error } = await supabase
          .from('wheels')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setWheels(data || []);
      } catch (err: any) {
        console.error('Errore nel recupero delle ruote:', err);
        setError('Impossibile caricare le ruote. Riprova più tardi.');
      } finally {
        setLoading(false);
      }
    };

    fetchWheels();

    // Configura un listener per i cambiamenti in tempo reale
    const wheelSubscription = supabase
      .channel('wheels_changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wheels',
          filter: `owner_id=eq.${user.id}`
        },
        () => {
          fetchWheels();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(wheelSubscription);
    };
  }, [user]);

  const handleDeleteWheel = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa ruota?')) return;

    try {
      const { error } = await supabase
        .from('wheels')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Aggiorna la lista delle ruote
      setWheels(wheels.filter(wheel => wheel.id !== id));
    } catch (err: any) {
      console.error('Errore nell\'eliminazione della ruota:', err);
      alert('Impossibile eliminare la ruota. Riprova più tardi.');
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto p-4 text-center">
          <p className="mb-4">Devi accedere per visualizzare le tue ruote.</p>
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
          <h1 className="text-2xl font-bold">Le mie ruote</h1>
          <a
            href="/wheels/new"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Nuova Ruota
          </a>
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
        ) : wheels.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Non hai ancora creato nessuna ruota.</p>
            <Link
              to="/wheels/new"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Crea la tua prima ruota
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wheels.map((wheel) => (
              <WheelCard
                key={wheel.id}
                wheel={wheel}
                onDelete={handleDeleteWheel}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
