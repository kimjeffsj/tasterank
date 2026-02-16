import { render, screen } from "@testing-library/react";

// Mock next/navigation
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useParams: () => ({ tripId: "trip-123" }),
  useRouter: () => ({ push: mockPush }),
}));

// Mock useAuth
jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: null, loading: false, signInWithGoogle: jest.fn() }),
}));

// Mock useTournament
jest.mock("@/hooks/useTournament", () => ({
  useTournament: () => ({
    tournament: null,
    currentRound: 1,
    currentMatch: null,
    totalRounds: 0,
    totalMatchesInRound: 0,
    matchesCompletedInRound: 0,
    isUserComplete: false,
    loading: false,
    voting: false,
    error: null,
    entryMap: new Map(),
    createTournament: jest.fn(),
    vote: jest.fn(),
    voteBye: jest.fn(),
    getResults: jest.fn(),
    refetch: jest.fn(),
  }),
}));

// Mock LoginPrompt
jest.mock("@/components/auth/LoginPrompt", () => ({
  LoginPrompt: () => null,
}));

// Mock supabase client
jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: () => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
        count: jest.fn(),
      }),
    }),
  }),
}));

import TournamentPage from "./page";

describe("TournamentPage", () => {
  it("shows sign-in prompt when not authenticated", () => {
    render(<TournamentPage />);

    expect(screen.getByText("Sign in to participate in the tournament")).toBeInTheDocument();
    expect(screen.getByText("Sign In")).toBeInTheDocument();
  });

  it("renders food tournament header", () => {
    render(<TournamentPage />);

    expect(screen.getByText("Food Tournament")).toBeInTheDocument();
  });
});
