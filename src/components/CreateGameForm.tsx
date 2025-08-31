import { useState, useEffect } from 'react';
import { createGame } from '../lib/api';
import { savePlayerName, getPlayerName } from '../lib/storage';

interface CreateGameFormProps {
  onSuccess: (gameId: string, playerId: string, wsUrl: string, playerName: string) => void;
  onError: (error: string) => void;
}

export function CreateGameForm({ onSuccess, onError }: CreateGameFormProps) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    const savedName = getPlayerName();
    if (savedName) {
      setName(savedName);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setNameError('Name is required');
      return;
    }
    
    if (name.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
      return;
    }

    setIsLoading(true);
    setNameError('');

    try {
      const response = await createGame(name.trim());
      
      // Generate a simple player ID for now
      const playerId = Math.random().toString(36).substring(2, 15);
      
      savePlayerName(name.trim());
      onSuccess(response.gameId, playerId, response.websocketUrl, name.trim());
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to create game');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="create-name" className="block text-sm font-medium text-gray-700 mb-1">
          Your Name
        </label>
        <input
          id="create-name"
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
      
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Creating Game...' : 'Create Game'}
      </button>
    </form>
  );
}
