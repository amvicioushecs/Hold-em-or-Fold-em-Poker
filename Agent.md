# Agent.md — Hold'em or Fold'em Poker

Instructions for AI coding agents and humans working in this repository.

---

## Overall goal

Build **Hold'em or Fold'em** into a **mobile-first, multiplayer poker platform** that can support **large concurrent usage worldwide**, while remaining fair, reconnect-safe, and operable in production.

### Product outcomes

- Modes: **cash**, **SNG**, **MTT**, **all-in-or-fold**, **Omaha**
- Excellent **phone UX** (iOS Safari + Android Chrome) as the primary client
- Real multiplayer with **server-authoritative** game and tournament state
- Path to global scale: many concurrent tables, scheduled MTTs, durable chips/seats

### Non-goals (for now)

- Native App Store / Play Store binaries (Capacitor etc. is a later phase)
- Real-money compliance until ledger, RNG audit, and server authority are solid
- Always-on mesh video at every public table

---

## Current architecture (as of scale plan)

| Layer | Today | Scale target |
|-------|--------|----------------|
| UI | Next.js App Router, mobile-first shell (~430px), safe areas | Keep; thin client |
| Rules | `lib/poker-engine.ts`, tournament helpers | Shared pure package (browser + server) |
| Multiplayer | Client **host election** + Supabase Realtime broadcast | **Server** processes all actions |
| Media | Mesh WebRTC + public STUN only | Optional; SFU + TURN when needed |
| Auth | Supabase auth (or local mock) | Keep; RLS + no client chip writes |
| Data | Profiles when Supabase configured; much state client-side | Table registry, seat locks, chip **ledger**, hand logs |

**Critical constraint:** clients must not be the source of truth for cards, pots, chips, blinds clocks, or tournament start.

---

## Working rules for agents

1. **Prefer server authority** for any new game, seat, or chip logic.
2. **Do not reintroduce client-host** as the path for production modes.
3. **Mobile-first:** `100dvh`, `env(safe-area-inset-*)`, touch targets, max-width ~430px shell.
4. **Preserve pure rules** — hand evaluation and pot logic stay testable without React.
5. **Idempotent actions** — every client action carries a stable id; retries must not double-apply.
6. **No secrets in the client** — service role keys and deck seeds stay server-side.
7. Match existing design tokens: app bg `#07090E`, gold `#E5A93C` / `#FEB956`.
8. When uncertain, favor **fairness and reconnect** over new features.

### Repo map (high signal)

- `app/` — routes (auth, lobby entry, daily bonus)
- `components/` — UI (table, lobby, tournaments, auth-screen)
- `hooks/` — `use-poker-game`, `use-webrtc`, `use-tournament`, …
- `lib/` — `poker-engine`, `tournament-engine`, `auth`, `supabase`
- `types/` — `poker`, `tournament`, …
- `contexts/` — auth and other providers

---

## Scale-ready implementation plan

### Phase 0 — Baseline (1–2 weeks)

- Define SLOs (e.g. p95 action ack < 200ms same-region; reconnect < 5s)
- Capacity targets (concurrent tables/players; sample MTT size)
- Staging + prod envs; error tracking; structured logs; feature flags

**Exit:** Staging deploy, flags, and basic observability.

---

### Phase 1 — Server-authoritative game core (3–5 weeks) — **HIGHEST PRIORITY**

1. Extract pure rules into a shared package (no React/Supabase).
2. Run **property/golden tests** (hands, side pots, AOF, antes, blinds).
3. Add a **game service** (Node or equivalent): one table = one state machine.
4. Protocol: `join` / `sit` / `action` / `sync` with **action ids** and **state sequence numbers**.
5. Server deals and validates; broadcast public state; hole cards only to owner.
6. Remove production dependency on client host election (flagged rollout).

**Exit:** Multi-client cash table works with no host client; tab kill does not kill the hand.

---

### Phase 2 — Persistence and integrity (2–3 weeks)

