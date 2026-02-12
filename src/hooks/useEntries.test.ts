import { renderHook, waitFor, act } from "@testing-library/react";
import { useEntries } from "./useEntries";

// Mock Supabase client
const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockEq = jest.fn();
const mockOrder = jest.fn();
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

const TRIP_ID = "trip-123";

describe("useEntries", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default chain: from().select().eq().order() → data
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ order: mockOrder });
    mockOrder.mockResolvedValue({ data: [], error: null });
  });

  it("fetches entries for a trip on mount", async () => {
    const mockEntries = [
      { id: "e1", title: "Ramen", trip_id: TRIP_ID },
      { id: "e2", title: "Sushi", trip_id: TRIP_ID },
    ];
    mockOrder.mockResolvedValue({ data: mockEntries, error: null });

    const { result } = renderHook(() => useEntries(TRIP_ID));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.entries).toEqual(mockEntries);
    expect(result.current.error).toBeNull();
    expect(mockFrom).toHaveBeenCalledWith("food_entries");
    expect(mockEq).toHaveBeenCalledWith("trip_id", TRIP_ID);
  });

  it("does not fetch when tripId is empty", async () => {
    const { result } = renderHook(() => useEntries(""));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.entries).toEqual([]);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("handles fetch error", async () => {
    mockEq.mockReturnValue({
      order: jest.fn().mockImplementation(async () => {
        throw new Error("Network error");
      }),
    });

    const { result } = renderHook(() => useEntries(TRIP_ID));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Network error");
    expect(result.current.entries).toEqual([]);
  });

  it("creates an entry", async () => {
    const newEntry = {
      id: "e-new",
      title: "Bibimbap",
      trip_id: TRIP_ID,
      created_by: "user-1",
    };
    mockInsert.mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: newEntry, error: null }),
      }),
    });

    const { result } = renderHook(() => useEntries(TRIP_ID));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let created: unknown;
    await act(async () => {
      created = await result.current.createEntry({
        title: "Bibimbap",
        trip_id: TRIP_ID,
        created_by: "user-1",
      });
    });

    expect(created).toEqual(newEntry);
    expect(mockFrom).toHaveBeenCalledWith("food_entries");
  });

  it("updates an entry", async () => {
    const updatedEntry = {
      id: "e1",
      title: "Updated Ramen",
      trip_id: TRIP_ID,
    };
    mockUpdate.mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: updatedEntry,
            error: null,
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useEntries(TRIP_ID));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let updated: unknown;
    await act(async () => {
      updated = await result.current.updateEntry("e1", {
        title: "Updated Ramen",
      });
    });

    expect(updated).toEqual(updatedEntry);
  });

  it("deletes an entry", async () => {
    mockDelete.mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    });

    const { result } = renderHook(() => useEntries(TRIP_ID));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteEntry("e1");
    });

    expect(mockFrom).toHaveBeenCalledWith("food_entries");
  });

  it("throws on create error", async () => {
    mockInsert.mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Insert failed" },
        }),
      }),
    });

    const { result } = renderHook(() => useEntries(TRIP_ID));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await expect(
      act(async () => {
        await result.current.createEntry({
          title: "Fail",
          trip_id: TRIP_ID,
          created_by: "user-1",
        });
      }),
    ).rejects.toEqual({ message: "Insert failed" });
  });
});
