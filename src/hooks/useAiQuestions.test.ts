import { renderHook, act } from "@testing-library/react";
import { useAiQuestions } from "./useAiQuestions";

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock Supabase client
const mockUpsert = jest.fn();
jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: () => ({
      upsert: mockUpsert,
    }),
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
});
