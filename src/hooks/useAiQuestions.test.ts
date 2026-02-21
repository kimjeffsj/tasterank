import { renderHook, act } from "@testing-library/react";
import { useAiQuestions } from "./useAiQuestions";

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock Supabase client
const mockUpsert = jest.fn();
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockIn = jest.fn();
const mockOrder = jest.fn();

const createMockChain = () => {
  const chain = {
    select: mockSelect,
    eq: mockEq,
    in: mockIn,
    order: mockOrder,
    upsert: mockUpsert,
  };
  mockSelect.mockReturnValue(chain);
  mockEq.mockReturnValue(chain);
  mockIn.mockReturnValue(chain);
  mockOrder.mockReturnValue(chain);
  return chain;
};

jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: () => createMockChain(),
  }),
}));

describe("useAiQuestions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpsert.mockReturnValue({ error: null });
  });

  it("starts with empty state", () => {
    const { result } = renderHook(() => useAiQuestions());
    expect(result.current.questions).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("generates questions from API", async () => {
    const mockQuestions = [
      { id: "q1", question_text: "How spicy?", question_type: "scale", question_order: 1 },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ questions: mockQuestions }),
    });

    const { result } = renderHook(() => useAiQuestions());

    await act(async () => {
      await result.current.generateQuestions({ entryId: "e1", title: "Ramen" });
    });

    expect(result.current.questions).toEqual(mockQuestions);
    expect(result.current.loading).toBe(false);
    expect(mockFetch).toHaveBeenCalledWith("/api/ai/follow-up-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entryId: "e1", title: "Ramen" }),
    });
  });

  it("handles API failure gracefully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: "Failed" }),
    });

    const { result } = renderHook(() => useAiQuestions());

    await act(async () => {
      await result.current.generateQuestions({ entryId: "e1", title: "Ramen" });
    });

    expect(result.current.questions).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it("handles network error gracefully", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useAiQuestions());

    await act(async () => {
      await result.current.generateQuestions({ entryId: "e1", title: "Ramen" });
    });

    expect(result.current.questions).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it("saves responses via Supabase upsert", async () => {
    const { result } = renderHook(() => useAiQuestions());

    const responses = new Map<string, { text?: string; value?: number }>();
    responses.set("q1", { value: 4 });
    responses.set("q2", { text: "Great flavor" });

    await act(async () => {
      await result.current.saveResponses("u1", responses);
    });

    expect(mockUpsert).toHaveBeenCalledWith(
      [
        { question_id: "q1", user_id: "u1", response_value: 4, response_text: undefined },
        { question_id: "q2", user_id: "u1", response_value: undefined, response_text: "Great flavor" },
      ],
      { onConflict: "question_id,user_id" },
    );
  });

  it("sets loading during generation", async () => {
    let resolvePromise: (v: unknown) => void;
    mockFetch.mockReturnValueOnce(
      new Promise((resolve) => {
        resolvePromise = resolve;
      }),
    );

    const { result } = renderHook(() => useAiQuestions());

    let generatePromise: Promise<void>;
    act(() => {
      generatePromise = result.current.generateQuestions({ entryId: "e1", title: "Ramen" });
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolvePromise!({
        ok: true,
        json: () => Promise.resolve({ questions: [] }),
      });
      await generatePromise!;
    });

    expect(result.current.loading).toBe(false);
  });

  it("fetches questions from DB by entryId", async () => {
    const mockQuestions = [
      { id: "q1", question_text: "How spicy?", question_type: "scale", options: null, question_order: 1 },
    ];

    mockOrder.mockReturnValueOnce({ data: mockQuestions, error: null });

    const { result } = renderHook(() => useAiQuestions());

    let fetched: unknown[];
    await act(async () => {
      fetched = await result.current.fetchQuestions("entry-1");
    });

    expect(fetched!).toEqual(mockQuestions);
    expect(result.current.questions).toEqual(mockQuestions);
    expect(result.current.loading).toBe(false);
  });

  it("returns empty array when fetchQuestions has DB error", async () => {
    mockOrder.mockReturnValueOnce({ data: null, error: { message: "DB error" } });

    const { result } = renderHook(() => useAiQuestions());

    let fetched: unknown[];
    await act(async () => {
      fetched = await result.current.fetchQuestions("entry-1");
    });

    expect(fetched!).toEqual([]);
    expect(result.current.questions).toEqual([]);
  });

  it("fetchUnansweredCount returns count map", async () => {
    // e1 has ANY response (q2) → considered answered → not in map
    // e2 has no responses at all → unanswered → in map
    const mockData = [
      { id: "q1", entry_id: "e1", ai_responses: [] },
      { id: "q2", entry_id: "e1", ai_responses: [{ id: "r1" }] },
      { id: "q3", entry_id: "e2", ai_responses: [] },
    ];

    mockEq.mockReturnValueOnce({ data: mockData, error: null });

    const { result } = renderHook(() => useAiQuestions());

    let countMap: Map<string, number>;
    await act(async () => {
      countMap = await result.current.fetchUnansweredCount(["e1", "e2"], "u1");
    });

    expect(countMap!.get("e1")).toBeUndefined(); // e1 has at least one response → answered
    expect(countMap!.get("e2")).toBe(1);         // e2 has no responses → unanswered
  });

  it("fetchUnansweredCount returns empty map on error", async () => {
    mockEq.mockReturnValueOnce({ data: null, error: { message: "fail" } });

    const { result } = renderHook(() => useAiQuestions());

    let countMap: Map<string, number>;
    await act(async () => {
      countMap = await result.current.fetchUnansweredCount(["e1"], "u1");
    });

    expect(countMap!.size).toBe(0);
  });

  it("dismissQuestions inserts empty responses for all questions", async () => {
    const mockQuestions = [{ id: "q1" }, { id: "q2" }];
    mockEq.mockReturnValueOnce({ data: mockQuestions });

    const { result } = renderHook(() => useAiQuestions());

    await act(async () => {
      await result.current.dismissQuestions("entry-1", "user-1");
    });

    expect(mockUpsert).toHaveBeenCalledWith(
      [
        { question_id: "q1", user_id: "user-1" },
        { question_id: "q2", user_id: "user-1" },
      ],
      { onConflict: "question_id,user_id" },
    );
  });

  it("dismissQuestions does nothing when no questions exist", async () => {
    mockEq.mockReturnValueOnce({ data: [] });

    const { result } = renderHook(() => useAiQuestions());

    await act(async () => {
      await result.current.dismissQuestions("entry-1", "user-1");
    });

    expect(mockUpsert).not.toHaveBeenCalled();
  });
});
