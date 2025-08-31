import { OutgoingMessage, IncomingMessage, PlaceTilesPayload } from './protocol';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

export interface WSClientOptions {
  onMessage: (message: IncomingMessage) => void;
  onStatusChange: (status: ConnectionStatus) => void;
  gameId: string;
  playerId: string;
  playerName: string;
}

export class WSClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: number | null = null;
  private isManualClose = false;

  constructor(
    private url: string,
    private options: WSClientOptions
  ) {}

  connect(): void {
    this.isManualClose = false;
    this.options.onStatusChange('connecting');
    
    this.ws = new WebSocket(this.url);
    
    this.ws.onopen = () => {
      this.options.onStatusChange('connected');
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.sendJoinGame(this.options.playerName);
    };

    this.ws.onmessage = (event) => {
      try {
        const message: IncomingMessage = JSON.parse(event.data);
        this.options.onMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      this.options.onStatusChange('disconnected');
      this.stopHeartbeat();
      
      if (!this.isManualClose && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  disconnect(): void {
    this.isManualClose = true;
    this.stopHeartbeat();
    
    if (this.ws) {
      this.sendLeaveGame();
      this.ws.close();
      this.ws = null;
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    setTimeout(() => {
      if (!this.isManualClose) {
        this.connect();
      }
    }, delay);
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = window.setInterval(() => {
      this.sendHeartbeat();
    }, 20000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private send(message: OutgoingMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  sendJoinGame(playerName: string): void {
    this.send({
      type: 'join_game',
      player_id: this.options.playerId,
      player_name: playerName,
    });
  }

  sendLeaveGame(): void {
    this.send({
      type: 'leave_game',
      player_id: this.options.playerId,
    });
  }

  sendRequestState(): void {
    this.send({
      type: 'request_state',
    });
  }

  sendPlaceTiles(payload: PlaceTilesPayload): void {
    this.send({
      type: 'place_tiles',
      player_id: this.options.playerId,
      tiles: payload,
    });
  }

  sendHeartbeat(): void {
    this.send({
      type: 'heartbeat',
      gameId: this.options.gameId,
      playerId: this.options.playerId,
    });
  }
}
