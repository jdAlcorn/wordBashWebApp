import { CreateGameResponse, CreateSessionResponse, GameEndpointResponse, ConfigResponse } from './protocol';

// Use relative URLs when not on localhost, localhost in development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (window.location.hostname === 'localhost' ? 'http://localhost:3000' : '');

// Debug logging
console.log('API Debug Info:', {
  hostname: window.location.hostname,
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  PROD: import.meta.env.PROD,
  final_API_BASE_URL: API_BASE_URL
});

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new ApiError(response.status, `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export async function createGame(name: string): Promise<CreateGameResponse> {
  return fetchJson<CreateGameResponse>('/api/games', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function createSession(name: string): Promise<CreateSessionResponse> {
  return fetchJson<CreateSessionResponse>('/api/sessions', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function getGameEndpoint(gameId: string): Promise<GameEndpointResponse> {
  return fetchJson<GameEndpointResponse>(`/api/games/${gameId}/endpoint`);
}

export async function getConfig(): Promise<ConfigResponse> {
  return fetchJson<ConfigResponse>('/api/config');
}
