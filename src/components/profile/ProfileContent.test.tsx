import { render, screen, waitFor } from "@testing-library/react";
import { ProfileContent } from "./ProfileContent";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { createClient } from "@/lib/supabase/client";

// Mock hooks
jest.mock("@/hooks/useAuth");
jest.mock("@/hooks/useProfile");
jest.mock("@/lib/supabase/client");
jest.mock("@/components/layout/ThemeToggle", () => ({
  ThemeToggle: () => <div>ThemeToggle</div>,
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseProfile = useProfile as jest.MockedFunction<typeof useProfile>;
const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;

describe("ProfileContent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateClient.mockReturnValue({
      auth: {
        signOut: jest.fn(),
      },
    } as any);
  });

  it("shows loading skeleton when loading", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "user-123" } as any,
      loading: true,
      signInWithGoogle: jest.fn(),
      signOut: jest.fn(),
    });

    mockUseProfile.mockReturnValue({
      profile: null,
      stats: null,
      loading: true,
      error: null,
      refetch: jest.fn(),
    });

    render(<ProfileContent />);

    // Check for skeleton placeholders
    expect(screen.getByText("Profile")).toBeInTheDocument();
  });

  it("shows login prompt when not authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signInWithGoogle: jest.fn(),
      signOut: jest.fn(),
    });

    mockUseProfile.mockReturnValue({
      profile: null,
      stats: null,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<ProfileContent />);

    expect(
      screen.getByText("Sign in to see your profile")
    ).toBeInTheDocument();
    expect(screen.getByText("Sign in with Google")).toBeInTheDocument();
  });

  it("renders profile with user info when authenticated", async () => {
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
    };

    const mockProfile = {
      id: "user-123",
      username: "testuser",
      display_name: "Test User",
      avatar_url: "https://example.com/avatar.jpg",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: null,
    };

    const mockStats = {
      tripCount: 5,
      entryCount: 12,
      ratingCount: 30,
    };

    mockUseAuth.mockReturnValue({
      user: mockUser as any,
      loading: false,
      signInWithGoogle: jest.fn(),
      signOut: jest.fn(),
    });

    mockUseProfile.mockReturnValue({
      profile: mockProfile,
      stats: mockStats,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<ProfileContent />);

    await waitFor(() => {
      expect(screen.getByText("Test User")).toBeInTheDocument();
    });

    expect(screen.getByText("@testuser")).toBeInTheDocument();
    expect(screen.getByText(/Member since (December 2023|January 2024)/)).toBeInTheDocument();

    // Stats
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Trips")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("Entries")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
    expect(screen.getByText("Ratings")).toBeInTheDocument();

    // Settings
    expect(screen.getByText("Appearance")).toBeInTheDocument();
    expect(screen.getByText("ThemeToggle")).toBeInTheDocument();
    expect(screen.getByText("Log Out")).toBeInTheDocument();
  });

  it("falls back to email when display_name is null", async () => {
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
    };

    const mockProfile = {
      id: "user-123",
      username: "testuser",
      display_name: null,
      avatar_url: "https://example.com/avatar.jpg",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: null,
    };

    const mockStats = {
      tripCount: 0,
      entryCount: 0,
      ratingCount: 0,
    };

    mockUseAuth.mockReturnValue({
      user: mockUser as any,
      loading: false,
      signInWithGoogle: jest.fn(),
      signOut: jest.fn(),
    });

    mockUseProfile.mockReturnValue({
      profile: mockProfile,
      stats: mockStats,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<ProfileContent />);

    await waitFor(() => {
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });
  });

  it("shows fallback avatar when avatar_url is null", async () => {
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
    };

    const mockProfile = {
      id: "user-123",
      username: "testuser",
      display_name: "Test User",
      avatar_url: null,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: null,
    };

    const mockStats = {
      tripCount: 0,
      entryCount: 0,
      ratingCount: 0,
    };

    mockUseAuth.mockReturnValue({
      user: mockUser as any,
      loading: false,
      signInWithGoogle: jest.fn(),
      signOut: jest.fn(),
    });

    mockUseProfile.mockReturnValue({
      profile: mockProfile,
      stats: mockStats,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<ProfileContent />);

    await waitFor(() => {
      expect(screen.getByText("Test User")).toBeInTheDocument();
    });

    // Check for fallback avatar icon
    const fallbackIcon = screen.getByText("person");
    expect(fallbackIcon).toHaveClass("material-icons-round");
  });

  it("calls signOut when logout button is clicked", async () => {
    const mockSignOut = jest.fn();
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
    };

    const mockProfile = {
      id: "user-123",
      username: "testuser",
      display_name: "Test User",
      avatar_url: "https://example.com/avatar.jpg",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: null,
    };

    const mockStats = {
      tripCount: 5,
      entryCount: 12,
      ratingCount: 30,
    };

    mockUseAuth.mockReturnValue({
      user: mockUser as any,
      loading: false,
      signInWithGoogle: jest.fn(),
      signOut: mockSignOut,
    });

    mockUseProfile.mockReturnValue({
      profile: mockProfile,
      stats: mockStats,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<ProfileContent />);

    await waitFor(() => {
      expect(screen.getByText("Test User")).toBeInTheDocument();
    });

    const logoutButton = screen.getByText("Log Out");
    logoutButton.click();

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it("shows zero stats when no activity", async () => {
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
    };

    const mockProfile = {
      id: "user-123",
      username: "testuser",
      display_name: "Test User",
      avatar_url: "https://example.com/avatar.jpg",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: null,
    };

    const mockStats = {
      tripCount: 0,
      entryCount: 0,
      ratingCount: 0,
    };

    mockUseAuth.mockReturnValue({
      user: mockUser as any,
      loading: false,
      signInWithGoogle: jest.fn(),
      signOut: jest.fn(),
    });

    mockUseProfile.mockReturnValue({
      profile: mockProfile,
      stats: mockStats,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<ProfileContent />);

    await waitFor(() => {
      expect(screen.getByText("Test User")).toBeInTheDocument();
    });

    // Check all stats are 0
    const zeroValues = screen.getAllByText("0");
    expect(zeroValues.length).toBe(3);
  });
});
