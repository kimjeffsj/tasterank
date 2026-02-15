/**
 * @jest-environment node
 */
import { POST } from "./route";

// Mock Supabase server client
const mockGetUser = jest.fn();
const mockInsert = jest.fn();
const mockSelect = jest.fn();
jest.mock("@/lib/supabase/route", () => ({
  createRouteClient: () =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
      from: () => ({
        insert: mockInsert,
      }),
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
  return new Request("http://localhost/api/ai/follow-up-questions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/ai/follow-up-questions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInsert.mockReturnValue({ select: mockSelect });
  });

  it("returns 401 when not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const res = await POST(makeRequest({ entryId: "e1", title: "Ramen" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 when entryId or title is missing", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });

    const res1 = await POST(makeRequest({ title: "Ramen" }));
    expect(res1.status).toBe(400);

    const res2 = await POST(makeRequest({ entryId: "e1" }));
    expect(res2.status).toBe(400);
  });

  it("returns generated questions on success", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });

    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          '[{"question_text": "How spicy?", "question_type": "scale", "question_order": 1}]',
      },
    });

    const savedQuestions = [
      { id: "q1", question_text: "How spicy?", question_type: "scale", question_order: 1, options: null, entry_id: "e1" },
    ];
    mockSelect.mockResolvedValue({ data: savedQuestions, error: null });

    const res = await POST(
      makeRequest({ entryId: "e1", title: "Ramen", score: 8 }),
    );
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.questions).toEqual(savedQuestions);
    expect(mockInsert).toHaveBeenCalled();
  });

  it("returns empty questions on AI failure (graceful degradation)", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    mockGenerateContent.mockRejectedValue(new Error("API limit"));

    const res = await POST(makeRequest({ entryId: "e1", title: "Ramen" }));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.questions).toEqual([]);
  });

  it("returns empty questions when AI returns unparseable result", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    mockGenerateContent.mockResolvedValue({
      response: { text: () => "Sorry, I cannot help." },
    });

    const res = await POST(makeRequest({ entryId: "e1", title: "Ramen" }));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.questions).toEqual([]);
  });
});
