# Hold'em or Fold'em Poker Game - Project Structure & Documentation

## Overview
Hold'em or Fold'em is a full-stack poker game application built with Next.js and React. It features real-time multiplayer gameplay, AI opponents, tournament modes, and WebRTC-based peer-to-peer communication.

---

## 📁 Directory Structure

### `/app` - Next.js App Router
- **`page.tsx`** - Main home page that sets up context providers (WebRTC, Chat, Poker Game, AI)
- **`layout.tsx`** - Root layout with metadata, fonts, analytics, and global styles
- **`globals.css`** - Global CSS and Tailwind configuration with design tokens
- **`daily-bonus/`** - Daily bonus feature routes
  - `page.tsx` - Full-screen lucky wheel for daily bonuses
  - `loading.tsx` - Loading skeleton for bonus page

### `/types` - TypeScript Type Definitions
**Core game types:**
- **`poker.ts`** - Main poker types: Card, Suit, Rank, Hand rankings, PlayerState, GameState
- **`tournament.ts`** - Tournament-specific types (MTT, SNG structures)
- **`stats.ts`** - Player statistics tracking types
- **`profile.ts`** - User profile and account types
- **`chat.ts`** - Chat message and communication types
- **`friends.ts`** - Friend list and relationship types
- **`gift.ts`** - Gift/reward system types
- **`lucky-wheel.ts`** - Lucky wheel prize types
- **`store.ts`** - In-app store and currency types

### `/lib` - Core Game Logic & Utilities

**Game Engines:**
- **`poker-engine.ts`** - Core poker logic:
  - Hand evaluation (determines winning hands)
  - Card dealing
  - Player action processing
  - Game state advancement through phases
  - Winner determination

- **`tournament-engine.ts`** - Tournament management:
  - Tournament bracket generation
  - Table assignments
  - Elimination logic
  - Prize distribution

- **`deck-manager.ts`** - Deck operations (Singleton pattern):
  - Card shuffling (Fisher-Yates algorithm)
  - Card drawing and discarding
  - Deck reset and state management

**Game Utilities:**
- **`card-utils.ts`** - Card manipulation and comparison utilities
- **`wheel-prizes.ts`** - Lucky wheel prize definitions and logic
- **`utils.ts`** - General utilities (CSS class merging with Tailwind)

### `/hooks` - React Custom Hooks (Context Providers)

**Core Hooks:**
- **`use-poker-game.tsx`** - Main poker game state management via Context
  - Game initialization
  - Action processing
  - Turn timer management
  - Hand progression

- **`use-webrtc.tsx`** - WebRTC peer-to-peer communication
  - Connection establishment
  - Peer discovery
  - Data channel management
  - Player synchronization

- **`use-chat.tsx`** - In-game chat functionality
  - Message sending/receiving
  - Chat history
  - User presence

- **`use-tournament.tsx`** - Tournament state and progression
- **`use-ai-opponents.tsx`** - AI player behavior and decision-making

**Utility Hooks:**
- **`use-mobile.ts`** - Mobile device detection
- **`use-toast.ts`** - Toast notification system

### `/components` - React Components

**Main Pages:**
- **`lobby.tsx`** - Game lobby (table selection, game modes)
- **`poker-table.tsx`** - Main poker table interface (game play area)
- **`friends-page.tsx`** - Social features and friend management
- **`gifts-page.tsx`** - Gift/reward interface
- **`achievements-page.tsx`** - Player achievements and statistics

**Game Components:**
- **`poker-table.tsx`** - Central game display with:
  - Community cards display
  - Player positions and hole cards
  - Pot and bet visualization
  - Turn indicator and timer

- **`player-position.tsx`** - Individual player display at table
- **`player-turn-indicator.tsx`** - Highlights current player
- **`card.tsx`** - Playing card display component
- **`community-cards.tsx`** - Displays shared community cards
- **`blind-marker.tsx`** - Shows dealer/blind positions
- **`blind-info.tsx`** - Displays blind amounts
- **`dealer-button.tsx`** - Dealer button indicator

