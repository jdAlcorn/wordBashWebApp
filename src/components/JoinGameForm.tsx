import { useState, useEffect } from 'react';
import { joinGame } from '../lib/api';
import { savePlayerName, getPlayerName } from '../lib/storage';

interface JoinGameFormProps {
  onSuccess: (gameId: string, playerId: string, wsUrl: string, playerName: string) => void;
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
      
      // Generate a simple player ID for now
      const playerId = Math.random().toString(36).substring(2, 15);
      
      savePlayerName(name.trim());
      onSuccess(gameId.trim(), playerId, response.websocketUrl, name.trim());
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to join game');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="join-name" className="block text-sm font-medium text-gray-700 mb-1">
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
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            nameError ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter your display name"
          disabled={isLoading}
        />
        {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
      </div>
      
      <div>
        <label htmlFor="join-gameId" className="block text-sm font-medium text-gray-700 mb-1">
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
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            gameIdError ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter game ID"
          disabled={isLoading}
        />
        {gameIdError && <p className="text-red-500 text-sm mt-1">{gameIdError}</p>}
      </div>
      
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Joining Game...' : 'Join Game'}
      </button>
    </form>
  );
}
