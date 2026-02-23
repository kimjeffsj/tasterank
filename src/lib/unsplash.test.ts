import { searchPhotos } from "./unsplash";

const MOCK_PHOTO_RESULT = {
  urls: { regular: "https://images.unsplash.com/photo-123" },
  alt_description: "Jeju island food table",
  user: { name: "Jane Doe" },
};

describe("searchPhotos", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    process.env.UNSPLASH_ACCESS_KEY = "test-access-key";
  });

  afterEach(() => {
    delete process.env.UNSPLASH_ACCESS_KEY;
  });

  it("returns the first photo on successful response", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: [MOCK_PHOTO_RESULT] }),
    } as unknown as Response);

    const result = await searchPhotos("jeju island food");
    expect(result).toEqual({
      url: "https://images.unsplash.com/photo-123",
      alt: "Jeju island food table",
      photographer: "Jane Doe",
    });
  });

  it("returns null when results array is empty", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: [] }),
    } as unknown as Response);

    const result = await searchPhotos("no results query");
    expect(result).toBeNull();
  });

  it("returns null on HTTP error response", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({}),
    } as unknown as Response);

    const result = await searchPhotos("some query");
    expect(result).toBeNull();
  });

  it("returns null when fetch throws", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

    const result = await searchPhotos("some query");
    expect(result).toBeNull();
  });

  it("sets Authorization header to Client-ID format", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: [MOCK_PHOTO_RESULT] }),
    } as unknown as Response);

    await searchPhotos("test query");

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("https://api.unsplash.com/search/photos"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Client-ID test-access-key",
        }),
      }),
    );
  });

  it("includes query, orientation, and per_page in the request URL", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: [MOCK_PHOTO_RESULT] }),
    } as unknown as Response);

    await searchPhotos("tokyo ramen");

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain("query=tokyo+ramen");
    expect(calledUrl).toContain("orientation=landscape");
    expect(calledUrl).toContain("per_page=1");
  });
});
