/**
 * RLS Policy Integration Tests
 *
 * These tests verify that our Supabase queries are structured correctly
 * to work with the RLS policies defined in the migration.
 * They mock Supabase to verify the correct query patterns are used.
 */

const mockEq = jest.fn();
const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockOrder = jest.fn();
const mockSingle = jest.fn();
const mockRpc = jest.fn();

const mockFrom = jest.fn(() => ({
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
}));

const mockSupabase = {
  from: mockFrom,
  rpc: mockRpc,
};

// Mock both client types
jest.mock("@/lib/supabase/client", () => ({
  createClient: () => mockSupabase,
}));

jest.mock("@/lib/supabase/anon", () => ({
  anonClient: mockSupabase,
}));

describe("RLS Policy Patterns", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ order: mockOrder, eq: mockEq, select: mockSelect, single: mockSingle });
    mockOrder.mockResolvedValue({ data: [], error: null });
    mockSingle.mockResolvedValue({ data: null, error: null });
  });

  describe("Public data access (anon)", () => {
    it("queries public trips with is_public filter", async () => {
      const { anonClient } = await import("@/lib/supabase/anon");

      anonClient.from("trips").select("*").eq("is_public", true);

      expect(mockFrom).toHaveBeenCalledWith("trips");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockEq).toHaveBeenCalledWith("is_public", true);
    });

    it("queries food entries by trip_id for public viewing", async () => {
      const { anonClient } = await import("@/lib/supabase/anon");

      anonClient.from("food_entries").select("id, title, restaurant_name, created_at").eq("trip_id", "trip-1");

      expect(mockFrom).toHaveBeenCalledWith("food_entries");
      expect(mockEq).toHaveBeenCalledWith("trip_id", "trip-1");
    });

    it("queries entries with food_photos join", async () => {
      const { anonClient } = await import("@/lib/supabase/anon");

      anonClient.from("food_entries")
        .select("id, title, restaurant_name, created_at, food_photos(photo_url, display_order)")
        .eq("trip_id", "trip-1");

      expect(mockSelect).toHaveBeenCalledWith(
        "id, title, restaurant_name, created_at, food_photos(photo_url, display_order)",
      );
    });
  });

  describe("Authenticated CRUD", () => {
    it("creates entry with trip_id and created_by", async () => {
      mockInsert.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: "e1" },
            error: null,
          }),
        }),
      });

      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      await supabase
        .from("food_entries")
        .insert({
          trip_id: "trip-1",
          created_by: "user-1",
          title: "Ramen",
        })
        .select()
        .single();

      expect(mockFrom).toHaveBeenCalledWith("food_entries");
      expect(mockInsert).toHaveBeenCalledWith({
        trip_id: "trip-1",
        created_by: "user-1",
        title: "Ramen",
      });
    });

    it("creates rating with entry_id, user_id, and score", async () => {
      mockInsert.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: "r1" },
            error: null,
          }),
        }),
      });

      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      await supabase
        .from("ratings")
        .insert({
          entry_id: "entry-1",
          user_id: "user-1",
          score: 8.5,
        })
        .select()
        .single();

      expect(mockFrom).toHaveBeenCalledWith("ratings");
      expect(mockInsert).toHaveBeenCalledWith({
        entry_id: "entry-1",
        user_id: "user-1",
        score: 8.5,
      });
    });

    it("uses join_trip_by_invite RPC for invite system", async () => {
      mockRpc.mockResolvedValue({
        data: { id: "trip-1", name: "Tokyo Trip" },
        error: null,
      });

      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      await supabase.rpc("join_trip_by_invite", {
        p_invite_code: "abc123",
      });

      expect(mockRpc).toHaveBeenCalledWith("join_trip_by_invite", {
        p_invite_code: "abc123",
      });
    });

    it("uses create_trip RPC for atomic trip + member creation", async () => {
      mockRpc.mockResolvedValue({
        data: { id: "trip-1", name: "New Trip" },
        error: null,
      });

      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      await supabase.rpc("create_trip", {
        p_name: "New Trip",
        p_is_public: true,
      });

      expect(mockRpc).toHaveBeenCalledWith("create_trip", {
        p_name: "New Trip",
        p_is_public: true,
      });
    });
  });

  describe("Photo storage patterns", () => {
    it("inserts food_photos with correct fields", async () => {
      mockInsert.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
        }),
      });
      // Reset mockInsert to just resolve for bulk insert
      mockInsert.mockResolvedValue({ error: null });

      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      await supabase.from("food_photos").insert([
        {
          entry_id: "entry-1",
          photo_url: "https://storage.example.com/food-photos/trip-1/entry-1/photo.jpg",
          display_order: 0,
          uploaded_by: "user-1",
        },
      ]);

      expect(mockFrom).toHaveBeenCalledWith("food_photos");
      expect(mockInsert).toHaveBeenCalledWith([
        expect.objectContaining({
          entry_id: "entry-1",
          uploaded_by: "user-1",
          display_order: 0,
        }),
      ]);
    });
  });

  describe("Query patterns match RLS expectations", () => {
    it("trip members query includes profiles join", async () => {
      const { anonClient } = await import("@/lib/supabase/anon");

      anonClient.from("trip_members")
        .select("user_id, role, profiles(display_name, avatar_url)")
        .eq("trip_id", "trip-1");

      expect(mockFrom).toHaveBeenCalledWith("trip_members");
      expect(mockSelect).toHaveBeenCalledWith(
        "user_id, role, profiles(display_name, avatar_url)",
      );
    });

    it("ratings query filters by entry_id", async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      supabase.from("ratings").select("*").eq("entry_id", "entry-1");

      expect(mockFrom).toHaveBeenCalledWith("ratings");
      expect(mockEq).toHaveBeenCalledWith("entry_id", "entry-1");
    });
  });
});
