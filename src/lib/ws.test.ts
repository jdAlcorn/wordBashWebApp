import { describe, it, expect } from 'vitest';
import { WSClient } from './ws';

describe('WSClient', () => {
  it('should create client with correct options', () => {
    const mockOptions = {
      onMessage: () => {},
      onStatusChange: () => {},
      gameId: 'GAME123',
      playerId: 'player-1'
    };
    
    const client = new WSClient('ws://localhost:8080', mockOptions);
    expect(client).toBeInstanceOf(WSClient);
  });

  it('should have send methods available', () => {
    const mockOptions = {
      onMessage: () => {},
      onStatusChange: () => {},
      gameId: 'GAME123',
      playerId: 'player-1'
    };
    
    const client = new WSClient('ws://localhost:8080', mockOptions);
    
    expect(typeof client.sendJoinGame).toBe('function');
    expect(typeof client.sendPlaceTiles).toBe('function');
    expect(typeof client.sendRequestState).toBe('function');
    expect(typeof client.sendHeartbeat).toBe('function');
  });
});