**Action & Controls:**
- **`chat-panel.tsx`** - In-game chat interface
- **`chat-bubble.tsx`** - Individual chat message display
- **`video-player.tsx`** - Player video feed (WebRTC)
- **`video-controls.tsx`** - Video/audio controls
- **`turn-timer.tsx`** - Animated turn timer with countdown

**Modals & Dialogs:**
- **`table-selection.tsx`** - Modal for selecting game tables/stakes
- **`seat-selection.tsx`** - Modal for choosing table seat
- **`lucky-wheel.tsx`** - Lucky wheel for daily bonuses
- **`lucky-wheel-button.tsx`** - Button to open lucky wheel

**Features:**
- **`ai-opponents.tsx`** - AI player management
- **`game-menu.tsx`** - Main game menu options
- **`store.tsx`** - In-app purchase and currency shop
- **`gift-shop.tsx`** - Gift purchase interface
- **`gift-sender.tsx`** - Send gifts to other players
- **`gift-button.tsx`** - Quick gift sending
- **`gift-animation.tsx`** - Animated gift delivery
- **`profile-button.tsx`** - User profile access
- **`stats-dashboard.tsx`** - Player statistics display
- **`user-profile.tsx`** - Detailed player profile
- **`emoji-picker.tsx`** - Emoji selection for chat

**Tournament Features:**
- **`tournament-lobby.tsx`** - Tournament registration and info
- **`tournament-table-info.tsx`** - Current tournament details
- **`tournament-structure.tsx`** - Tournament blinds/payouts

**UI Components (`/components/ui/`):**
Standard shadcn/ui components including:
- Button, Input, Dialog, Tabs, Textarea
- Cards, Badges, Alerts, Tooltips
- Sliders, Dropdowns, Menus, Navigation
- Forms, Select, Radio, Checkbox
- And many more reusable UI primitives

---

## 🎮 Game Flow

### Starting a Game
1. **Lobby** → Player selects game mode (SNG, MTT, All-in or Fold, Omaha)
2. **Table Selection** → Choose stakes/buy-in
3. **Seat Selection** → Pick seat at table
4. **Game Start** → PokerGameProvider initializes game state

### During Game
1. **Deal** → Cards dealt, blinds posted
2. **Pre-flop** → Players act (fold, check, call, raise, all-in)
3. **Flop** → 3 community cards revealed, more betting
4. **Turn** → 4th community card, betting continues
5. **River** → 5th community card, final betting
6. **Showdown** → Hands evaluated, winner determined
7. **Next Hand** → Dealer rotates, new hand begins

### Key Game Logic Flow
```
Player Action → processAction()
    ↓
Update Player State (chips, bets, folded status)
    ↓
Advance Turn → Next active player
    ↓
All Players Acted? → No: Continue turn
              → Yes: Advance Phase
    ↓
New Phase: Deal community cards, reset bets
    ↓
Game Complete? → Yes: Determine Winners
             → No: Continue with new phase
```

---

## 🔌 Integration Points

### WebRTC Communication
- Peer-to-peer connections for real-time updates
- Video streaming for players
- Game state synchronization across peers
- Located in: `hooks/use-webrtc.tsx`

### Chat System
- In-game messaging between players
- Emoji support
- Located in: `hooks/use-chat.tsx`, `components/chat-*`

### AI Opponents
- AI decision-making based on game logic
- Automatic actions during turns
- Located in: `hooks/use-ai-opponents.tsx`, `components/ai-opponents.tsx`

### Tournament System
- Multi-table tournament management
- Seat assignments and table balancing
- Prize pool calculations
- Located in: `lib/tournament-engine.ts`, `components/tournament-*`

---

## 📊 Data Flow Architecture

### State Management
```
PokerGameProvider (Context)
    ↓
gameState (GameState object)
    ├── Players (PlayerState[])
    ├── Community Cards (Card[])
    ├── Pot (number)
    ├── Current Phase (GamePhase)
    └── Current Player Turn (number)
```

