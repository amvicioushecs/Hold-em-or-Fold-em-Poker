# Hold'em or Fold'em Poker - Database & Auth Setup

## Overview

This document guides you through setting up the complete database infrastructure, authentication system, and authorization for the Hold'em or Fold'em Poker application.

## Architecture

### Authentication
- **Provider**: Supabase Auth (Email/Password)
- **Protection**: Next.js Middleware protecting `/game` routes
- **Session Management**: Browser-based with automatic refresh
- **Authorization**: Row-Level Security (RLS) policies on all tables

### Database
- **Provider**: Supabase PostgreSQL
- **Tables**: 8 interconnected tables
- **Policies**: Fine-grained RLS for data privacy
- **Indexes**: Performance optimization on frequently queried columns

## Quick Start

### 1. Create Supabase Project

1. Visit [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create an account or login
4. Create a new project with a strong password
5. Wait for project to initialize (~2 minutes)

### 2. Get API Keys

In your Supabase dashboard:
1. Go to **Settings** > **API**
2. Copy these values:
   - `Project URL` → Save as `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → Save as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → Save as `SUPABASE_SERVICE_ROLE_KEY`

### 3. Configure Environment Variables

Create `.env.local` in project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Initialize Database

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Open `/supabase/migrations/001_init_schema.sql` from this project
4. Copy and paste entire SQL content
5. Click "Run"
6. Verify all tables appear in the **Table Editor**

### 5. Start Using

1. Run `npm run dev`
2. Navigate to `http://localhost:3000`
3. Redirect redirects you to login
4. Click "Sign Up" to create account
5. Create a new game and start playing!

## Database Schema

### Users Table
Stores user account information linked to Supabase auth:
- `id`: Unique identifier (UUID)
- `auth_id`: Reference to Supabase auth.users
- `email`: User email (unique)
- `username`: Display username (unique)
- `avatar_url`: Profile picture URL
- `bio`: User biography
- `is_admin`: Admin flag for future admin features

### Player Profiles Table
Tracks player poker statistics and chip stack:
- `user_id`: Reference to users (unique per user)
- `display_name`: Name shown in games
- `chip_stack`: Current chips available
- `total_buy_ins`: Cumulative buy-in amount
- `total_winnings`: Cumulative winnings
- `games_played`: Total games count
- `games_won`: Win count
- `avg_session_duration`: Average session length
- `last_played`: Timestamp of last game

### Games Table
Represents a poker game session:
- `game_type`: 'cash', 'tournament', or 'sng'
- `status`: 'waiting', 'active', or 'completed'
- `buy_in`: Entry fee
- `small_blind` / `big_blind`: Blind amounts
- `max_players`: Maximum players allowed
- `created_by`: Creator user ID
- `winner_id`: Winner when completed
- `total_pot`: Final pot size

### Game Players Table
Junction table linking players to games:
- `game_id`: Reference to games
- `player_id`: Reference to player_profiles
- `buy_in_amount`: Amount bought in for this game
- `current_chips`: Current chip count
- `position`: Seat position at table
- `is_active`: Whether still in game
- `folded`: Whether player folded
- `final_position`: Finishing position (1st, 2nd, etc.)
- `winnings`: Amount won in this game

### Hands Table
Records individual hands played:
- `game_id`: Reference to games
- `hand_number`: Sequential hand number in game
- `button_position`: Dealer button position
- `small_blind_position`: SB position
- `big_blind_position`: BB position
- `community_cards`: Array of board cards
- `pot_size`: Total pot for hand
- `winner_id`: Player who won hand

### Player Hands Table
Tracks individual player actions in each hand:
- `hand_id`: Reference to hands
- `player_id`: Reference to player_profiles
- `hole_cards`: Array of player's cards
- `position`: Player's position at table
- `actions`: JSON string of betting actions
- `final_hand_rank`: Final hand ranking (e.g., "flush")
- `won_hand`: Whether player won this hand
- `hand_winnings`: Winnings from this hand

### Player Stats Table
Aggregated statistics for player profiles:
- `user_id`: Reference to users (unique)
- `games_played`: Total games
- `games_won`: Total wins
- `total_buy_ins`: Sum of all buy-ins
- `total_winnings`: Sum of all winnings
- `profit_loss`: Net profit/loss
- `win_rate`: Win percentage
- `vpip`: Voluntarily Put in Pot %
- `pfr`: Pre-flop Raise %
- `aggression_factor`: Aggression measure

### Transactions Table
Audit trail of all money movements:
- `user_id`: Reference to users
- `transaction_type`: 'buy_in', 'cash_out', 'winnings', or 'refund'
- `amount`: Amount of transaction
- `game_id`: Associated game (if applicable)
- `description`: Transaction details

## Security & Authorization

### Row-Level Security (RLS) Policies

All tables have RLS enabled with specific policies:

**Users Table**
- Anyone can view all public profiles
- Users can only update their own data
- Admin can override

**Player Profiles**
- Public read access
- Users can update their own profile
- Statistics visible to everyone

**Games Table**
- Public read access (see all active games)
- Users can create games
- Game creators can update their games
- Admin management available

**Game Players & Hands**
- Public read access
- Players can manage their own participations
- Records locked once game starts

**Transactions**
- Users can only view own transactions
- Read-only after creation (audit trail)
- Admin can view all

### Authentication Flow

1. **Sign Up**: Create email/password account
   - Supabase Auth creates account
   - Users table record created
   - Player profile initialized with 0 chips

2. **Sign In**: Authenticate with credentials
   - Returns JWT token
   - Token stored in browser (secure cookie)
   - Auto-refresh on page load

3. **Protected Routes**: Middleware intercepts requests
   - Check valid session
   - Redirect to login if needed
   - Allow access if authenticated

4. **API Routes**: Verify user identity
   - Extract user from session
   - Verify ownership of resources
   - Return 401 if unauthorized

## Usage Examples

### Creating a Game

```typescript
import { createGame } from '@/lib/game'

const game = await createGame({
  game_type: 'cash',
  buy_in: 100,
  small_blind: 1,
  big_blind: 2,
  max_players: 6,
})
```

### Joining a Game

```typescript
import { joinGame } from '@/lib/game'

const player = await joinGame(gameId, buyInAmount)
```

### Recording Game Results

```typescript
import { endGame, recordHand } from '@/lib/game'

await endGame(gameId, winnerId, totalPot)
const hand = await recordHand(gameId, {
  hand_number: 1,
  button_position: 0,
  small_blind_position: 1,
  big_blind_position: 2,
  community_cards: ['As', 'Kh', 'Qd', 'Jc', '9s'],
  pot_size: 500,
})
```

### Getting Player Stats

```typescript
import { getPlayerStats, getPlayerTransactions } from '@/lib/game'

const stats = await getPlayerStats(userId)
const transactions = await getPlayerTransactions(userId)
```

## Troubleshooting

### "Missing SUPABASE_SERVICE_ROLE_KEY"
- Check `.env.local` has correct service role key
- Verify it's not the anon key (starts with `eyJ...`)

### "User profile not found"
- Run database initialization SQL
- Verify player_profiles table exists
- Check RLS policies are enabled

### "Cannot sign in"
- Verify email is registered
- Check password is correct
- Look at Supabase Auth logs in dashboard

### "Game not appearing"
- Verify game status is 'waiting'
- Check user is logged in
- Ensure game_id is correct

## Next Steps

1. ✅ Database initialized
2. ✅ Authentication working
3. ✅ API routes functional
4. Next: Integrate with game engine for real poker gameplay
5. Future: Add WebSocket for real-time updates
6. Future: Implement chat system
7. Future: Add leaderboards and tournaments

## Support

For Supabase documentation:
- Guides: https://supabase.com/docs
- API Reference: https://supabase.com/docs/reference
- Community: https://discord.supabase.io
