// Link component is not used, using <a> tags instead
import type { MouseEvent } from '../types/global';
import type { Wheel } from '../utils/supabase';
import type { Group } from '../utils/supabase';

interface WheelCardProps {
  wheel: Wheel & { groups?: { name: string } | null };
  onDelete?: (id: string) => void;
}

export default function WheelCard({ wheel, onDelete }: WheelCardProps) {
  const handleDelete = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(wheel.id);
    }
  };

  return (
    <a
      href={`/wheels/${wheel.id}`}
      className="block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
            {wheel.title}
          </h3>
          {wheel.group_id ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Gruppo: {wheel.groups?.name || 'Sconosciuto'}
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Personale
            </span>
          )}
        </div>

        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Creata il {new Date(wheel.created_at).toLocaleDateString('it-IT')}
          </span>

          <div className="flex space-x-2">
            <button
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Modifica"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = `/wheels/edit/${wheel.id}`;
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>

            <button
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Elimina"
              onClick={handleDelete}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
    </a>
  );
}
