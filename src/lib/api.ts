import { CreateGameResponse } from './protocol';

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
  const fullUrl = `${API_BASE_URL}${url}`;
  console.log('API Request:', fullUrl, options);
  
  const response = await fetch(fullUrl, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  console.log('API Response:', response.status, response.statusText);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.log('API Error Response Body:', errorText);
    throw new ApiError(response.status, `HTTP ${response.status}: ${response.statusText}`);
  }

  const responseText = await response.text();
  console.log('API Response Body:', responseText);
  
  try {
    return JSON.parse(responseText);
  } catch (e) {
    console.error('JSON Parse Error:', e, 'Response was:', responseText);
    throw e;
  }
}

export async function createGame(name: string): Promise<CreateGameResponse> {
  return fetchJson<CreateGameResponse>('/api/games', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function joinGame(gameId: string): Promise<CreateGameResponse> {
  return fetchJson<CreateGameResponse>(`/api/games/${gameId}/join`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}
