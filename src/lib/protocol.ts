export interface WSMessage {
  type: string;
  gameId: string;
  playerId: string;
  payload?: any;
}

export interface OutgoingMessage {
  type: 'join_game' | 'leave_game' | 'request_state' | 'place_tiles' | 'heartbeat';
  player_id?: string;
  player_name?: string;
  tiles?: any;
}

export interface IncomingMessage extends WSMessage {
  type: 'ack' | 'error' | 'player_joined' | 'player_left' | 'state_updated' | 'pong';
}

export interface TilePlacement {
  row: number;
  col: number;
  letter: string;
}

export interface PlaceTilesPayload {
  placements: TilePlacement[];
}

export interface Player {
  id: string;
  name: string;
}

export interface GameState {
  players: Player[];
  board: (string | null)[][];
  currentTurn?: string;
}

export interface CreateGameResponse {
  gameId: string;
  websocketUrl: string;
  name?: string;
}

export interface CreateSessionResponse {
  playerId: string;
}

export interface GameEndpointResponse {
  wsUrl: string;
}

export interface ConfigResponse {
  wsBaseUrl: string;
}
