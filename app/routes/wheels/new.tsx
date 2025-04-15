import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../../utils/supabase';
import { useAuthContext } from '../../components/AuthProvider';
import Layout from '../../components/Layout';
import type { FormEvent } from '../../types/global';
import type { Route } from './+types/new';
import type { Group } from '../../utils/supabase';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Crea Nuova Ruota - Decision Roulette' },
    { name: 'description', content: 'Crea una nuova ruota della fortuna personalizzata' },
  ];
}

interface WheelOption {
  text: string;
  color?: string;
  penalty?: string;
  bonus?: string;
}

export default function NewWheel() {
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState<WheelOption[]>([
    { text: '' },
    { text: '' },
  ]);
  // Rimosso il campo type poiché non è più presente nel nuovo schema
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();
  const navigate = useNavigate();

  // Carica i gruppi dell'utente
  useEffect(() => {
    if (!user) return;

    const fetchGroups = async () => {
      try {
        setLoadingGroups(true);

        // Ottieni i gruppi di cui l'utente è membro
        const { data, error } = await supabase
          .from('groups')
          .select('*')
          .or(`owner_id.eq.${user.id},id.in.(SELECT group_id FROM group_members WHERE user_id = '${user.id}')`);

        if (error) throw error;

        setGroups(data || []);
      } catch (err) {
        console.error('Errore nel recupero dei gruppi:', err);
      } finally {
        setLoadingGroups(false);
      }
    };

    fetchGroups();
  }, [user]);

  const handleOptionChange = (index: number, field: keyof WheelOption, value: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, { text: '' }]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) {
      alert('Una ruota deve avere almeno 2 opzioni');
      return;
    }

    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validazione
    if (!title.trim()) {
      setError('Il titolo è obbligatorio');
      return;
    }

    const validOptions = options.filter(opt => opt.text.trim() !== '');
    if (validOptions.length < 2) {
      setError('Devi inserire almeno 2 opzioni valide');
      return;
    }

    if (!user) {
      setError('Devi essere autenticato per creare una ruota');
      return;
    }

    setLoading(true);

    try {
      // Verifica che l'utente sia autenticato
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Sessione non valida. Effettua nuovamente l\'accesso.');
      }

      console.log('Utente autenticato:', session.user.id);

      // Crea la ruota
      const { data: wheel, error: wheelError } = await supabase
        .from('wheels')
        .insert([
          {
            title,
            owner_id: session.user.id,
            group_id: selectedGroupId || null
          }
        ])
        .select()
        .single();

      if (wheelError) throw wheelError;

      // Aggiungi le opzioni
      const wheelOptions = validOptions.map(opt => ({
        wheel_id: wheel.id,
        text: opt.text,
        color: opt.color || null,
        penalty: opt.penalty || null,
        bonus: opt.bonus || null,
      }));

      // Aggiungi le opzioni una alla volta per evitare problemi con l'inserimento in blocco
      for (const option of wheelOptions) {
        const { error: optionError } = await supabase
          .from('wheel_options')
          .insert([option]);

        if (optionError) {
          console.error('Errore nell\'inserimento dell\'opzione:', optionError);
          throw optionError;
        }
      }

      // Reindirizza alla pagina della ruota
      navigate(`/wheels/${wheel.id}`);
    } catch (err: any) {
      console.error('Errore nella creazione della ruota:', err);

      // Fornisci un messaggio di errore più specifico
      if (err.message) {
        setError(`Errore: ${err.message}`);
      } else if (err.details) {
        setError(`Errore: ${err.details}`);
      } else if (err.hint) {
        setError(`Suggerimento: ${err.hint}`);
      } else {
        setError('Impossibile creare la ruota. Riprova più tardi.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate('/auth/login');
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Crea una nuova ruota</h1>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Titolo della ruota
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Es. Dove andiamo a cena?"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="group" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Condividi con un gruppo (opzionale)
            </label>
            <select
              id="group"
              value={selectedGroupId || ''}
              onChange={(e) => setSelectedGroupId(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Nessun gruppo (privata)</option>
              {loadingGroups ? (
                <option disabled>Caricamento gruppi...</option>
              ) : groups.length === 0 ? (
                <option disabled>Nessun gruppo disponibile</option>
              ) : (
                groups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))
              )}
            </select>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Se selezioni un gruppo, tutti i membri potranno vedere e utilizzare questa ruota.
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Opzioni della ruota
            </label>

            {options.map((option, index) => (
              <div key={index} className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">Opzione {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={`option-text-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Testo
                    </label>
                    <input
                      type="text"
                      id={`option-text-${index}`}
                      value={option.text}
                      onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Es. Pizza"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor={`option-color-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Colore (opzionale)
                    </label>
                    <input
                      type="color"
                      id={`option-color-${index}`}
                      value={option.color || '#3b82f6'}
                      onChange={(e) => handleOptionChange(index, 'color', e.target.value)}
                      className="w-full h-10 px-1 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600"
                    />
                  </div>

                  <div>
                    <label htmlFor={`option-penalty-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Penitenza (opzionale)
                    </label>
                    <input
                      type="text"
                      id={`option-penalty-${index}`}
                      value={option.penalty || ''}
                      onChange={(e) => handleOptionChange(index, 'penalty', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Es. Paga il conto"
                    />
                  </div>

                  <div>
                    <label htmlFor={`option-bonus-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Bonus (opzionale)
                    </label>
                    <input
                      type="text"
                      id={`option-bonus-${index}`}
                      value={option.bonus || ''}
                      onChange={(e) => handleOptionChange(index, 'bonus', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Es. Scegli il prossimo locale"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addOption}
              className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Aggiungi opzione
            </button>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/wheels')}
              className="mr-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creazione in corso...
                </>
              ) : (
                'Crea Ruota'
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