- **Tables registry** — mode, blinds, seats, status, region
- **Atomic seat claims** — DB transaction or Redis lock
- **Chip ledger** — append-only; balance derived, never trusted from client
- **Hand logs** — actions, board, winners, pot breakdown
- **Snapshots** — resume table state after process restart

**Exit:** Server restart recovers tables; balances match ledger.

---

### Phase 3 — Matchmaking and tournaments (2–3 weeks)

- Cash / All-in / Omaha: server **table pools** by stake and mode
- SNG: register → fill → server starts instance
- MTT: registration + **scheduled start if min registered** (product rule) on server
- Server-side **blind clock** and table-balancing job

**Exit:** Bots can fill SNGs and a small MTT without a human host.

---

### Phase 4 — Realtime transport at scale (2–4 weeks)

- Authenticated realtime channel to **game service** (not client-authored game state)
- Shard by `table_id`; sticky sessions where needed
- Reconnect: client sends `last_seq` → snapshot + catch-up
- Rate limits and backpressure on non-critical events

**Exit:** Documented connection model; reconnect tested under loss.

---

### Phase 5 — Media policy (1–3 weeks)

- Video/audio **optional**; game fully playable without media
- STUN-only is insufficient for production — add **TURN**
- Prefer **SFU** over mesh beyond ~3–4 participants
- Isolate media room ids from game table ids

**Exit:** Public tables stable with media off; private A/V path documented.

---

### Phase 6 — Multi-region (after 1–3 are stable)

- Launch single region first
- Regional matchmaking; pin each MTT to one region’s clock
- CDN for static assets only — never for authoritative state

---

### Phase 7 — Safety and compliance (continuous)

- Server validation of every action
- RNG/audit logging for disputes
- No client writes to balances
- Abuse hooks (rate limits, multi-account) as traffic grows

---

### Phase 8 — Load and chaos (parallel after Phase 1)

- Soak single table; then N concurrent tables
- SNG registration storms
- Disconnect mid-hand; duplicate action ids
- Record shard capacity limits before marketing scale

---

## Definition of “scale-ready”

The product is scale-ready when **all** are true:

1. No client can alter another player’s cards or chips.  
2. A table survives any single client disconnect.  
3. Actions are idempotent under retry.  
4. Seats and buy-ins are atomic under concurrency.  
5. SNG/MTT start and blind levels are server-timed.  
6. Load tests establish concurrent-table capacity per shard.  
7. Operators can answer what happened on table X at time T (logs/hand history).

---

## First 30 days (default focus)

| Window | Focus |
|--------|--------|
| Days 1–14 | Shared pure engine package + golden tests |
| Days 10–28 | Game service: one cash table, multi-client, reconnect |
| Days 21–30 | Feature-flag server path; begin retiring client-host for cash |

Do **not** expand MTT marketing or global traffic until Phase 1–2 exit criteria pass.

---

## Keep vs replace

| Keep | Replace / demote |
|------|------------------|
| Mobile UI, lobbies, table chrome | Client host as authority |
| Pure hand/tournament rules | Client-dealt decks as truth |
| Supabase auth + profiles | Client broadcast as sole game bus |
| Mode taxonomy | In-memory-only global MTT orchestration |
| Optional WebRTC for private tables | Mesh A/V on all public tables |

---

## Agent checklist before large changes

- [ ] Does this move authority toward the server or back to the client?
- [ ] Are actions idempotent and sequenced?
- [ ] Will mobile safe-areas and touch targets still hold?
- [ ] Are chip movements ledger-backed?
- [ ] Is there a reconnect story?
- [ ] Are tests updated for engine or protocol changes?

---

## Related docs

- `.codex/AGENTS.md` — Codex/ECC baseline for this repo
- ADR-001 (project memory) — hybrid client + server direction; evolve toward full server authority for game state
- Design tokens and mobile-first notes live in app shell / `globals.css`

---

*This file is the north star for scale work. Prefer small vertical slices (one real server-authoritative table) over broad rewrites.*
