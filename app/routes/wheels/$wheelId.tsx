import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { supabase } from '../../utils/supabase';
import { useAuthContext } from '../../components/AuthProvider';
import RouletteWheel from '../../components/RouletteWheel';
import Layout from '../../components/Layout';
import type { Wheel, WheelOption, Spin } from '../../utils/supabase';
import type { Route } from './+types/$wheelId';

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Ruota - Decision Roulette` },
    { name: 'description', content: 'Gira la ruota e scopri il risultato!' },
  ];
}

export default function WheelDetail() {
  const { wheelId } = useParams();
  const [wheel, setWheel] = useState<Wheel | null>(null);
  const [options, setOptions] = useState<WheelOption[]>([]);
  const [spins, setSpins] = useState<Spin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!wheelId || !user) return;

    const fetchWheelData = async () => {
      try {
        setLoading(true);

        // Ottieni i dettagli della ruota
        const { data: wheelData, error: wheelError } = await supabase
          .from('wheels')
          .select('*')
          .eq('id', wheelId)
          .single();

        if (wheelError) throw wheelError;

        // Verifica che l'utente abbia accesso a questa ruota
        if (wheelData.owner_id !== user.id) {
          // Qui andrebbe aggiunta la logica per verificare se l'utente fa parte del gruppo
          // nel caso di una ruota di gruppo
          throw new Error('Non hai accesso a questa ruota');
        }

        setWheel(wheelData);

        // Ottieni le opzioni della ruota
        const { data: optionsData, error: optionsError } = await supabase
          .from('wheel_options')
          .select('*')
          .eq('wheel_id', wheelId);

        if (optionsError) throw optionsError;

        setOptions(optionsData || []);

        // Ottieni la cronologia degli spin
        const { data: spinsData, error: spinsError } = await supabase
          .from('spins')
          .select('*')
          .eq('wheel_id', wheelId)
          .order('spun_at', { ascending: false })
          .limit(10);

        console.log('Spin data:', spinsData);

        if (spinsError) throw spinsError;

        setSpins(spinsData || []);
      } catch (err: any) {
        console.error('Errore nel recupero dei dati della ruota:', err);
        setError(err.message || 'Impossibile caricare i dati della ruota. Riprova più tardi.');
      } finally {
        setLoading(false);
      }
    };

    fetchWheelData();

    // Configura un listener per i cambiamenti in tempo reale
    const spinSubscription = supabase
      .channel('spins_changes')
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'spins',
          filter: `wheel_id=eq.${wheelId}`
        },
        () => {
          // Aggiorna la cronologia degli spin
          fetchWheelData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(spinSubscription);
    };
  }, [wheelId, user]);

  const handleSpinEnd = async (option: Omit<WheelOption, 'id' | 'wheel_id'>) => {
    if (!user || !wheel || !wheelId) {
      console.error('Dati mancanti per registrare lo spin:', { user, wheel, wheelId });
      return;
    }

    try {
      // Trova l'opzione corrispondente nel database
      const selectedOption = options.find(opt => opt.text === option.text);
      if (!selectedOption) {
        console.error('Opzione non trovata nel database:', option.text, options);
        return;
      }

      console.log('Registrazione spin con opzione:', selectedOption);

      // Registra lo spin nel database
      const { data, error } = await supabase
        .from('spins')
        .insert([
          {
            wheel_id: wheelId,
            user_id: user.id,
            result_option_id: selectedOption.id,
          }
        ])
        .select();

      if (error) {
        throw error;
      }

      console.log('Spin registrato con successo:', data);

      // Aggiorna la lista degli spin
      const { data: updatedSpins, error: spinsError } = await supabase
        .from('spins')
        .select('*')
        .eq('wheel_id', wheelId)
        .order('spun_at', { ascending: false })
        .limit(10);

      if (spinsError) {
        console.error('Errore nel recupero degli spin aggiornati:', spinsError);
      } else {
        setSpins(updatedSpins || []);
      }
    } catch (err) {
      console.error('Errore nel salvataggio dello spin:', err);
    }
  };

  if (!user) {
    navigate('/auth/login');
    return null;
  }

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-4 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (error || !wheel) {
    return (
      <Layout>
        <div className="container mx-auto p-4">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error || 'Ruota non trovata'}</p>
          </div>
          <button
            onClick={() => navigate('/wheels')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Torna alle ruote
          </button>
        </div>
      </Layout>
    );
  }



  return (
    <Layout>
      <div className="container mx-auto p-4 overflow-hidden" style={{ position: 'relative', zIndex: 1, maxWidth: '100%' }}>
        <div className="mb-6">
          <button
            onClick={() => navigate('/wheels')}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Torna alle ruote
          </button>
        </div>

        <div className="mb-8 relative pt-4">
          <div className="text-center px-8">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mb-4 inline-block">{wheel.title}</h1>
          </div>

          <button
            onClick={() => navigate(`/wheels/edit/${wheelId}`)}
            className="absolute right-0 top-0 w-8 h-8 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 hover:shadow-lg"
            aria-label="Modifica ruota"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>

        <div className="mb-8">
          <RouletteWheel
            options={options.map(({ id, wheel_id, ...rest }) => rest)}
            onSpinEnd={handleSpinEnd}
          />
        </div>

        {spins.length > 0 && (
          <div className="bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-6 mt-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -mr-10 -mt-10 z-0"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-amber-500/10 to-pink-500/10 rounded-full -ml-8 -mb-8 z-0"></div>

            <h2 className="text-xl font-bold mb-6 flex items-center relative z-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">Cronologia</span>
            </h2>

            <div className="overflow-hidden rounded-xl shadow-inner bg-white/50 dark:bg-gray-900/50 relative z-10">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Data
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Risultato
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm divide-y divide-gray-200 dark:divide-gray-700">
                    {spins.map((spin, index) => (
                      <tr key={spin.id} className={index === 0 ? "bg-amber-50/50 dark:bg-amber-900/20" : ""}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(spin.spun_at).toLocaleString('it-IT')}
                          {index === 0 && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">Ultimo</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span className={index === 0 ? "font-bold" : ""}>
                            {options.find(opt => opt.id === spin.result_option_id)?.text || 'Opzione non trovata'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
