import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { supabase } from '../../utils/supabase';
import { useAuthContext } from '../../components/AuthProvider';
import Layout from '../../components/Layout';
import type { Group, GroupMember, Profile } from '../../utils/supabase';
import type { Route } from './+types/$groupId';
import type { FormEvent } from '../../types/global';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Dettagli Gruppo - Decision Roulette' },
    { name: 'description', content: 'Visualizza e gestisci i dettagli del gruppo' },
  ];
}

export default function GroupDetailsPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<(GroupMember & { profile: Profile })[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberUsername, setNewMemberUsername] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [addMemberError, setAddMemberError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !groupId) return;

    const fetchGroupDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Ottieni i dettagli del gruppo
        const { data: groupData, error: groupError } = await supabase
          .from('groups')
          .select('*')
          .eq('id', groupId)
          .single();

        if (groupError) throw groupError;
        if (!groupData) {
          setError('Gruppo non trovato');
          setLoading(false);
          return;
        }

        setGroup(groupData);
        setIsOwner(groupData.owner_id === user.id);

        // Ottieni i membri del gruppo
        const { data: membersData, error: membersError } = await supabase
          .from('group_members')
          .select('*')
          .eq('group_id', groupId);

        if (membersError) throw membersError;

        if (membersData && membersData.length > 0) {
          // Ottieni gli ID degli utenti
          const userIds = membersData.map(member => member.user_id);

          // Ottieni i profili degli utenti
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .in('id', userIds);

          if (profilesError) throw profilesError;

          // Combina i dati dei membri con i profili
          const formattedMembers = membersData.map(member => {
            const profile = profilesData?.find(p => p.id === member.user_id) || {
              id: member.user_id,
              username: 'Utente sconosciuto',
              avatar_url: null
            };

            return {
              ...member,
              profile
            };
          });

          setMembers(formattedMembers);

          // Verifica se l'utente corrente è un admin del gruppo
          const currentUserMember = formattedMembers.find(m => m.user_id === user.id);
          setIsAdmin(currentUserMember?.role === 'admin' || groupData.owner_id === user.id);
        } else {
          setMembers([]);
          setIsAdmin(groupData.owner_id === user.id);
        }
      } catch (err: any) {
        console.error('Errore nel recupero dei dettagli del gruppo:', err);
        setError('Impossibile caricare i dettagli del gruppo. Riprova più tardi.');
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [user, groupId]);

  const handleAddMember = async (e: FormEvent) => {
    e.preventDefault();

    if (!user || !groupId || !newMemberUsername.trim()) return;

    try {
      setAddingMember(true);
      setAddMemberError(null);

      // Cerca l'utente tramite username
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, username')
        .ilike('username', newMemberUsername.trim())
        .single();

      if (userError) {
        setAddMemberError('Utente non trovato');
        return;
      }

      // Verifica se l'utente è già membro del gruppo
      const isMember = members.some(m => m.user_id === userData.id);
      if (isMember) {
        setAddMemberError('L\'utente è già membro del gruppo');
        return;
      }

      // Aggiungi l'utente al gruppo
      const { data: memberData, error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: userData.id,
          role: 'member'
        })
        .select('*')
        .single();

      if (memberError) throw memberError;

      // Aggiorna la lista dei membri
      setMembers([...members, {
        ...memberData,
        profile: userData
      }]);

      // Resetta il form e chiudi il modal
      setNewMemberUsername('');
      setShowAddMemberModal(false);
    } catch (err: any) {
      console.error('Errore nell\'aggiunta del membro:', err);
      setAddMemberError('Impossibile aggiungere il membro. Riprova più tardi.');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Sei sicuro di voler rimuovere questo membro dal gruppo?')) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      // Aggiorna la lista dei membri
      setMembers(members.filter(m => m.id !== memberId));
    } catch (err: any) {
      console.error('Errore nella rimozione del membro:', err);
      alert('Impossibile rimuovere il membro. Riprova più tardi.');
    }
  };

  const handleDeleteGroup = async () => {
    if (!isOwner || !group) return;
    if (!confirm('Sei sicuro di voler eliminare questo gruppo? Questa azione non può essere annullata.')) return;

    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', group.id);

      if (error) throw error;

      // Torna alla lista dei gruppi
      navigate('/groups');
    } catch (err: any) {
      console.error('Errore nell\'eliminazione del gruppo:', err);
      alert('Impossibile eliminare il gruppo. Riprova più tardi.');
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto p-4 text-center">
          <p className="mb-4">Devi accedere per visualizzare i dettagli del gruppo.</p>
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
        <div className="mb-4">
          <button
            onClick={() => navigate('/groups')}
            className="text-blue-500 hover:text-blue-700 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Torna ai gruppi
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
        ) : group ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{group.name}</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Creato il {new Date(group.created_at).toLocaleDateString('it-IT')}
                  </p>
                </div>
                {isOwner && (
                  <button
                    onClick={handleDeleteGroup}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>

              {group.description && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Descrizione</h2>
                  <p className="text-gray-700 dark:text-gray-300">{group.description}</p>
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Membri ({members.length})</h2>
                  {(isOwner || isAdmin) && (
                    <button
                      onClick={() => setShowAddMemberModal(true)}
                      className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-1 px-3 rounded inline-flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                      </svg>
                      Aggiungi membro
                    </button>
                  )}
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
                  {members.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 p-4 text-center">Nessun membro trovato</p>
                  ) : (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-600">
                      {members.map((member) => (
                        <li key={member.id} className="flex justify-between items-center p-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-300 mr-3">
                              {member.profile.avatar_url ? (
                                <img
                                  src={member.profile.avatar_url}
                                  alt={member.profile.username}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                member.profile.username.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {member.profile.username}
                                {member.user_id === group.owner_id && (
                                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 py-0.5 px-1.5 rounded">
                                    Proprietario
                                  </span>
                                )}
                                {member.role === 'admin' && member.user_id !== group.owner_id && (
                                  <span className="ml-2 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 py-0.5 px-1.5 rounded">
                                    Admin
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Membro dal {new Date(member.joined_at).toLocaleDateString('it-IT')}
                              </p>
                            </div>
                          </div>
                          {(isOwner || isAdmin) && member.user_id !== user.id && member.user_id !== group.owner_id && (
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Modal per aggiungere un membro */}
        {showAddMemberModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Aggiungi membro</h3>
                <button
                  onClick={() => setShowAddMemberModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {addMemberError && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4" role="alert">
                  <p>{addMemberError}</p>
                </div>
              )}

              <form onSubmit={handleAddMember}>
                <div className="mb-6">
                  <label htmlFor="memberUsername" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome utente
                  </label>
                  <input
                    type="text"
                    id="memberUsername"
                    value={newMemberUsername}
                    onChange={(e) => setNewMemberUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Inserisci il nome utente"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddMemberModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    disabled={addingMember || !newMemberUsername.trim()}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {addingMember ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Aggiunta...
                      </>
                    ) : 'Aggiungi'}
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
