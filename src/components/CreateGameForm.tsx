import { useState, useEffect } from 'react';
import { createGame } from '../lib/api';
import { savePlayerName, getPlayerName } from '../lib/storage';

interface CreateGameFormProps {
  onSuccess: (gameId: string, websocketUrl: string, playerName: string) => void;
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
      savePlayerName(name.trim());
      onSuccess(response.gameId, response.websocketUrl, name.trim());
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to create game');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="create-name" className="block text-sm font-medium text-white/80 mb-2">
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
          className={`w-full px-4 py-3 bg-white/10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder-white/50 backdrop-blur-sm ${
            nameError ? 'border-red-400' : 'border-white/30'
          }`}
          placeholder="Enter your display name"
          disabled={isLoading}
        />
        {nameError && <p className="text-red-400 text-sm mt-2">{nameError}</p>}
      </div>
      
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-lg"
      >
        {isLoading ? 'Creating Game...' : 'Create Game'}
      </button>
    </form>
  );
}
