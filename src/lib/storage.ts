const PLAYER_NAME_KEY = 'wordBash_playerName';

export function savePlayerName(name: string): void {
  localStorage.setItem(PLAYER_NAME_KEY, name);
}

export function getPlayerName(): string {
  return localStorage.getItem(PLAYER_NAME_KEY) || '';
}

export function clearPlayerName(): void {
  localStorage.removeItem(PLAYER_NAME_KEY);
}
