import { renderHook, waitFor, act } from "@testing-library/react";
import { useTags } from "./useTags";

// Mock Supabase client
const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockDelete = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();
const mockOrder = jest.fn();

const mockFrom = jest.fn(() => ({
  select: mockSelect,
  insert: mockInsert,
  delete: mockDelete,
}));

jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: mockFrom,
  }),
}));

const ENTRY_ID = "entry-123";

describe("useTags", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default chain: from("food_entry_tags").select("..., tags(...)").eq("entry_id", ...) → data
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockResolvedValue({ data: [], error: null });
  });

  it("fetches tags for an entry on mount", async () => {
    const mockEntryTags = [
      {
        id: "fet-1",
        entry_id: ENTRY_ID,
        tag_id: "tag-1",
        is_ai_suggested: false,
        tags: { id: "tag-1", name: "Spicy", category: "flavor" },
      },
      {
        id: "fet-2",
        entry_id: ENTRY_ID,
        tag_id: "tag-2",
        is_ai_suggested: true,
        tags: { id: "tag-2", name: "Korean", category: "cuisine" },
      },
    ];
    mockEq.mockResolvedValue({ data: mockEntryTags, error: null });

    const { result } = renderHook(() => useTags(ENTRY_ID));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.entryTags).toEqual(mockEntryTags);
    expect(result.current.error).toBeNull();
    expect(mockFrom).toHaveBeenCalledWith("food_entry_tags");
    expect(mockSelect).toHaveBeenCalledWith("*, tags(*)");
    expect(mockEq).toHaveBeenCalledWith("entry_id", ENTRY_ID);
  });

  it("does not fetch when entryId is empty", async () => {
    const { result } = renderHook(() => useTags(""));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.entryTags).toEqual([]);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("handles fetch error", async () => {
    mockEq.mockImplementation(async () => {
      throw new Error("Network error");
    });

    const { result } = renderHook(() => useTags(ENTRY_ID));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Network error");
    expect(result.current.entryTags).toEqual([]);
  });

  it("fetches all available tags", async () => {
    const allTags = [
      { id: "tag-1", name: "Spicy", category: "flavor" },
      { id: "tag-2", name: "Korean", category: "cuisine" },
    ];

    // First call is for entry tags (on mount)
    // fetchAllTags uses from("tags").select("*").order(...)
    mockFrom.mockImplementation((table: string) => {
      if (table === "tags") {
        return {
          select: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: allTags, error: null }),
          }),
        };
      }
      return { select: mockSelect, insert: mockInsert, delete: mockDelete };
    });

    const { result } = renderHook(() => useTags(ENTRY_ID));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let tags: unknown;
    await act(async () => {
      tags = await result.current.fetchAllTags();
    });

    expect(tags).toEqual(allTags);
  });

  it("adds a tag to an entry (upserts tag then links)", async () => {
    // Mock tag upsert: from("tags").insert().select().single()
    const newTag = { id: "tag-new", name: "Sweet", category: "flavor" };
    const newLink = {
      id: "fet-new",
      entry_id: ENTRY_ID,
      tag_id: "tag-new",
      is_ai_suggested: false,
    };

    mockFrom.mockImplementation((table: string) => {
      if (table === "tags") {
        return {
          upsert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: newTag, error: null }),
            }),
          }),
        };
      }
      if (table === "food_entry_tags") {
        return {
          select: mockSelect,
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest
                .fn()
                .mockResolvedValue({ data: newLink, error: null }),
            }),
          }),
          delete: mockDelete,
        };
      }
      return { select: mockSelect, insert: mockInsert, delete: mockDelete };
    });

    const { result } = renderHook(() => useTags(ENTRY_ID));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let link: unknown;
    await act(async () => {
      link = await result.current.addTagToEntry(
        ENTRY_ID,
        "Sweet",
        "flavor",
        false,
      );
    });

    expect(link).toEqual(newLink);
  });

  it("removes a tag from an entry", async () => {
    const mockDeleteEq = jest.fn().mockResolvedValue({ error: null });
    mockFrom.mockImplementation((table: string) => {
      if (table === "food_entry_tags") {
        return {
          select: mockSelect,
          insert: mockInsert,
          delete: jest.fn().mockReturnValue({ eq: mockDeleteEq }),
        };
      }
      return { select: mockSelect, insert: mockInsert, delete: mockDelete };
    });

    const { result } = renderHook(() => useTags(ENTRY_ID));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.removeTagFromEntry("fet-1");
    });

    expect(mockDeleteEq).toHaveBeenCalledWith("id", "fet-1");
  });

  it("throws on add tag error", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "tags") {
        return {
          upsert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: "Upsert failed" },
              }),
            }),
          }),
        };
      }
      return { select: mockSelect, insert: mockInsert, delete: mockDelete };
    });

    const { result } = renderHook(() => useTags(ENTRY_ID));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await expect(
      act(async () => {
        await result.current.addTagToEntry(ENTRY_ID, "Bad", "general", false);
      }),
    ).rejects.toEqual({ message: "Upsert failed" });
  });
});
