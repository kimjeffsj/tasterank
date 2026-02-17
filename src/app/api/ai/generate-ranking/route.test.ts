/**
 * @jest-environment node
 */
import { POST } from "./route";

// Mock Supabase
const mockGetUser = jest.fn();
const mockFrom = jest.fn();
jest.mock("@/lib/supabase/route", () => ({
  createRouteClient: () =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    }),
}));

// Mock AI client
const mockGenerateContent = jest.fn();
jest.mock("@/lib/ai/client", () => ({
  getModel: () => ({
    generateContent: mockGenerateContent,
  }),
}));

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/ai/generate-ranking", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// Helper for chaining supabase queries
function mockSupabaseChain(data: unknown, error: unknown = null) {
  return {
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data, error }),
          in: jest.fn().mockResolvedValue({ data, error }),
          order: jest.fn().mockResolvedValue({ data, error }),
        }),
        in: jest.fn().mockResolvedValue({ data, error }),
        order: jest.fn().mockResolvedValue({ data, error }),
        single: jest.fn().mockResolvedValue({ data, error }),
      }),
    }),
    insert: jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue({ data, error }),
    }),
    delete: jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ data: null, error: null }),
    }),
  };
}

describe("POST /api/ai/generate-ranking", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const res = await POST(makeRequest({ tripId: "t1" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 when tripId is missing", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });

    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it("returns 403 when user is not a trip editor", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });

    // trip_members query returns empty (not a member)
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      }),
    });

    const res = await POST(makeRequest({ tripId: "t1" }));
    expect(res.status).toBe(403);
  });

  it("returns 200 with ranking data on success", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });

    const callIndex = { value: 0 };
    mockFrom.mockImplementation((table: string) => {
      if (table === "trip_members") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                in: jest.fn().mockResolvedValue({
                  data: [{ user_id: "u1", role: "owner" }],
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
      if (table === "v_entry_avg_scores") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: [
                { entry_id: "e1", title: "Ramen", restaurant_name: "Ichiran", avg_score: 8.5, rating_count: 3 },
                { entry_id: "e2", title: "Sushi", restaurant_name: null, avg_score: 7.0, rating_count: 2 },
              ],
              error: null,
            }),
          }),
        };
      }
      if (table === "tournament_votes") {
        return {
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({
              data: [
                { winner_id: "e1" },
                { winner_id: "e1" },
                { winner_id: "e2" },
              ],
              error: null,
            }),
          }),
        };
      }
      if (table === "tournaments") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: [{ id: "tour1" }],
              error: null,
            }),
          }),
        };
      }
      if (table === "ai_responses") {
        return {
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({
              data: [
                { question_id: "q1", response_value: 4, response_text: null, ai_questions: { entry_id: "e1" } },
              ],
              error: null,
            }),
          }),
        };
      }
      if (table === "ratings") {
        return {
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({
              data: [
                { entry_id: "e1", review_text: "Amazing broth!" },
              ],
              error: null,
            }),
          }),
        };
      }
      if (table === "ai_rankings") {
        callIndex.value++;
        if (callIndex.value <= 1) {
          // delete
          return {
            delete: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: null, error: null }),
            }),
          };
        }
        // insert
        return {
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue({
              data: [{ id: "ar1" }],
              error: null,
            }),
          }),
        };
      }
      return mockSupabaseChain(null);
    });

    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          '[{"entry_id": "e1", "sentiment_score": 9.0, "ai_comment": "Outstanding ramen"}, {"entry_id": "e2", "sentiment_score": 7.5, "ai_comment": "Fresh sushi"}]',
      },
    });

    const res = await POST(makeRequest({ tripId: "t1" }));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.ranking).toHaveLength(2);
    expect(json.saved).toBe(true);
    // e1 should rank higher
    expect(json.ranking[0].entry_id).toBe("e1");
    expect(json.ranking[0].composite_score).toBeDefined();
    expect(json.ranking[0].ai_comment).toBeDefined();
    expect(json.ranking[0].breakdown).toBeDefined();
  });

  it("uses fallback sentiment when AI fails", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });

    const callIndex = { value: 0 };
    mockFrom.mockImplementation((table: string) => {
      if (table === "trip_members") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                in: jest.fn().mockResolvedValue({
                  data: [{ user_id: "u1", role: "owner" }],
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
      if (table === "v_entry_avg_scores") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: [
                { entry_id: "e1", title: "Ramen", restaurant_name: null, avg_score: 8, rating_count: 2 },
                { entry_id: "e2", title: "Sushi", restaurant_name: null, avg_score: 6, rating_count: 1 },
              ],
              error: null,
            }),
          }),
        };
      }
      if (table === "tournaments") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        };
      }
      if (table === "tournament_votes") {
        return {
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        };
      }
      if (table === "ai_responses") {
        return {
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        };
      }
      if (table === "ratings") {
        return {
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        };
      }
      if (table === "ai_rankings") {
        callIndex.value++;
        if (callIndex.value <= 1) {
          return {
            delete: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: null, error: null }),
            }),
          };
        }
        return {
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue({ data: [{ id: "ar1" }], error: null }),
          }),
        };
      }
      return mockSupabaseChain(null);
    });

    // AI fails
    mockGenerateContent.mockRejectedValue(new Error("API limit"));

    const res = await POST(makeRequest({ tripId: "t1" }));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.ranking).toHaveLength(2);
    // Fallback sentiment = 5.0
    for (const entry of json.ranking) {
      expect(entry.breakdown.sentiment).toBe(5);
      expect(entry.ai_comment).toContain("composite ranking");
    }
  });

  it("returns 400 when fewer than 2 entries", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });

    mockFrom.mockImplementation((table: string) => {
      if (table === "trip_members") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                in: jest.fn().mockResolvedValue({
                  data: [{ user_id: "u1", role: "owner" }],
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
      if (table === "v_entry_avg_scores") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: [{ entry_id: "e1", title: "Ramen", avg_score: 8, rating_count: 1 }],
              error: null,
            }),
          }),
        };
      }
      return mockSupabaseChain(null);
    });

    const res = await POST(makeRequest({ tripId: "t1" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("2 entries");
  });
});
