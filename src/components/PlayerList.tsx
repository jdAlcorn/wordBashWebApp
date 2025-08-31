import { useGameStore } from '../state/game';
import { useSessionStore } from '../state/session';

export function PlayerList() {
  const { players, currentTurn } = useGameStore();
  const { playerId } = useSessionStore();

  if (players.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-2">Players</h3>
        <p className="text-gray-500">No players connected</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-2">Players ({players.length})</h3>
      <div className="space-y-2">
        {players.map((player) => (
          <div
            key={player.id}
            className={`flex items-center justify-between p-2 rounded ${
              player.id === playerId ? 'bg-blue-100' : 'bg-gray-50'
            } ${
              currentTurn === player.id ? 'ring-2 ring-green-400' : ''
            }`}
          >
            <span className="font-medium">{player.name}</span>
            <div className="flex items-center space-x-2">
              {player.id === playerId && (
                <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">You</span>
              )}
              {currentTurn === player.id && (
                <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">Turn</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
