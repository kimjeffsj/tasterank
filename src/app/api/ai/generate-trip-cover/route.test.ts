/**
 * @jest-environment node
 */
import { POST } from "./route";

// Mock Supabase route client
const mockGetUser = jest.fn();
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();
const mockUpdate = jest.fn();
const mockUpdateEq = jest.fn();

jest.mock("@/lib/supabase/route", () => ({
  createRouteClient: jest.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
      from: jest.fn(() => ({
        select: mockSelect,
        update: mockUpdate,
      })),
    }),
  ),
}));

// Mock AI client
const mockGenerateContent = jest.fn();
jest.mock("@/lib/ai/client", () => ({
  getModel: jest.fn(() => ({
    generateContent: mockGenerateContent,
  })),
}));

// Mock prompts
jest.mock("@/lib/ai/prompts", () => ({
  buildCoverImagePrompt: jest.fn(() => "mocked prompt"),
  parseCoverImageKeywords: jest.fn(() => "tokyo ramen"),
}));

// Mock Unsplash
jest.mock("@/lib/unsplash", () => ({
  searchPhotos: jest.fn(),
}));

// Mock next/server
let capturedAfterCallback: (() => Promise<void>) | null = null;
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data: unknown, init?: { status?: number }) => ({
      json: () => Promise.resolve(data),
      status: init?.status ?? 200,
    })),
  },
  after: jest.fn((callback: () => Promise<void>) => {
    capturedAfterCallback = callback;
  }),
}));

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/ai/generate-trip-cover", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/ai/generate-trip-cover", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedAfterCallback = null;

    // Default chain: from().select().eq().eq().single() → membership found
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ eq: mockEq, single: mockSingle });
    mockSingle.mockResolvedValue({ data: { id: "member-1" }, error: null });
    mockUpdate.mockReturnValue({ eq: mockUpdateEq });
    mockUpdateEq.mockResolvedValue({ error: null });
  });

  it("returns 401 when no user session", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const res = await POST(makeRequest({ tripId: "trip-123" }));
    expect(res.status).toBe(401);

    const json = await res.json();
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 400 when tripId is missing from body", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
    });

    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toBe("tripId is required");
  });

  it("returns 400 when body is invalid JSON", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
    });

    const req = new Request("http://localhost/api/ai/generate-trip-cover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toBe("tripId is required");
  });

  it("returns 202 Accepted when valid request is made", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
    });

    const res = await POST(makeRequest({ tripId: "trip-123" }));
    expect(res.status).toBe(202);

    const json = await res.json();
    expect(json.message).toBeDefined();
  });

  it("schedules after() callback for valid request", async () => {
    const { after } = jest.requireMock("next/server");
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
    });

    await POST(makeRequest({ tripId: "trip-123" }));

    expect(after).toHaveBeenCalledTimes(1);
    expect(capturedAfterCallback).not.toBeNull();
  });
});
