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

  const handleGameSuccess = (gameId: string, websocketUrl: string, playerName: string) => {
    setSession(gameId, playerName, gameId); // Using gameId as playerId for now
    navigate('/game', { state: { websocketUrl } });
  };

  const handleError = (error: string) => {
    setToast({ message: error, type: 'error' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2">
            Word Bash
          </h1>
          <p className="text-white/70 text-lg">Multiplayer Word Game</p>
        </div>
        
        <div className="flex mb-6 bg-white/5 rounded-xl p-1 border border-white/10">
          <button
            className={`flex-1 py-3 px-4 text-center font-medium rounded-lg transition-all ${
              activeTab === 'create'
                ? 'bg-white/20 text-white shadow-lg border border-white/30'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            onClick={() => setActiveTab('create')}
          >
            Create Game
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center font-medium rounded-lg transition-all ${
              activeTab === 'join'
                ? 'bg-white/20 text-white shadow-lg border border-white/30'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            onClick={() => setActiveTab('join')}
          >
            Join Game
          </button>
        </div>

        <div className="space-y-6">
          {activeTab === 'create' ? (
            <CreateGameForm onSuccess={handleGameSuccess} onError={handleError} />
          ) : (
            <JoinGameForm onSuccess={handleGameSuccess} onError={handleError} />
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-white/50 text-sm">
            Create a new game or join an existing one with friends
          </p>
        </div>
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
