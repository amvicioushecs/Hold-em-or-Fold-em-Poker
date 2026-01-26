import { initializeGame, startNewHand, determineWinners, dealCards, processAction } from "./lib/poker-engine";
import { Card, GameState } from "@/types/poker";

// Mock deck manager if needed, or rely on internal ONE
// Since deckManager is imported in poker-engine, it should just work.

const log = (msg: string) => console.log(`[TEST] ${msg}`);
const assert = (condition: boolean, msg: string) => {
    if (!condition) {
        console.error(`[FAIL] ${msg}`);
        process.exit(1);
    } else {
        console.log(`[PASS] ${msg}`);
    }
};

async function testOmahaDealing() {
    log("Testing Omaha Dealing...");
    const gameState = initializeGame(["p1", "p2"], ["Player 1", "Player 2"], [1, 2], 1000, 1, "omaha");

    assert(gameState.gameMode === "omaha", "Game mode should be omaha");
    assert(gameState.players[0].cards.length === 4, `Player 1 should have 4 cards, got ${gameState.players[0].cards.length}`);
    assert(gameState.players[1].cards.length === 4, `Player 2 should have 4 cards, got ${gameState.players[1].cards.length}`);
}

async function testOmahaEvaluation() {
    log("Testing Omaha Evaluation...");
    // Mock cards
    // Hole: Ah As Kd Kc (Classic double suited aces/kings, but lets try a specific case)
    // Board: 2h 2s 2d 3c 4c
    // Holdem would be Quads (2222 with A kicker) or Full House (222 AA).
    // Omaha: Must use exactly 2 hole + 3 board.
    // Hole: Ah As Kd Kc. 
    // Possible 2-hole: AA, KK, AK...
    // Board: 2 2 2 3 4. 
    // Best 3-board: 2 2 2.
    // Hand: AA + 222 -> Full House (2s over As). Or 222AA.
    // Wait, 222 AA is Full House.

    // Better test: Flush vs No Flush.
    // Hole: Ah 2h 3h 4h
    // Board: 5h 6h 7h 9s Ts
    // Holdem: Flush (Ah 2h 3h 4h 5h - top 5 cards).
    // Omaha: Must use 2 hole. Ah 2h + 5h 6h 7h. Flush.

    // Test case where Holdem wins but Omaha loses (or is worse).
    // Hole: As 2s 3d 4d
    // Board: Ks Qs Js Ts 9d
    // Holdem: Flush (As Ks Qs Js Ts).
    // Omaha: My spades are As 2s. Board spades: Ks Qs Js Ts.
    // 2 hole (As 2s) + 3 board (Ks Qs Js) -> Flush.
    // What if I have only 1 spade in hole?
    // Hole: As 2d 3d 4d.
    // Board: Ks Qs Js Ts 9s.
    // Holdem: Flush (As Ks Qs Js Ts).
    // Omaha: Can I make a flush? I need 2 hole cards. I have only As (spade) and others are diamonds.
    // So I cannot make a flush. I must use As + something else (Diamond).
    // No flush possible.

    // Let's implement this scenario.
    // We need to inject these cards into a game state or call determineWinners directly.
    // But determineWinners takes players and community cards.

    const p1 = {
        id: "p1",
        name: "P1",
        chips: 1000,
        bet: 0,
        cards: [
            { rank: "A", suit: "spades" },
            { rank: "2", suit: "diamonds" },
            { rank: "3", suit: "diamonds" },
            { rank: "4", suit: "diamonds" }
        ] as Card[],
        folded: false,
        allIn: false,
        isActive: true, // Renamed/New field? Check types.
        seatNumber: 1
    };

    const communityCards = [
        { rank: "K", suit: "spades" },
        { rank: "Q", suit: "spades" },
        { rank: "J", suit: "spades" },
        { rank: "10", suit: "spades" },
        { rank: "9", suit: "spades" }
    ] as Card[];

    // In Holdem this is a Royal Flush (on board + As).
    // In Omaha, P1 has only 1 spade. Cannot use 4 board cards. Must use 3 board cards.
    // Board has 5 spades. P1 has 1 spade. He needs 2 from hole. He can't.
    // So he has NO FLUSH.
    // His hand is probably Straight (As + whatever).
    // As + 9s (hole?) No.
    // Best hand: As + 2d + (Ks Qs Js) -> Straight? A K Q J 2? No.
    // As + 2d + (Ks Qs Js) -> High Card A.
    // Actually, maybe a straight? A K Q J 10... requires As from hole. And what else?
    // He needs 2 cards from hole. As + 2d.
    // Combos: (As 2d) + (K Q J) -> A K Q J 2. Flush? No. Straight? No.
    // (As 2d) + (Q J T) -> A Q J T 2.
    // (As 2d) + (J T 9) -> A J T 9 2.
    // Basically he has garbage compared to the board.

    // Let's make an opponent who HAS 2 spades.
    const p2 = {
        id: "p2",
        name: "P2", // Omaha Winner
        chips: 1000,
        bet: 0,
        cards: [
            { rank: "2", suit: "spades" },
            { rank: "3", suit: "spades" },
            { rank: "4", suit: "hearts" },
            { rank: "5", suit: "hearts" }
        ] as Card[],
        folded: false,
        allIn: false,
        isActive: true,
        seatNumber: 2
    };

    // P2 has 2s 3s. Board Ks Qs Js Ts 9s.
    // P2 uses 2s 3s + Ks Qs Js -> Flush (K Q J 3 2).
    // This calls for Flush.

    // If we run `determineWinners` with mode "omaha", P2 should win.
    // If we run with "holdem" (or standard), P1 would have Royal Flush (As K Q J T). P2 has K Q J T 9 (Straight Flush). P1 wins.

    // Test Omaha Mode
    const winnersOmaha = determineWinners([p1, p2], communityCards, { gameMode: "omaha" } as any);
    assert(winnersOmaha.length === 1 && winnersOmaha[0] === "p2", `Omaha: P2 should win (Flush), P1 has no flush. Winner: ${winnersOmaha}`);

    // Test Holdem Mode (Standard) hack: pass normal gamemode
    // Note: evaluateHand takes 2 cards usually for Holdem, but here we have 4.
    // Our evaluateHand function just takes ALL cards (hole + community) and finds best 5.
    // So in non-Omaha mode, it treats all 9 cards as available pool?
    // Yes, currently evaluateHand(cards) just takes everything and finds best 5.
    // So if we pass 4 hole cards + 5 board = 9 cards. It will find the best 5.
    // In that case, P1 (As ... + K Q J T 9) -> Royal Flush.
    const winnersHoldem = determineWinners([p1, p2], communityCards, { gameMode: "cash" } as any);
    assert(winnersHoldem.length === 1 && winnersHoldem[0] === "p1", `Holdem: P1 should win (Royal Flush). Winner: ${winnersHoldem}`);
}

