import { useGameStore } from '../state/game';
import { useSessionStore } from '../state/session';

export function PlayerList() {
  const { players, currentTurn } = useGameStore();
  const { playerId } = useSessionStore();

  if (players.length === 0) {
    return (
      <div>
        <p className="text-white/60 text-sm">No players connected</p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-3">
        {players.map((player) => (
          <div
            key={player.id}
            className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
              player.id === playerId ? 'bg-blue-500/20 border border-blue-400/30' : 'bg-white/5 border border-white/10'
            } ${
              currentTurn === player.id ? 'ring-2 ring-green-400/50' : ''
            }`}
          >
            <span className="font-medium text-white">{player.name}</span>
            <div className="flex items-center space-x-2">
              {player.id === playerId && (
                <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">You</span>
              )}
              {currentTurn === player.id && (
                <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full animate-pulse">Turn</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
