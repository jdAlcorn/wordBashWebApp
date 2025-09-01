import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ThreeGameBoard } from '../components/ThreeGameBoard';
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
  const { playerId, playerName, gameId } = useSessionStore();
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
    if (!playerId || !gameId || !location.state?.websocketUrl) {
      navigate('/');
      return;
    }

    const wsUrl = location.state.websocketUrl;
    
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
  }, [playerId, gameId, location.state?.websocketUrl, navigate, setConnectionStatus, updateGameState, addMessage, reset]);

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

  const handleTilePlaced = (row: number, col: number, tile: any) => {
    // Handle tile placement from 3D board
    console.log('Tile placed:', { row, col, tile });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-6 mb-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Word Bash
              </h1>
              <ConnectionBadge status={connectionStatus} />
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-white/80">
                <span className="text-white/60">Game ID: </span>
                <button
                  onClick={handleCopyGameId}
                  className="font-mono bg-white/20 px-3 py-2 rounded-lg hover:bg-white/30 transition-colors text-white border border-white/30"
                  title="Click to copy"
                >
                  {gameId}
                </button>
              </div>
              <button
                onClick={handleLeaveGame}
                className="bg-red-500/80 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors backdrop-blur-sm border border-red-400/50"
              >
                Leave Game
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Game Board */}
          <div className="xl:col-span-3">
            <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white">Game Board</h2>
                <div className="space-x-3">
                  <button
                    onClick={handleRequestState}
                    className="bg-blue-500/80 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors backdrop-blur-sm border border-blue-400/50 font-medium"
                  >
                    Request State
                  </button>
                  <button
                    onClick={handlePlaceTiles}
                    disabled={stagedPlacements.length === 0}
                    className="bg-green-500/80 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors backdrop-blur-sm border border-green-400/50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Place Tiles ({stagedPlacements.length})
                  </button>
                </div>
              </div>
              <ThreeGameBoard onTilePlaced={handleTilePlaced} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Player List */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 overflow-hidden">
              <div className="p-4 bg-white/5 border-b border-white/20">
                <h3 className="text-lg font-semibold text-white">Players</h3>
              </div>
              <div className="p-4">
                <PlayerList />
              </div>
            </div>
            
            {/* Message Log */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 overflow-hidden">
              <div className="p-4 bg-white/5 border-b border-white/20">
                <h3 className="text-lg font-semibold text-white">Game Log</h3>
              </div>
              <div className="p-4">
                <div className="h-64 overflow-y-auto bg-black/20 rounded-lg p-3 border border-white/10">
                  {messages.length === 0 ? (
                    <p className="text-white/60 text-sm">No messages yet</p>
                  ) : (
                    <div className="space-y-2">
                      {messages.map((message, index) => (
                        <div key={index} className="text-sm text-white/80 bg-white/5 rounded px-2 py-1">
                          {message}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Game Stats */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 overflow-hidden">
              <div className="p-4 bg-white/5 border-b border-white/20">
                <h3 className="text-lg font-semibold text-white">Game Stats</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Tiles Placed:</span>
                  <span className="text-white font-medium">{stagedPlacements.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Connection:</span>
                  <span className={`font-medium ${
                    connectionStatus === 'connected' ? 'text-green-400' : 
                    connectionStatus === 'connecting' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {connectionStatus}
                  </span>
                </div>
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
