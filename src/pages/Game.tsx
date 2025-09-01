import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Board } from '../components/Board';
import { PlayerList } from '../components/PlayerList';
import { ConnectionBadge } from '../components/ConnectionBadge';
import { Toast } from '../components/Toast';
import { useSessionStore } from '../state/session';
import { useGameStore } from '../state/game';
import { WSClient } from '../lib/ws';
import { IncomingMessage } from '../lib/protocol';

export function Game() {
  const location = useLocation();
  const navigate = useNavigate();
  const { playerId, gameId, playerName } = useSessionStore();
  const {
    connectionStatus,
    stagedPlacements,
    messages,
    setConnectionStatus,
    updateGameState,
    addMessage,
    clearStagedPlacements,
    reset
  } = useGameStore();
  
  const wsClientRef = useRef<WSClient | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  useEffect(() => {
    if (!playerId || !gameId || !location.state?.wsUrl) {
      navigate('/');
      return;
    }

    const wsUrl = location.state.wsUrl;
    
    const handleMessage = (message: IncomingMessage) => {
      switch (message.type) {
        case 'ack':
          addMessage('Action acknowledged');
          break;
        case 'error':
          setToast({ message: message.payload?.message || 'Server error', type: 'error' });
          break;
        case 'player_joined':
          addMessage(`${message.payload?.name || 'Player'} joined the game`);
          break;
        case 'player_left':
          addMessage(`${message.payload?.name || 'Player'} left the game`);
          break;
        case 'state_updated':
          if (message.payload) {
            updateGameState(message.payload);
          }
          break;
        case 'pong':
          // Heartbeat response, no action needed
          break;
        default:
          console.log('Unknown message type:', message.type);
      }
    };

    wsClientRef.current = new WSClient(wsUrl, {
      onMessage: handleMessage,
      onStatusChange: setConnectionStatus,
      gameId,
      playerId,
      playerName,
    });

    wsClientRef.current.connect();

    return () => {
      if (wsClientRef.current) {
        wsClientRef.current.disconnect();
      }
      reset();
    };
  }, [playerId, gameId, location.state?.wsUrl, navigate, setConnectionStatus, updateGameState, addMessage, reset]);

  const handleRequestState = () => {
    wsClientRef.current?.sendRequestState();
  };

  const handlePlaceTiles = () => {
    if (stagedPlacements.length === 0) {
      setToast({ message: 'No tiles staged for placement', type: 'error' });
      return;
    }

    wsClientRef.current?.sendPlaceTiles({ placements: stagedPlacements });
    clearStagedPlacements();
  };

  const handleCopyGameId = async () => {
    if (!gameId) return;
    
    try {
      await navigator.clipboard.writeText(gameId);
      setToast({ message: 'Game ID copied to clipboard!', type: 'success' });
    } catch {
      setToast({ message: 'Failed to copy Game ID', type: 'error' });
    }
  };

  const handleLeaveGame = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">Word Bash</h1>
              <ConnectionBadge status={connectionStatus} />
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="text-gray-600">Game ID: </span>
                <button
                  onClick={handleCopyGameId}
                  className="font-mono bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
                  title="Click to copy"
                >
                  {gameId}
                </button>
              </div>
              <button
                onClick={handleLeaveGame}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Leave Game
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Game Board */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Game Board</h2>
                <div className="space-x-2">
                  <button
                    onClick={handleRequestState}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Request State
                  </button>
                  <button
                    onClick={handlePlaceTiles}
                    disabled={stagedPlacements.length === 0}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Place Tiles ({stagedPlacements.length})
                  </button>
                </div>
              </div>
              <Board />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <PlayerList />
            
            {/* Message Log */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold mb-2">Messages</h3>
              <div className="h-48 overflow-y-auto border rounded p-2 bg-gray-50">
                {messages.length === 0 ? (
                  <p className="text-gray-500 text-sm">No messages yet</p>
                ) : (
                  <div className="space-y-1">
                    {messages.map((message, index) => (
                      <div key={index} className="text-sm text-gray-700">
                        {message}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
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
