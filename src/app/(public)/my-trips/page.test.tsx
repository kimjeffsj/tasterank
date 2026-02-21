import { render, screen, act } from "@testing-library/react";
import MyTripsPage from "./page";

// Mock useAuth
const mockUseAuth = jest.fn();
jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock useTrips
const mockUseTrips = jest.fn();
jest.mock("@/hooks/useTrips", () => ({
  useTrips: (opts: any) => mockUseTrips(opts),
}));

// Mock LoginPrompt
jest.mock("@/components/auth/LoginPrompt", () => ({
  LoginPrompt: ({ open }: { open: boolean }) =>
    open ? <div data-testid="login-prompt">Login</div> : null,
}));

// Mock TripListContainer
jest.mock("@/components/trip/TripListContainer", () => ({
  TripListContainer: ({ trips, loading }: any) => (
    <div data-testid="trip-list-container">
      {loading && <div>Loading...</div>}
      {trips.map((t: any) => (
        <div key={t.id}>{t.name}</div>
      ))}
    </div>
  ),
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/my-trips",
}));

describe("MyTripsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading spinner when auth is loading", () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });
    mockUseTrips.mockReturnValue({ trips: [], loading: true, error: null });

    render(<MyTripsPage />);
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("shows sign-in prompt when not logged in", () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    mockUseTrips.mockReturnValue({ trips: [], loading: false, error: null });

    render(<MyTripsPage />);
    expect(screen.getByText("My Trips")).toBeInTheDocument();
    expect(screen.getByText(/sign in to see your trips/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("shows TripListContainer when logged in", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "user-1", email: "test@test.com" },
      loading: false,
    });
    mockUseTrips.mockReturnValue({
      trips: [
        { id: "t1", name: "Tokyo Trip", is_public: true },
        { id: "t2", name: "Osaka Trip", is_public: false },
      ],
      loading: false,
      error: null,
    });

    render(<MyTripsPage />);
    expect(screen.getByTestId("trip-list-container")).toBeInTheDocument();
    expect(screen.getByText("Tokyo Trip")).toBeInTheDocument();
    expect(screen.getByText("Osaka Trip")).toBeInTheDocument();
  });

  it("passes myTripsOnly option to useTrips", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "user-1", email: "test@test.com" },
      loading: false,
    });
    mockUseTrips.mockReturnValue({
      trips: [],
      loading: false,
      error: null,
    });

    render(<MyTripsPage />);
    expect(mockUseTrips).toHaveBeenCalledWith({ myTripsOnly: true });
  });

  it("renders page header", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "user-1", email: "test@test.com" },
      loading: false,
    });
    mockUseTrips.mockReturnValue({ trips: [], loading: false, error: null });

    render(<MyTripsPage />);
    expect(screen.getByText("My Trips")).toBeInTheDocument();
  });

  it("shows error state when useTrips returns error", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "user-1", email: "test@test.com" },
      loading: false,
    });
    mockUseTrips.mockReturnValue({
      trips: [],
      loading: false,
      error: "Failed to fetch trips",
    });

    render(<MyTripsPage />);
    expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument();
  });
});
