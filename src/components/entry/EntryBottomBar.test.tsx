import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EntryBottomBar } from "./EntryBottomBar";

// Mock AddReviewSheet
jest.mock("./AddReviewSheet", () => ({
  AddReviewSheet: ({
    open,
    onOpenChange,
  }: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
  }) =>
    open ? (
      <div data-testid="add-review-sheet">
        <button onClick={() => onOpenChange(false)}>Close</button>
      </div>
    ) : null,
}));

// Mock LoginPrompt
jest.mock("@/components/auth/LoginPrompt", () => ({
  LoginPrompt: ({
    open,
    onOpenChange,
  }: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
  }) =>
    open ? (
      <div data-testid="login-prompt">
        <button onClick={() => onOpenChange(false)}>Close Login</button>
      </div>
    ) : null,
}));

// Mock useAuth
let mockUser: { id: string } | null = null;
jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: mockUser }),
}));

// Mock navigator.share and clipboard
const originalNavigator = global.navigator;

describe("EntryBottomBar", () => {
  const baseProps = {
    entryId: "entry-123",
    entryTitle: "Tonkotsu Ramen",
    onReviewAdded: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = null;
  });

  it("renders Add Review button", () => {
    render(<EntryBottomBar {...baseProps} />);
    expect(
      screen.getByRole("button", { name: /add review/i })
    ).toBeInTheDocument();
  });

  it("renders Share button", () => {
    render(<EntryBottomBar {...baseProps} />);
    expect(screen.getByRole("button", { name: /share/i })).toBeInTheDocument();
  });

  it("shows LoginPrompt when unauthenticated user clicks Add Review", async () => {
    mockUser = null;
    render(<EntryBottomBar {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: /add review/i }));

    await waitFor(() => {
      expect(screen.getByTestId("login-prompt")).toBeInTheDocument();
    });
  });

  it("shows AddReviewSheet when authenticated user clicks Add Review", async () => {
    mockUser = { id: "user-1" };
    render(<EntryBottomBar {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: /add review/i }));

    await waitFor(() => {
      expect(screen.getByTestId("add-review-sheet")).toBeInTheDocument();
    });
  });

  it("does not show LoginPrompt when authenticated", async () => {
    mockUser = { id: "user-1" };
    render(<EntryBottomBar {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: /add review/i }));

    await waitFor(() => {
      expect(screen.queryByTestId("login-prompt")).not.toBeInTheDocument();
    });
  });

  it("calls Web Share API when available", async () => {
    const mockShare = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(global.navigator, "share", {
      value: mockShare,
      writable: true,
      configurable: true,
    });

    render(<EntryBottomBar {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: /share/i }));

    await waitFor(() => {
      expect(mockShare).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Tonkotsu Ramen",
        })
      );
    });

    // Restore
    Object.defineProperty(global.navigator, "share", {
      value: undefined,
      writable: true,
      configurable: true,
    });
  });

  it("falls back to clipboard when Web Share API is unavailable", async () => {
    Object.defineProperty(global.navigator, "share", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const mockWriteText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(global.navigator, "clipboard", {
      value: { writeText: mockWriteText },
      writable: true,
      configurable: true,
    });

    render(<EntryBottomBar {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: /share/i }));

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalled();
    });
  });
});
