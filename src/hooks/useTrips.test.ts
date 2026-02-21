import { renderHook, waitFor, act } from "@testing-library/react";
import { useTrips } from "./useTrips";

// Mock Supabase client
const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockEq = jest.fn();
const mockOrder = jest.fn();
const mockSingle = jest.fn();
const mockRpc = jest.fn();

const mockFrom = jest.fn(() => ({
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
}));

jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: mockFrom,
    rpc: mockRpc,
  }),
}));

describe("useTrips", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default chain: from().select().eq().order() → data
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ order: mockOrder });
    mockOrder.mockResolvedValue({ data: [], error: null });
  });

  it("fetches public trips on mount", async () => {
    const mockTrips = [
      { id: "1", name: "Tokyo", is_public: true },
      { id: "2", name: "Seoul", is_public: true },
    ];
    mockOrder.mockResolvedValue({ data: mockTrips, error: null });

    const { result } = renderHook(() => useTrips());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.trips).toEqual(mockTrips);
    expect(result.current.error).toBeNull();
    expect(mockFrom).toHaveBeenCalledWith("trips");
  });

  it("creates a trip via RPC", async () => {
    mockOrder.mockResolvedValue({ data: [], error: null });
    const newTrip = { id: "new-1", name: "New Trip" };
    mockRpc.mockResolvedValue({ data: newTrip, error: null });

    const { result } = renderHook(() => useTrips());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let created: unknown;
    await act(async () => {
      created = await result.current.createTrip({
        name: "New Trip",
        description: "desc",
        is_public: true,
      });
    });

    expect(mockRpc).toHaveBeenCalledWith("create_trip", {
      p_name: "New Trip",
      p_description: "desc",
      p_is_public: true,
      p_start_date: undefined,
      p_end_date: undefined,
    });
    expect(created).toEqual(newTrip);
  });

  it("handles fetch error", async () => {
    mockOrder.mockResolvedValue({
      data: null,
      error: { message: "Network error" },
    });

    // Override: throw on error
    mockEq.mockReturnValue({
      order: jest.fn().mockImplementation(async () => {
        throw new Error("Network error");
      }),
    });

    const { result } = renderHook(() => useTrips());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Network error");
    expect(result.current.trips).toEqual([]);
  });

  it("updates a trip", async () => {
    mockOrder.mockResolvedValue({ data: [], error: null });

    const updatedTrip = { id: "1", name: "Updated" };
    mockUpdate.mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: updatedTrip,
            error: null,
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useTrips());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let updated: unknown;
    await act(async () => {
      updated = await result.current.updateTrip("1", { name: "Updated" });
    });

    expect(updated).toEqual(updatedTrip);
    expect(mockFrom).toHaveBeenCalledWith("trips");
  });

  it("deletes a trip", async () => {
    mockOrder.mockResolvedValue({ data: [], error: null });

    mockDelete.mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    });

    const { result } = renderHook(() => useTrips());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteTrip("1");
    });

    expect(mockFrom).toHaveBeenCalledWith("trips");
  });

  describe("myTripsOnly", () => {
    it("fetches trips from trip_members", async () => {
      const memberRows = [
        { trip_id: "t1", trips: { id: "t1", name: "Tokyo" } },
        { trip_id: "t2", trips: { id: "t2", name: "Seoul" } },
      ];
      // myTripsOnly uses: from("trip_members").select(...).order(...)
      mockSelect.mockReturnValue({ order: mockOrder });
      mockOrder.mockResolvedValue({ data: memberRows, error: null });

      const { result } = renderHook(() => useTrips({ myTripsOnly: true }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockFrom).toHaveBeenCalledWith("trip_members");
      expect(result.current.trips).toEqual([
        { id: "t1", name: "Tokyo" },
        { id: "t2", name: "Seoul" },
      ]);
    });

    it("deduplicates trips when the same trip appears multiple times in trip_members", async () => {
      // A trip can appear twice: once as owner row, once as member row
      const memberRows = [
        { trip_id: "t1", trips: { id: "t1", name: "Tokyo" } },
        { trip_id: "t1", trips: { id: "t1", name: "Tokyo" } }, // duplicate
        { trip_id: "t2", trips: { id: "t2", name: "Seoul" } },
      ];
      mockSelect.mockReturnValue({ order: mockOrder });
      mockOrder.mockResolvedValue({ data: memberRows, error: null });

      const { result } = renderHook(() => useTrips({ myTripsOnly: true }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.trips).toHaveLength(2);
      expect(result.current.trips.map((t) => t.id)).toEqual(["t1", "t2"]);
    });
  });
});
