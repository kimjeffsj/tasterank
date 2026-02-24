/**
 * @jest-environment node
 */
import { GET } from "./route";

// ── mocks ───────────────────────────────────────────────
const mockFrom = jest.fn();
const mockRpc = jest.fn();
const mockGenerateContent = jest.fn();

// Capture and execute after() callback synchronously so tests can verify
// side-effects (RPC calls, skip counts) that happen inside the background task
let capturedAfterFn: (() => Promise<void>) | null = null;
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data: unknown, init?: { status?: number }) => ({
      json: () => Promise.resolve(data),
      status: init?.status ?? 200,
    })),
  },
  after: jest.fn((cb: () => Promise<void>) => {
    capturedAfterFn = cb;
    // Callback is run manually in individual tests that need to verify side-effects
  }),
}));

jest.mock("@/lib/supabase/anon", () => ({
  anonClient: {
    from: (...args: unknown[]) => mockFrom(...args),
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
}));

jest.mock("@/lib/ai/client", () => ({
  getModel: () => ({
    generateContent: mockGenerateContent,
  }),
}));

// Helper to build chainable Supabase query mock
function mockQuery(data: unknown, error: unknown = null) {
  const chain: Record<string, jest.Mock> = {};
  chain.select = jest.fn().mockReturnValue(chain);
  chain.eq = jest.fn().mockReturnValue(chain);
  chain.in = jest.fn().mockReturnValue(chain);
  chain.order = jest.fn().mockReturnValue(chain);
  chain.limit = jest.fn().mockReturnValue(chain);

  // Terminal — resolves the chain
  chain.then = jest
    .fn()
    .mockImplementation((resolve: (v: { data: unknown }) => void) =>
      resolve({ data }),
    );

  // Also resolve directly for await
  Object.defineProperty(chain, Symbol.toStringTag, { value: "Promise" });

  return chain;
}

function makeRequest(secret?: string) {
  const headers = new Headers();
  if (secret) headers.set("authorization", `Bearer ${secret}`);
  return new Request("http://localhost/api/cron/generate-rankings", {
    headers,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  capturedAfterFn = null;
  process.env.CRON_SECRET = "test-cron-secret";
  process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "test-anon-key";
});

describe("GET /api/cron/generate-rankings", () => {
  it("returns 401 without valid cron secret", async () => {
    const res = await GET(makeRequest("wrong-secret"));
    expect(res.status).toBe(401);
  });

  it("returns 401 without authorization header", async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  it("returns success with 0 trips when none exist", async () => {
    mockFrom.mockReturnValue(mockQuery([]));

    const res = await GET(makeRequest("test-cron-secret"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.processed).toBe(0);
  });

  it("skips trips with fewer than 2 entries", async () => {
    const tripsQuery = mockQuery([{ id: "trip1" }]);
    const entriesQuery = mockQuery([
      { entry_id: "e1", title: "Solo", avg_score: 8, rating_count: 1 },
    ]);

    mockFrom.mockReturnValueOnce(tripsQuery).mockReturnValueOnce(entriesQuery);

    const res = await GET(makeRequest("test-cron-secret"));
    await capturedAfterFn?.();

    // Route returns 202 + background task ran; trip with <2 entries → no RPC call
    expect(res.status).toBe(202);
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("processes trips with 2+ entries via RPC", async () => {
    const entries = [
      {
        entry_id: "e1",
        title: "Ramen",
        restaurant_name: "Shop A",
        avg_score: 9.0,
        rating_count: 5,
      },
      {
        entry_id: "e2",
        title: "Sushi",
        restaurant_name: "Shop B",
        avg_score: 8.0,
        rating_count: 3,
      },
    ];

    // Trips → entries → tournaments → aiResponses → ratings
    mockFrom
      .mockReturnValueOnce(mockQuery([{ id: "trip1" }])) // trips
      .mockReturnValueOnce(mockQuery(entries)) // v_entry_avg_scores
      .mockReturnValueOnce(mockQuery([])) // tournaments
      .mockReturnValueOnce(mockQuery([])) // ai_responses
      .mockReturnValueOnce(mockQuery([])); // ratings

    // RPC upsert
    mockRpc.mockResolvedValue({ error: null });

    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify([
            {
              entry_id: "e1",
              sentiment_score: 8.5,
              ai_comment: "Great ramen!",
            },
            {
              entry_id: "e2",
              sentiment_score: 7.0,
              ai_comment: "Nice sushi.",
            },
          ]),
      },
    });

    const res = await GET(makeRequest("test-cron-secret"));
    await capturedAfterFn?.();

    // Route returns 202 + background task ran; RPC should have been called
    expect(res.status).toBe(202);
    expect(mockRpc).toHaveBeenCalledWith(
      "upsert_ai_ranking",
      expect.objectContaining({
        p_trip_id: "trip1",
      }),
    );
  });
});
