/**
 * @jest-environment node
 */
import { POST } from "./route";

// Mock Supabase server client
const mockGetUser = jest.fn();
jest.mock("@/lib/supabase/route", () => ({
  createRouteClient: () =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
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
  return new Request("http://localhost/api/ai/suggest-tags", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/ai/suggest-tags", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const res = await POST(makeRequest({ title: "Ramen" }));
    expect(res.status).toBe(401);

    const json = await res.json();
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 400 when title is missing", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
    });

    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it("returns suggested tags on success", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
    });

    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          '[{"name": "japanese", "category": "cuisine", "confidence": 0.95}]',
      },
    });

    const res = await POST(
      makeRequest({ title: "Ramen", restaurantName: "Ichiran" }),
    );
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.tags).toEqual([
      { name: "japanese", category: "cuisine", confidence: 0.95 },
    ]);
  });

  it("returns 500 when AI generation fails", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
    });

    mockGenerateContent.mockRejectedValue(new Error("API limit reached"));

    const res = await POST(makeRequest({ title: "Ramen" }));
    expect(res.status).toBe(500);

    const json = await res.json();
    expect(json.error).toBe("Failed to generate tag suggestions");
  });
});