async function testSngBlinds() {
    log("Testing SNG Time-Based Blind Increases...");
    const startingSmall = 10;
    const startingBig = 20;

    // Reset Date.now mock if needed or just override the state
    // Since we can't easily mock Date.now() without a library in this restricted env,
    // we will artificially mutate the lastBlindIncreaseTime in the state to simulate time passing.

    let gameState = initializeGame(["p1", "p2"], ["P1", "P2"], [1, 2], 1000, 1, "sng");

    // Initial state: Level 1
    assert(gameState.blindLevel === 1, "Initial blind level should be 1");

    // Manually set lastBlindIncreaseTime to 10 minutes ago (exceeding the 5 min interval)
    // We have to cast to any to modify readonly properties if strict, but here they are likely mutable or we just modify.
    // However, startNewHand reads from the passed state.
    gameState.lastBlindIncreaseTime = Date.now() - (10 * 60 * 1000);

    // Start new hand. This should trigger the check.
    gameState = startNewHand(gameState, startingSmall, startingBig);

    // Should be Level 2
    assert(gameState.blindLevel === 2, `Blinds should increase to Level 2. Got ${gameState.blindLevel}`);

    // Check Pot size.
    // Level 2 Multiplier = 1.5^1 = 1.5.
    // SB = 10 * 1.5 = 15.
    // BB = 20 * 1.5 = 30.
    // Pot = 45.
    assert(gameState.pot === 45, `Level 2 Pot should be 45, got ${gameState.pot}`);

    // Simulate another 10 minutes passing
    gameState.lastBlindIncreaseTime = Date.now() - (10 * 60 * 1000);
    gameState = startNewHand(gameState, startingSmall, startingBig);

    // Should be Level 3
    assert(gameState.blindLevel === 3, `Blinds should increase to Level 3. Got ${gameState.blindLevel}`);

    // Pot for Level 3: 1.5^2 = 2.25. SB=22, BB=45. Pot=67.
    assert(gameState.pot === 67, `Level 3 Pot should be 67, got ${gameState.pot}`);
}

async function runTests() {
    try {
        await testOmahaDealing();
        await testOmahaEvaluation();
        await testSngBlinds();
        log("All tests passed!");
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

runTests();
