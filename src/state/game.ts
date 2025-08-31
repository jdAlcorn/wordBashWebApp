import { create } from 'zustand';
import { GameState, TilePlacement } from '../lib/protocol';
import { ConnectionStatus } from '../lib/ws';

interface GameStoreState extends GameState {
  connectionStatus: ConnectionStatus;
  stagedPlacements: TilePlacement[];
  messages: string[];
  setConnectionStatus: (status: ConnectionStatus) => void;
  updateGameState: (state: Partial<GameState>) => void;
  addMessage: (message: string) => void;
  addStagedPlacement: (placement: TilePlacement) => void;
  clearStagedPlacements: () => void;
  reset: () => void;
}

const createEmptyBoard = (): (string | null)[][] => 
  Array(15).fill(null).map(() => Array(15).fill(null));

export const useGameStore = create<GameStoreState>((set) => ({
  players: [],
  board: createEmptyBoard(),
  currentTurn: undefined,
  connectionStatus: 'disconnected',
  stagedPlacements: [],
  messages: [],
  
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  
  updateGameState: (state) => set((prev) => ({ ...prev, ...state })),
  
  addMessage: (message) => set((prev) => ({ 
    messages: [...prev.messages.slice(-49), message] 
  })),
  
  addStagedPlacement: (placement) => set((prev) => {
    const existing = prev.stagedPlacements.find(
      p => p.row === placement.row && p.col === placement.col
    );
    if (existing) {
      return {
        stagedPlacements: prev.stagedPlacements.map(p =>
          p.row === placement.row && p.col === placement.col ? placement : p
        )
      };
    }
    return { stagedPlacements: [...prev.stagedPlacements, placement] };
  }),
  
  clearStagedPlacements: () => set({ stagedPlacements: [] }),
  
  reset: () => set({
    players: [],
    board: createEmptyBoard(),
    currentTurn: undefined,
    connectionStatus: 'disconnected',
    stagedPlacements: [],
    messages: [],
  }),
}));
