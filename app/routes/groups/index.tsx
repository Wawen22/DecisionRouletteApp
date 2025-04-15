import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../../utils/supabase';
import { useAuthContext } from '../../components/AuthProvider';
import Layout from '../../components/Layout';
import type { Group, GroupMember } from '../../utils/supabase';
import type { Route } from './+types/index';
import type { FormEvent } from '../../types/global';

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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [creatingGroup, setCreatingGroup] = useState(false);
  const { user } = useAuthContext();
  const navigate = useNavigate();

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

  const handleCreateGroup = async (e: FormEvent) => {
    e.preventDefault();

    if (!user) return;
    if (!newGroupName.trim()) {
      setError('Il nome del gruppo è obbligatorio');
      return;
    }

    try {
      setCreatingGroup(true);
      setError(null);

      // Crea il nuovo gruppo
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: newGroupName.trim(),
          description: newGroupDescription.trim() || null,
          owner_id: user.id
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Aggiungi il creatore come membro admin del gruppo
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupData.id,
          user_id: user.id,
          role: 'admin'
        });

      if (memberError) throw memberError;

      // Aggiorna la lista dei gruppi
      setGroups([groupData, ...groups]);

      // Resetta il form e chiudi il modal
      setNewGroupName('');
      setNewGroupDescription('');
      setShowCreateModal(false);
    } catch (err: any) {
      console.error('Errore nella creazione del gruppo:', err);
      setError('Impossibile creare il gruppo. Riprova più tardi.');
    } finally {
      setCreatingGroup(false);
    }
  };

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
            onClick={() => setShowCreateModal(true)}
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
              onClick={() => setShowCreateModal(true)}
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
                  <a
                    href={`/groups/${group.id}`}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    Visualizza
                  </a>
                  <button
                    onClick={() => {
                      if (confirm('Sei sicuro di voler eliminare questo gruppo? Questa azione non può essere annullata.')) {
                        supabase
                          .from('groups')
                          .delete()
                          .eq('id', group.id)
                          .then(({ error }) => {
                            if (error) {
                              console.error('Errore nell\'eliminazione del gruppo:', error);
                              alert('Impossibile eliminare il gruppo. Riprova più tardi.');
                            } else {
                              setGroups(groups.filter(g => g.id !== group.id));
                            }
                          });
                      }
                    }}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                  >
                    Elimina
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal per la creazione di un nuovo gruppo */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Crea nuovo gruppo</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateGroup}>
                <div className="mb-4">
                  <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome del gruppo *
                  </label>
                  <input
                    type="text"
                    id="groupName"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Inserisci il nome del gruppo"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="groupDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descrizione
                  </label>
                  <textarea
                    id="groupDescription"
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Descrivi brevemente il gruppo (opzionale)"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    disabled={creatingGroup || !newGroupName.trim()}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {creatingGroup ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creazione...
                      </>
                    ) : 'Crea gruppo'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