### Action Processing
```
User Action → makeAction()
    ↓
processAction() in poker-engine
    ↓
Update GameState
    ↓
setGameState() → Re-render Components
    ↓
Components Subscribe to GameState
    ↓
UI Updates (cards, chips, turn, etc.)
```

---

## 🎨 Design System

### Color Tokens (in `globals.css`)
- Primary colors: background, foreground, primary, secondary
- Chart colors: chart-1 through chart-5 for visual variety
- Status colors: destructive, muted, muted-foreground
- All tokens support theming and custom CSS properties

### Typography
- Primary font: "font-sans" (Righteous for display)
- Consistent sizing scale (sm, md, lg, xl, 2xl)
- Line heights optimized for readability

### Components
- Built with shadcn/ui + Tailwind CSS v4
- Responsive mobile-first design
- Accessible WCAG compliant components

---

## 🔐 Security Considerations

### Data Integrity
- Game state managed server-side (via Context + validation)
- Player actions validated before processing
- Card dealing randomized (Fisher-Yates shuffle)

### Peer Communication
- WebRTC for secure peer-to-peer communication
- State synchronization between peers
- Fallback to server for state arbitration

---

## 🚀 Performance Optimizations

### Rendering
- Component memoization for frequently updated UI
- Efficient re-render scoping with Context
- Canvas-based rendering for card animations

### Game Logic
- Optimized hand evaluation (O(n) for 5-card combos)
- Efficient deck operations with shuffling
- Turn timer with debounced actions

### Network
- WebRTC for low-latency P2P communication
- Batched state updates for efficiency
- Optional data compression for large game states

---

## 📝 Adding New Features

### Adding a New Game Mode
1. Add mode to `GameMode` type in `types/poker.ts`
2. Implement logic in `poker-engine.ts`
3. Add UI button in `lobby.tsx`
4. Handle in `PokerGameProvider` with mode-specific logic

### Adding New UI Components
1. Create component in appropriate subdirectory
2. Use existing shadcn/ui components
3. Apply design tokens for styling
4. Document component props with JSDoc

### Adding New Game Phases
1. Add phase to `GamePhase` type
2. Implement phase logic in `advancePhase()` in poker-engine
3. Create corresponding UI in `poker-table.tsx`
4. Update all phase-dependent logic

---

## 🐛 Debugging Tips

### Enable Debug Logging
```javascript
console.log("[v0] Description:", value)  // Uses v0 prefix for identification
```

### Common Issues
- **Players not synchronizing**: Check WebRTC connection and peer data channels
- **Game state inconsistency**: Verify action processing in poker-engine
- **UI not updating**: Check if component is subscribed to correct context

### Testing Locally
1. Open devtools (F12)
2. Look for `[v0]` prefixed logs
3. Check Network tab for WebRTC connections
4. Use React DevTools to inspect context state

---

## 📚 Key Algorithms

### Hand Evaluation
- Evaluates all 5-card combinations from 7 cards
- Assigns numeric values for comparison
- Handles wheel (A-2-3-4-5) straight

### Fisher-Yates Shuffle
- O(n) time complexity
- Ensures uniform random distribution
- Used in DeckManager

### Blind Rotation
- Dealer button moves left each hand
- Small blind at dealer+1
- Big blind at dealer+2
- UTG (under the gun) acts first pre-flop

---

## 🔗 External Dependencies

### Major Libraries
- **Next.js** - React framework with server/client rendering
- **React** - UI component library
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality component library
- **Lucide React** - Icon library
- **WebRTC** - Peer-to-peer communication
- **Vercel Analytics** - Usage analytics

### Development Tools
- TypeScript - Type-safe JavaScript
- ESLint/Biome - Code quality
- PostCSS - CSS processing

---

## 📞 Getting Help

For component-specific documentation, check JSDoc comments above each function and component.
For game logic help, refer to inline comments in `poker-engine.ts`.
For styling questions, check design tokens in `globals.css`.
