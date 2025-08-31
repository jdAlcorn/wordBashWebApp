import { describe, it, expect } from 'vitest';
import { IncomingMessage, OutgoingMessage, TilePlacement } from './protocol';

describe('Protocol Types', () => {
  it('should validate incoming message structure', () => {
    const message: IncomingMessage = {
      type: 'ack',
      gameId: 'GAME123',
      playerId: 'player-1',
      payload: { success: true }
    };

    expect(message.type).toBe('ack');
    expect(message.gameId).toBe('GAME123');
    expect(message.playerId).toBe('player-1');
  });

  it('should validate outgoing message structure', () => {
    const message: OutgoingMessage = {
      type: 'join_game',
      gameId: 'GAME123',
      playerId: 'player-1'
    };

    expect(message.type).toBe('join_game');
    expect(message.gameId).toBe('GAME123');
    expect(message.playerId).toBe('player-1');
  });

  it('should validate tile placement structure', () => {
    const placement: TilePlacement = {
      row: 7,
      col: 7,
      letter: 'A'
    };

    expect(placement.row).toBe(7);
    expect(placement.col).toBe(7);
    expect(placement.letter).toBe('A');
  });
});
