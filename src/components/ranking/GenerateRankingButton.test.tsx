import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { GenerateRankingButton } from "./GenerateRankingButton";

// Mock useAuth
const mockUser = { id: "u1" };
const mockUseAuth = jest.fn();
jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock useRouter
const mockRefresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

// Mock LoginPrompt
jest.mock("@/components/auth/LoginPrompt", () => ({
  LoginPrompt: ({ open }: { open: boolean }) =>
    open ? <div data-testid="login-prompt">Login</div> : null,
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("GenerateRankingButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: mockUser, loading: false });
  });

  it("renders Generate AI Ranking when no existing ranking", () => {
    render(
      <GenerateRankingButton tripId="t1" hasExistingRanking={false} />,
    );
    expect(screen.getByText("Generate AI Ranking")).toBeInTheDocument();
  });

  it("renders Regenerate AI Ranking when existing ranking", () => {
    render(
      <GenerateRankingButton tripId="t1" hasExistingRanking={true} />,
    );
    expect(screen.getByText("Regenerate AI Ranking")).toBeInTheDocument();
  });

  it("shows login prompt when not authenticated", () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });

    render(
      <GenerateRankingButton tripId="t1" hasExistingRanking={false} />,
    );

    fireEvent.click(screen.getByText("Generate AI Ranking"));
    expect(screen.getByTestId("login-prompt")).toBeInTheDocument();
  });

  it("calls API and refreshes on success", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ranking: [], saved: true }),
    });

    render(
      <GenerateRankingButton tripId="t1" hasExistingRanking={false} />,
    );

    fireEvent.click(screen.getByText("Generate AI Ranking"));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/ai/generate-ranking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId: "t1" }),
      });
    });

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("shows error on API failure", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Need at least 2 entries" }),
    });

    render(
      <GenerateRankingButton tripId="t1" hasExistingRanking={false} />,
    );

    fireEvent.click(screen.getByText("Generate AI Ranking"));

    await waitFor(() => {
      expect(screen.getByText("Need at least 2 entries")).toBeInTheDocument();
    });
  });

  it("returns null while auth is loading", () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });

    const { container } = render(
      <GenerateRankingButton tripId="t1" hasExistingRanking={false} />,
    );
    expect(container.innerHTML).toBe("");
  });
});
