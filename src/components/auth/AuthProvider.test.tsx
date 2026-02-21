import { render, screen, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthProvider";

const mockGetUser = jest.fn();
const mockOnAuthStateChange = jest.fn();
const mockSignInWithOAuth = jest.fn();
const mockSignOut = jest.fn();
const mockUnsubscribe = jest.fn();

jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
      onAuthStateChange: mockOnAuthStateChange,
      signInWithOAuth: mockSignInWithOAuth,
      signOut: mockSignOut,
    },
  }),
}));

const mockUser = { id: "user-1", email: "test@example.com" };

function TestConsumer() {
  const { user, loading } = useAuth();
  if (loading) return <div>loading</div>;
  return <div>{user ? `user:${user.email}` : "no-user"}</div>;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetUser.mockResolvedValue({ data: { user: null } });
  mockOnAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: mockUnsubscribe } },
  });
});

describe("AuthProvider", () => {
  it("provides loading=true initially then resolves to no user", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    expect(screen.getByText("loading")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("no-user")).toBeInTheDocument();
    });
  });

  it("provides user when getUser returns a user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser } });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("user:test@example.com")).toBeInTheDocument();
    });
  });

  it("does not multiply getUser calls with multiple consumers", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getAllByText("no-user")).toHaveLength(2);
    });

    // StrictMode double-invokes effects (2 calls), but NOT once per consumer (would be 4)
    expect(mockGetUser).toHaveBeenCalledTimes(2);
  });

  it("updates user on auth state change", async () => {
    let authChangeCallback: ((event: string, session: unknown) => void) | null =
      null;
    mockOnAuthStateChange.mockImplementation((cb) => {
      authChangeCallback = cb;
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("no-user")).toBeInTheDocument();
    });

    act(() => {
      authChangeCallback?.("SIGNED_IN", { user: mockUser });
    });

    await waitFor(() => {
      expect(screen.getByText("user:test@example.com")).toBeInTheDocument();
    });
  });

  it("unsubscribes on unmount", async () => {
    const { unmount } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("no-user")).toBeInTheDocument();
    });

    unmount();
    // StrictMode runs cleanup twice (once during its extra mount cycle, once on unmount)
    expect(mockUnsubscribe).toHaveBeenCalledTimes(2);
  });
});
