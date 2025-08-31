import { create } from 'zustand';

interface SessionState {
  playerId: string | null;
  playerName: string;
  gameId: string | null;
  setSession: (playerId: string, playerName: string, gameId: string) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  playerId: null,
  playerName: '',
  gameId: null,
  setSession: (playerId, playerName, gameId) => 
    set({ playerId, playerName, gameId }),
  clearSession: () => 
    set({ playerId: null, playerName: '', gameId: null }),
}));
