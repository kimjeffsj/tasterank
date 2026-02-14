import { renderHook, waitFor, act } from "@testing-library/react";
import { useRatings } from "./useRatings";

// Mock Supabase client
const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();

const mockFrom = jest.fn(() => ({
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
}));

jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: mockFrom,
  }),
}));

const ENTRY_ID = "entry-123";

describe("useRatings", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default chain: from().select().eq() → data
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockResolvedValue({ data: [], error: null });
  });

  it("fetches ratings for an entry on mount", async () => {
    const mockRatings = [
      { id: "r1", entry_id: ENTRY_ID, user_id: "u1", score: 8.5 },
      { id: "r2", entry_id: ENTRY_ID, user_id: "u2", score: 7.0 },
    ];
    mockEq.mockResolvedValue({ data: mockRatings, error: null });

    const { result } = renderHook(() => useRatings(ENTRY_ID));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.ratings).toEqual(mockRatings);
    expect(result.current.error).toBeNull();
    expect(mockFrom).toHaveBeenCalledWith("ratings");
    expect(mockEq).toHaveBeenCalledWith("entry_id", ENTRY_ID);
  });

  it("does not fetch when entryId is empty", async () => {
    const { result } = renderHook(() => useRatings(""));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.ratings).toEqual([]);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("handles fetch error", async () => {
    mockEq.mockImplementation(async () => {
      throw new Error("Network error");
    });

    const { result } = renderHook(() => useRatings(ENTRY_ID));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Network error");
    expect(result.current.ratings).toEqual([]);
  });

  it("creates a rating (upsert)", async () => {
    const newRating = {
      id: "r-new",
      entry_id: ENTRY_ID,
      user_id: "u1",
      score: 9.0,
    };
    mockInsert.mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: newRating, error: null }),
      }),
    });

    const { result } = renderHook(() => useRatings(ENTRY_ID));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let created: unknown;
    await act(async () => {
      created = await result.current.upsertRating({
        entry_id: ENTRY_ID,
        user_id: "u1",
        score: 9.0,
      });
    });

    expect(created).toEqual(newRating);
    expect(mockFrom).toHaveBeenCalledWith("ratings");
  });

  it("updates an existing rating", async () => {
    const updatedRating = {
      id: "r1",
      entry_id: ENTRY_ID,
      user_id: "u1",
      score: 7.5,
    };
    mockUpdate.mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: updatedRating,
            error: null,
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useRatings(ENTRY_ID));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let updated: unknown;
    await act(async () => {
      updated = await result.current.updateRating("r1", {
        score: 7.5,
      });
    });

    expect(updated).toEqual(updatedRating);
  });

  it("deletes a rating", async () => {
    mockDelete.mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    });

    const { result } = renderHook(() => useRatings(ENTRY_ID));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteRating("r1");
    });

    expect(mockFrom).toHaveBeenCalledWith("ratings");
  });

  it("throws on upsert error", async () => {
    mockInsert.mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Insert failed" },
        }),
      }),
    });

    const { result } = renderHook(() => useRatings(ENTRY_ID));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await expect(
      act(async () => {
        await result.current.upsertRating({
          entry_id: ENTRY_ID,
          user_id: "u1",
          score: 5,
        });
      }),
    ).rejects.toEqual({ message: "Insert failed" });
  });
});
