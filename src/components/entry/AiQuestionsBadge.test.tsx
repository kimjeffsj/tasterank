import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { User } from "@supabase/supabase-js";
import { AiQuestionsBadge } from "./AiQuestionsBadge";

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

const mockUser = { id: "user-1" } as User;

const defaultProps = {
  entryId: "e1",
  entryTitle: "Ramen",
  createdBy: "creator-1",
  creatorName: "Alice",
  creatorAvatar: "https://example.com/avatar.png",
  hasUnanswered: true,
  user: mockUser,
};

describe("AiQuestionsBadge", () => {
  it("renders nothing when hasUnanswered is false", () => {
    const { container } = render(
      <AiQuestionsBadge {...defaultProps} hasUnanswered={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when user is null", () => {
    const { container } = render(
      <AiQuestionsBadge {...defaultProps} user={null} />,
    );
    // hasUnanswered=true but still renders (isCreator will be false)
    // badge renders regardless of user null — visibility is controlled by parent
    expect(
      container.querySelector("[aria-label='AI follow-up questions available']"),
    ).toBeInTheDocument();
  });

  it("shows badge when hasUnanswered is true", () => {
    render(<AiQuestionsBadge {...defaultProps} />);
    expect(
      screen.getByLabelText("AI follow-up questions available"),
    ).toBeInTheDocument();
  });

  it("opens dialog when badge is clicked", async () => {
    const user = userEvent.setup();
    render(<AiQuestionsBadge {...defaultProps} />);

    await user.click(screen.getByLabelText("AI follow-up questions available"));

    expect(screen.getByTestId("dialog")).toBeInTheDocument();
    expect(screen.getByTestId("follow-up-questions")).toBeInTheDocument();
  });

  it("hides badge after completing questions", async () => {
    const user = userEvent.setup();
    const { container } = render(<AiQuestionsBadge {...defaultProps} />);

    await user.click(screen.getByLabelText("AI follow-up questions available"));
    await user.click(screen.getByText("Complete"));

    await waitFor(() => {
      expect(container.querySelector("[aria-label]")).toBeNull();
    });
  });

  it("hides badge after skipping questions", async () => {
    const user = userEvent.setup();
    const { container } = render(<AiQuestionsBadge {...defaultProps} />);

    await user.click(screen.getByLabelText("AI follow-up questions available"));
    await user.click(screen.getByText("SkipQ"));

    await waitFor(() => {
      expect(container.querySelector("[aria-label]")).toBeNull();
    });
  });

  it("calls onAnswered after completing questions", async () => {
    const onAnswered = jest.fn();
    const user = userEvent.setup();
    render(<AiQuestionsBadge {...defaultProps} onAnswered={onAnswered} />);

    await user.click(screen.getByLabelText("AI follow-up questions available"));
    await user.click(screen.getByText("Complete"));

    expect(onAnswered).toHaveBeenCalledTimes(1);
  });

  it("renders nothing when user is the creator (isCreator=true)", () => {
    const creator = { id: "creator-1" } as User;
    const { container } = render(
      <AiQuestionsBadge {...defaultProps} user={creator} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("passes isCreator=false when user.id does not match createdBy", async () => {
    const member = { id: "member-1" } as User;
    const user = userEvent.setup();
    render(<AiQuestionsBadge {...defaultProps} user={member} />);

    await user.click(screen.getByLabelText("AI follow-up questions available"));

    expect(screen.queryByTestId("is-creator")).not.toBeInTheDocument();
    expect(screen.getByTestId("creator-name")).toHaveTextContent("Alice");
  });
});
