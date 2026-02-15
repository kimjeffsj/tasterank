import { render, screen, waitFor } from "@testing-library/react";
import { AiQuestionsBadge } from "./AiQuestionsBadge";

// Mock useAuth
let mockUser: { id: string } | null = { id: "user-1" };
jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: mockUser }),
}));

// Mock FollowUpQuestions
jest.mock("./FollowUpQuestions", () => ({
  FollowUpQuestions: ({
    onComplete,
    onSkip,
    isCreator,
    creatorName,
  }: {
    onComplete: () => void;
    onSkip: () => void;
    isCreator: boolean;
    creatorName?: string;
  }) => (
    <div data-testid="follow-up-questions">
      <button onClick={onComplete}>Complete</button>
      <button onClick={onSkip}>SkipQ</button>
      {isCreator && <span data-testid="is-creator">creator</span>}
      {creatorName && <span data-testid="creator-name">{creatorName}</span>}
    </div>
  ),
}));

// Mock Dialog
jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock Supabase
let mockSupabaseData: unknown[] | null = null;
jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => Promise.resolve({ data: mockSupabaseData }),
        }),
      }),
    }),
  }),
}));

const defaultProps = {
  entryId: "e1",
  entryTitle: "Ramen",
  createdBy: "creator-1",
  creatorName: "Alice",
  creatorAvatar: "https://example.com/avatar.png",
};

describe("AiQuestionsBadge", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = { id: "user-1" };
    mockSupabaseData = null;
  });

  it("renders nothing when user is not logged in", () => {
    mockUser = null;
    const { container } = render(<AiQuestionsBadge {...defaultProps} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when no questions exist", async () => {
    mockSupabaseData = [];
    const { container } = render(<AiQuestionsBadge {...defaultProps} />);
    await waitFor(() => {
      expect(container.querySelector("[aria-label]")).toBeNull();
    });
  });

  it("renders nothing when user has any response (1 of 2 answered)", async () => {
    mockSupabaseData = [
      { id: "q1", ai_responses: [{ id: "r1" }] },
      { id: "q2", ai_responses: [] },
    ];
    const { container } = render(<AiQuestionsBadge {...defaultProps} />);
    await waitFor(() => {
      expect(container.querySelector("[aria-label]")).toBeNull();
    });
  });

  it("shows badge when no questions are answered", async () => {
    mockSupabaseData = [
      { id: "q1", ai_responses: [] },
      { id: "q2", ai_responses: [] },
    ];
    render(<AiQuestionsBadge {...defaultProps} />);
    await waitFor(() => {
      expect(
        screen.getByLabelText("AI follow-up questions available"),
      ).toBeInTheDocument();
    });
  });

  it("opens dialog when badge is clicked", async () => {
    mockSupabaseData = [
      { id: "q1", ai_responses: [] },
    ];
    render(<AiQuestionsBadge {...defaultProps} />);

    await waitFor(() => {
      screen.getByLabelText("AI follow-up questions available").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("dialog")).toBeInTheDocument();
      expect(screen.getByTestId("follow-up-questions")).toBeInTheDocument();
    });
  });

  it("hides badge after completing questions", async () => {
    mockSupabaseData = [
      { id: "q1", ai_responses: [] },
    ];
    const { container } = render(<AiQuestionsBadge {...defaultProps} />);

    await waitFor(() => {
      screen.getByLabelText("AI follow-up questions available").click();
    });

    await waitFor(() => {
      screen.getByText("Complete").click();
    });

    await waitFor(() => {
      expect(container.querySelector("[aria-label]")).toBeNull();
    });
  });

  it("hides badge after skipping questions", async () => {
    mockSupabaseData = [
      { id: "q1", ai_responses: [] },
    ];
    const { container } = render(<AiQuestionsBadge {...defaultProps} />);

    await waitFor(() => {
      screen.getByLabelText("AI follow-up questions available").click();
    });

    await waitFor(() => {
      screen.getByText("SkipQ").click();
    });

    await waitFor(() => {
      expect(container.querySelector("[aria-label]")).toBeNull();
    });
  });

  it("passes isCreator=true when user is creator", async () => {
    mockUser = { id: "creator-1" };
    mockSupabaseData = [
      { id: "q1", ai_responses: [] },
    ];
    render(<AiQuestionsBadge {...defaultProps} />);

    await waitFor(() => {
      screen.getByLabelText("AI follow-up questions available").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("is-creator")).toBeInTheDocument();
    });
  });

  it("passes isCreator=false when user is not creator", async () => {
    mockUser = { id: "member-1" };
    mockSupabaseData = [
      { id: "q1", ai_responses: [] },
    ];
    render(<AiQuestionsBadge {...defaultProps} />);

    await waitFor(() => {
      screen.getByLabelText("AI follow-up questions available").click();
    });

    await waitFor(() => {
      expect(screen.queryByTestId("is-creator")).not.toBeInTheDocument();
      expect(screen.getByTestId("creator-name")).toHaveTextContent("Alice");
    });
  });
});
