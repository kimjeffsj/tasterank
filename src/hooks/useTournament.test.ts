import { renderHook, waitFor, act } from "@testing-library/react";
import { useTournament } from "./useTournament";

// Mock bracket utilities
jest.mock("@/lib/tournament/bracket", () => ({
  calculateBracketSize: jest.fn((count: number) => {
    if (count <= 4) return 4;
    if (count <= 8) return 8;
    return 16;
  }),
  seedEntries: jest.fn((entries: { id: string; avg_score: number | null }[]) =>
    [...entries].sort((a, b) => (b.avg_score ?? 0) - (a.avg_score ?? 0)),
  ),
  generateRound1: jest.fn((ids: string[], bracketSize: number) => {
    const numMatches = bracketSize / 2;
    return Array.from({ length: numMatches }, (_, i) => ({
      matchOrder: i,
      entryA: ids[i] ?? `seed-${i}`,
      entryB: bracketSize - 1 - i < ids.length ? ids[bracketSize - 1 - i] : null,
    }));
  }),
  generateNextRound: jest.fn((winners: string[]) =>
    Array.from({ length: winners.length / 2 }, (_, i) => ({
      matchOrder: i,
      entryA: winners[i * 2],
      entryB: winners[i * 2 + 1],
    })),
  ),
  calculateRounds: jest.fn((size: number) => Math.log2(size)),
}));

const mockGetUser = jest.fn();
let tableHandlers: Record<string, () => Record<string, jest.Mock>> = {};

function mockFromFn(table: string) {
  if (tableHandlers[table]) return tableHandlers[table]();
  // default: return empty
  return createEmptyTableMock();
}

function createEmptyTableMock() {
  const eqChain: jest.Mock = jest.fn().mockReturnThis() as jest.Mock;
  const mock = {
    select: jest.fn().mockReturnValue({
      eq: eqChain,
      in: jest.fn().mockResolvedValue({ data: [], error: null }),
      order: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: { code: "PGRST116" } }),
        }),
      }),
    }),
    insert: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      }),
    }),
  };
  // Make eq chainable with order/single
  eqChain.mockReturnValue({
    eq: jest.fn().mockReturnValue({
      order: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: { code: "PGRST116" } }),
        }),
      }),
    }),
    order: jest.fn().mockResolvedValue({ data: [], error: null }),
    in: jest.fn().mockResolvedValue({ data: [], error: null }),
  });
  return mock;
}

jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: (table: string) => mockFromFn(table),
    auth: { getUser: () => mockGetUser() },
  }),
}));

const TRIP_ID = "trip-123";
const USER_ID = "user-456";

describe("useTournament", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    tableHandlers = {};
    mockGetUser.mockResolvedValue({
      data: { user: { id: USER_ID } },
    });
  });

  it("loads with no tournament state", async () => {
    const { result } = renderHook(() => useTournament(TRIP_ID));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tournament).toBeNull();
  });

  it("loads existing tournament and votes", async () => {
    const tournament = {
      id: "t-1",
      trip_id: TRIP_ID,
      status: "active",
      total_rounds: 2,
      total_entries: 4,
      bracket_size: 4,
      seed_order: ["a", "b", "c", "d"],
      created_by: USER_ID,
    };

    tableHandlers["tournaments"] = () => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: tournament, error: null }),
              }),
            }),
          }),
        }),
      }),
      insert: jest.fn(),
    });

    tableHandlers["food_entries"] = () => ({
      select: jest.fn().mockReturnValue({
        in: jest.fn().mockResolvedValue({
          data: [
            { id: "a", title: "Ramen", restaurant_name: "Shop A", food_photos: [] },
            { id: "b", title: "Sushi", restaurant_name: "Shop B", food_photos: [] },
            { id: "c", title: "Udon", restaurant_name: "Shop C", food_photos: [] },
            { id: "d", title: "Curry", restaurant_name: "Shop D", food_photos: [] },
          ],
          error: null,
        }),
      }),
      insert: jest.fn(),
    });

    tableHandlers["v_entry_avg_scores"] = () => ({
      select: jest.fn().mockReturnValue({
        in: jest.fn().mockResolvedValue({
          data: [
            { entry_id: "a", avg_score: 4.5 },
            { entry_id: "b", avg_score: 3.5 },
          ],
          error: null,
        }),
      }),
      insert: jest.fn(),
    });

    tableHandlers["tournament_votes"] = () => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      }),
      insert: jest.fn(),
    });

    const { result } = renderHook(() => useTournament(TRIP_ID));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tournament).toEqual(tournament);
    expect(result.current.currentMatch).not.toBeNull();
  });

  it("detects user complete when all votes cast", async () => {
    const tournament = {
      id: "t-1",
      trip_id: TRIP_ID,
      status: "active",
      total_rounds: 2,
      total_entries: 4,
      bracket_size: 4,
      seed_order: ["a", "b", "c", "d"],
      created_by: USER_ID,
    };

    // All votes for a 4-bracket tournament (2 rounds, 3 matches total)
    const allVotes = [
      { id: "v1", tournament_id: "t-1", user_id: USER_ID, round_number: 1, match_order: 0, entry_a_id: "a", entry_b_id: "d", winner_id: "a" },
      { id: "v2", tournament_id: "t-1", user_id: USER_ID, round_number: 1, match_order: 1, entry_a_id: "b", entry_b_id: "c", winner_id: "b" },
      { id: "v3", tournament_id: "t-1", user_id: USER_ID, round_number: 2, match_order: 0, entry_a_id: "a", entry_b_id: "b", winner_id: "a" },
    ];

    tableHandlers["tournaments"] = () => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: tournament, error: null }),
              }),
            }),
          }),
        }),
      }),
      insert: jest.fn(),
    });

    tableHandlers["food_entries"] = () => ({
      select: jest.fn().mockReturnValue({
        in: jest.fn().mockResolvedValue({ data: [], error: null }),
      }),
      insert: jest.fn(),
    });

    tableHandlers["v_entry_avg_scores"] = () => ({
      select: jest.fn().mockReturnValue({
        in: jest.fn().mockResolvedValue({ data: [], error: null }),
      }),
      insert: jest.fn(),
    });

    tableHandlers["tournament_votes"] = () => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: allVotes, error: null }),
          }),
        }),
      }),
      insert: jest.fn(),
    });

    const { result } = renderHook(() => useTournament(TRIP_ID));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isUserComplete).toBe(true);
    expect(result.current.currentMatch).toBeNull();
  });
});
