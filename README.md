# Word Bash Web App

A React-based front-end for a multiplayer Scrabble-like game with real-time WebSocket communication.

## Features

- **Create Game**: Start a new game and get a shareable Game ID
- **Join Game**: Join an existing game using a Game ID
- **Real-time Multiplayer**: WebSocket-based communication with automatic reconnection
- **Interactive Board**: 15×15 grid for tile placement with visual feedback
- **Player Management**: Live player list with turn indicators
- **Message Log**: Real-time game events and notifications
- **Responsive UI**: Clean, accessible interface built with Tailwind CSS

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- A backend server implementing the required API endpoints (see API Contracts below)

### Installation

1. Clone and install dependencies:
```bash
git clone <repository-url>
cd wordBashWebApp
npm install
```

2. Configure the API base URL:
```bash
cp .env.example .env
# Edit .env and set VITE_API_BASE_URL to your backend server URL
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run unit tests

## Configuration

Set the following environment variable:

- `VITE_API_BASE_URL` - Base URL for your backend API (default: `http://localhost:3000`)

## API Contracts

The app expects these backend endpoints:

### Create Game
```
POST /api/games
Body: { "name": "Alice" }
Response: { "gameId": "GAME123", "playerId": "p-uuid", "wsUrl": "wss://.../ws/GAME123?playerId=p-uuid" }
```

### Create Session
```
POST /api/sessions
Body: { "name": "Bob" }
Response: { "playerId": "p-uuid" }
```

### Get Game Endpoint
```
GET /api/games/{gameId}/endpoint
Response: { "wsUrl": "wss://.../ws/GAME123?playerId=p-uuid" }
```

### Optional Config Endpoint
```
GET /api/config
Response: { "wsBaseUrl": "wss://..." }
```

## WebSocket Protocol

### Client Messages (Outgoing)
- `join_game` - Join the game room
- `leave_game` - Leave the game room
- `request_state` - Request current game state
- `place_tiles` - Submit tile placements
- `heartbeat` - Keep connection alive

### Server Messages (Incoming)
- `ack` - Action acknowledgment
- `error` - Error notification
- `player_joined` - Player joined notification
- `player_left` - Player left notification
- `state_updated` - Game state update
- `pong` - Heartbeat response

### Message Format
```json
{
  "type": "message_type",
  "gameId": "GAME123",
  "playerId": "p-uuid",
  "payload": { /* optional data */ }
}
```

## Architecture

```
src/
├── components/          # Reusable UI components
│   ├── Board.tsx       # Game board with tile placement
│   ├── PlayerList.tsx  # Connected players display
│   ├── ConnectionBadge.tsx # Connection status indicator
│   ├── CreateGameForm.tsx  # Game creation form
│   ├── JoinGameForm.tsx    # Game joining form
│   └── Toast.tsx       # Notification component
├── pages/              # Route components
│   ├── Home.tsx        # Landing page with create/join forms
│   └── Game.tsx        # Main game interface
├── lib/                # Utilities and services
│   ├── api.ts          # REST API helpers
│   ├── ws.ts           # WebSocket client with reconnection
│   ├── protocol.ts     # TypeScript types for messages
│   └── storage.ts      # localStorage helpers
├── state/              # State management
│   ├── session.ts      # User session (Zustand)
│   └── game.ts         # Game state (Zustand)
└── styles/
    └── index.css       # Tailwind CSS imports
```

## Game Flow

### Create Game Flow
1. User enters display name
2. POST to `/api/games` → receives `{ gameId, playerId, wsUrl }`
3. Connect to WebSocket and auto-send `join_game`
4. Navigate to game view

### Join Game Flow
1. User enters name and Game ID
2. POST to `/api/sessions` → receives `{ playerId }`
3. GET `/api/games/{gameId}/endpoint` → receives `{ wsUrl }`
4. Connect to WebSocket and auto-send `join_game`
5. Navigate to game view

### Game Interface
- **Board**: Click empty cells to stage tile placements
- **Place Tiles**: Submit staged placements to server
- **Request State**: Manually sync game state
- **Player List**: Shows all connected players and current turn
- **Messages**: Live feed of game events

## Development Notes

### State Management
- **Session State**: Player ID, name, and current game ID
- **Game State**: Board, players, connection status, and staged moves
- **Local Storage**: Persists player name between sessions

### WebSocket Features
- Automatic reconnection with exponential backoff
- Heartbeat/ping every 20 seconds
- Graceful cleanup on route changes
- Connection status indicators

### UI/UX Features
- Form validation with inline error messages
- Copy-to-clipboard for Game IDs
- Loading states and disabled buttons
- Keyboard accessibility
- Toast notifications for errors
- Responsive design

## Testing

Run the test suite:
```bash
npm run test
```

Tests cover:
- Protocol message type validation
- WebSocket client helper functions
- Basic component rendering

## TODOs (Out of Scope)

- [ ] Authentication and session cookies
- [ ] Real tile bag and scoring system
- [ ] Turn-based game logic
- [ ] Word validation
- [ ] Production deployment configuration
- [ ] Comprehensive integration tests

## Browser Support

- Modern browsers with WebSocket support
- ES2020+ JavaScript features
- CSS Grid and Flexbox

## License

MIT
