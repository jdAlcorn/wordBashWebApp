import { useState, useEffect } from 'react';
import { joinGame } from '../lib/api';
import { savePlayerName, getPlayerName } from '../lib/storage';

interface JoinGameFormProps {
  onSuccess: (gameId: string, websocketUrl: string, playerName: string) => void;
  onError: (error: string) => void;
}

export function JoinGameForm({ onSuccess, onError }: JoinGameFormProps) {
  const [name, setName] = useState('');
  const [gameId, setGameId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [gameIdError, setGameIdError] = useState('');

  useEffect(() => {
    const savedName = getPlayerName();
    if (savedName) {
      setName(savedName);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let hasError = false;
    
    if (!name.trim()) {
      setNameError('Name is required');
      hasError = true;
    } else if (name.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
      hasError = true;
    }
    
    if (!gameId.trim()) {
      setGameIdError('Game ID is required');
      hasError = true;
    }
    
    if (hasError) return;

    setIsLoading(true);
    setNameError('');
    setGameIdError('');

    try {
      const response = await joinGame(gameId.trim());
      savePlayerName(name.trim());
      onSuccess(response.gameId, response.websocketUrl, name.trim());
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to join game');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="join-name" className="block text-sm font-medium text-white/80 mb-2">
          Your Name
        </label>
        <input
          id="join-name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (nameError) setNameError('');
          }}
          className={`w-full px-4 py-3 bg-white/10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-white placeholder-white/50 backdrop-blur-sm ${
            nameError ? 'border-red-400' : 'border-white/30'
          }`}
          placeholder="Enter your display name"
          disabled={isLoading}
        />
        {nameError && <p className="text-red-400 text-sm mt-2">{nameError}</p>}
      </div>
      
      <div>
        <label htmlFor="join-gameId" className="block text-sm font-medium text-white/80 mb-2">
          Game ID
        </label>
        <input
          id="join-gameId"
          type="text"
          value={gameId}
          onChange={(e) => {
            setGameId(e.target.value);
            if (gameIdError) setGameIdError('');
          }}
          className={`w-full px-4 py-3 bg-white/10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-white placeholder-white/50 backdrop-blur-sm ${
            gameIdError ? 'border-red-400' : 'border-white/30'
          }`}
          placeholder="Enter game ID"
          disabled={isLoading}
        />
        {gameIdError && <p className="text-red-400 text-sm mt-2">{gameIdError}</p>}
      </div>
      
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-lg"
      >
        {isLoading ? 'Joining Game...' : 'Join Game'}
      </button>
    </form>
  );
}
