import { renderHook, waitFor, act } from "@testing-library/react";
import { useProfile } from "./useProfile";
import { createClient } from "@/lib/supabase/client";

// Mock Supabase client
jest.mock("@/lib/supabase/client");

const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;

describe("useProfile", () => {
  const mockSupabase = {
    from: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateClient.mockReturnValue(mockSupabase as any);
  });

  it("returns initial loading state", () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockReturnValue(new Promise(() => {})),
        }),
      }),
    } as any);

    const { result } = renderHook(() => useProfile("user-123"));

    expect(result.current.loading).toBe(true);
    expect(result.current.profile).toBeNull();
    expect(result.current.stats).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("returns null when userId is undefined", async () => {
    const { result } = renderHook(() => useProfile(undefined));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.profile).toBeNull();
    expect(result.current.stats).toBeNull();
    expect(result.current.error).toBeNull();
    expect(mockSupabase.from).not.toHaveBeenCalled();
  });

  it("fetches profile and stats successfully", async () => {
    const mockProfile = {
      id: "user-123",
      username: "testuser",
      display_name: "Test User",
      avatar_url: "https://example.com/avatar.jpg",
      created_at: "2024-01-01T00:00:00Z",
    };

    // Mock profile query
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "profiles") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockProfile,
                error: null,
              }),
            }),
          }),
        } as any;
      }
      // Mock count queries for stats
      if (table === "trip_members") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              count: 5,
              error: null,
            }),
          }),
        } as any;
      }
      if (table === "food_entries") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              count: 12,
              error: null,
            }),
          }),
        } as any;
      }
      if (table === "ratings") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              count: 30,
              error: null,
            }),
          }),
        } as any;
      }
      return {} as any;
    });

    const { result } = renderHook(() => useProfile("user-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.profile).toEqual(mockProfile);
    expect(result.current.stats).toEqual({
      tripCount: 5,
      entryCount: 12,
      ratingCount: 30,
    });
    expect(result.current.error).toBeNull();
  });

  it("handles profile fetch error", async () => {
    const mockError = { message: "Profile not found" };

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "profiles") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: mockError,
              }),
            }),
          }),
        } as any;
      }
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            count: 0,
            error: null,
          }),
        }),
      } as any;
    });

    const { result } = renderHook(() => useProfile("user-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.profile).toBeNull();
    expect(result.current.error).toEqual(mockError);
  });

  it("handles stats fetch error", async () => {
    const mockProfile = {
      id: "user-123",
      username: "testuser",
      display_name: "Test User",
      avatar_url: "https://example.com/avatar.jpg",
      created_at: "2024-01-01T00:00:00Z",
    };

    const mockStatsError = { message: "Stats error" };

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "profiles") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockProfile,
                error: null,
              }),
            }),
          }),
        } as any;
      }
      // Return error for stats
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            count: null,
            error: mockStatsError,
          }),
        }),
      } as any;
    });

    const { result } = renderHook(() => useProfile("user-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.profile).toEqual(mockProfile);
    expect(result.current.stats).toBeNull();
    expect(result.current.error).toEqual(mockStatsError);
  });

  it("refetch function reloads data", async () => {
    const mockProfile = {
      id: "user-123",
      username: "testuser",
      display_name: "Test User",
      avatar_url: "https://example.com/avatar.jpg",
      created_at: "2024-01-01T00:00:00Z",
    };

    let callCount = 0;

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "profiles") {
        callCount++;
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockProfile,
                error: null,
              }),
            }),
          }),
        } as any;
      }
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            count: 0,
            error: null,
          }),
        }),
      } as any;
    });

    const { result } = renderHook(() => useProfile("user-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(callCount).toBe(1);

    // Call refetch
    act(() => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(callCount).toBe(2);
    });
  });
});
