import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateGameForm } from '../components/CreateGameForm';
import { JoinGameForm } from '../components/JoinGameForm';
import { Toast } from '../components/Toast';
import { useSessionStore } from '../state/session';
import { getPlayerName } from '../lib/storage';

export function Home() {
  const navigate = useNavigate();
  const { setSession } = useSessionStore();
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  useEffect(() => {
    // Pre-fill name from localStorage if available
    const savedName = getPlayerName();
    if (savedName) {
      // Name will be pre-filled by the forms themselves
    }
  }, []);

  const handleGameSuccess = (gameId: string, playerId: string, wsUrl: string, playerName: string) => {
    setSession(playerId, playerName, gameId);
    navigate('/game', { state: { wsUrl } });
  };

  const handleError = (error: string) => {
    setToast({ message: error, type: 'error' });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Word Bash</h1>
        
        <div className="flex mb-6 border-b">
          <button
            className={`flex-1 py-2 px-4 text-center font-medium ${
              activeTab === 'create'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('create')}
          >
            Create Game
          </button>
          <button
            className={`flex-1 py-2 px-4 text-center font-medium ${
              activeTab === 'join'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('join')}
          >
            Join Game
          </button>
        </div>

        {activeTab === 'create' ? (
          <CreateGameForm onSuccess={handleGameSuccess} onError={handleError} />
        ) : (
          <JoinGameForm onSuccess={handleGameSuccess} onError={handleError} />
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
