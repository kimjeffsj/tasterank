import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FollowUpQuestions } from "./FollowUpQuestions";

// Mock useAiQuestions hook
const mockFetchQuestions = jest.fn();
const mockSaveResponses = jest.fn();
const mockDismissQuestions = jest.fn();
let mockQuestions: unknown[] = [];
let mockLoading = false;

jest.mock("@/hooks/useAiQuestions", () => ({
  useAiQuestions: () => ({
    questions: mockQuestions,
    loading: mockLoading,
    error: null,
    fetchQuestions: mockFetchQuestions,
    saveResponses: mockSaveResponses,
    dismissQuestions: mockDismissQuestions,
  }),
}));

// Mock useAuth
jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "user-1" } }),
}));

// Mock RatingSlider
jest.mock("./RatingSlider", () => ({
  RatingSlider: ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
    <div data-testid="rating-slider">
      <span>Score: {value}</span>
      <button onClick={() => onChange(8)}>Set8</button>
    </div>
  ),
}));

// Mock Supabase client for rating save
const mockUpsert = jest.fn().mockReturnValue({ then: () => Promise.resolve() });
jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: () => ({
      upsert: mockUpsert,
    }),
  }),
}));

describe("FollowUpQuestions", () => {
  const creatorProps = {
    entryId: "entry-1",
    isCreator: true,
    onComplete: jest.fn(),
    onSkip: jest.fn(),
  };

  const memberProps = {
    entryId: "entry-1",
    isCreator: false,
    creatorName: "Alice",
    creatorAvatar: "https://example.com/avatar.png",
    onComplete: jest.fn(),
    onSkip: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockQuestions = [];
    mockLoading = false;
    mockSaveResponses.mockResolvedValue(undefined);
    mockDismissQuestions.mockResolvedValue(undefined);
  });

  it("calls fetchQuestions on mount with entryId", () => {
    render(<FollowUpQuestions {...creatorProps} />);
    expect(mockFetchQuestions).toHaveBeenCalledWith("entry-1");
  });

  it("shows loading state while fetching", () => {
    mockLoading = true;
    render(<FollowUpQuestions {...creatorProps} />);
    expect(screen.getByText("Loading questions...")).toBeInTheDocument();
  });

  it("renders nothing when no questions and is creator", () => {
    mockQuestions = [];
    mockLoading = false;
    const { container } = render(<FollowUpQuestions {...creatorProps} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders rating slider when no questions and is non-creator", () => {
    mockQuestions = [];
    mockLoading = false;
    render(<FollowUpQuestions {...memberProps} />);
    expect(screen.getByTestId("rating-slider")).toBeInTheDocument();
  });

  it("renders scale question with 1-5 buttons", () => {
    mockQuestions = [
      { id: "q1", question_text: "How spicy was it?", question_type: "scale", question_order: 1 },
    ];

    render(<FollowUpQuestions {...creatorProps} />);
    expect(screen.getByText("How spicy was it?")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders text question with textarea", () => {
    mockQuestions = [
      { id: "q2", question_text: "Any tips?", question_type: "text", question_order: 1 },
    ];

    render(<FollowUpQuestions {...creatorProps} />);
    expect(screen.getByText("Any tips?")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Type your answer...")).toBeInTheDocument();
  });

  it("renders choice question with pill buttons", () => {
    mockQuestions = [
      { id: "q3", question_text: "Would you revisit?", question_type: "choice", options: ["Definitely", "Maybe", "Unlikely"], question_order: 1 },
    ];

    render(<FollowUpQuestions {...creatorProps} />);
    expect(screen.getByText("Would you revisit?")).toBeInTheDocument();
    expect(screen.getByText("Definitely")).toBeInTheDocument();
    expect(screen.getByText("Maybe")).toBeInTheDocument();
    expect(screen.getByText("Unlikely")).toBeInTheDocument();
  });

  it("calls dismissQuestions and onSkip when Skip button clicked", async () => {
    mockQuestions = [
      { id: "q1", question_text: "How spicy?", question_type: "scale", question_order: 1 },
    ];

    render(<FollowUpQuestions {...creatorProps} />);
    fireEvent.click(screen.getByText("Skip"));

    await waitFor(() => {
      expect(mockDismissQuestions).toHaveBeenCalledWith("entry-1", "user-1");
      expect(creatorProps.onSkip).toHaveBeenCalled();
    });
  });

  it("saves responses and calls onComplete when Done clicked", async () => {
    mockQuestions = [
      { id: "q1", question_text: "How spicy?", question_type: "scale", question_order: 1 },
    ];

    render(<FollowUpQuestions {...creatorProps} />);

    // Select scale value
    fireEvent.click(screen.getByText("4"));

    // Click Done
    fireEvent.click(screen.getByText("Done"));

    await waitFor(() => {
      expect(mockSaveResponses).toHaveBeenCalledWith(
        "user-1",
        expect.any(Map),
      );
      expect(creatorProps.onComplete).toHaveBeenCalled();
    });
  });

  // Non-creator specific tests
  it("shows creator info header for non-creator", () => {
    mockQuestions = [
      { id: "q1", question_text: "How spicy?", question_type: "scale", question_order: 1 },
    ];

    render(<FollowUpQuestions {...memberProps} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText(/Added by/)).toBeInTheDocument();
    expect(screen.getByAltText("Alice")).toBeInTheDocument();
  });

  it("does not show creator info for creator", () => {
    mockQuestions = [
      { id: "q1", question_text: "How spicy?", question_type: "scale", question_order: 1 },
    ];

    render(<FollowUpQuestions {...creatorProps} />);
    expect(screen.queryByText(/Added by/)).not.toBeInTheDocument();
  });

  it("shows rating slider for non-creator", () => {
    mockQuestions = [
      { id: "q1", question_text: "How spicy?", question_type: "scale", question_order: 1 },
    ];

    render(<FollowUpQuestions {...memberProps} />);
    expect(screen.getByTestId("rating-slider")).toBeInTheDocument();
  });

  it("does not show rating slider for creator", () => {
    mockQuestions = [
      { id: "q1", question_text: "How spicy?", question_type: "scale", question_order: 1 },
    ];

    render(<FollowUpQuestions {...creatorProps} />);
    expect(screen.queryByTestId("rating-slider")).not.toBeInTheDocument();
  });

  it("saves rating for non-creator on Done", async () => {
    mockQuestions = [];
    mockLoading = false;

    render(<FollowUpQuestions {...memberProps} />);

    fireEvent.click(screen.getByText("Done"));

    await waitFor(() => {
      expect(mockUpsert).toHaveBeenCalledWith(
        { entry_id: "entry-1", user_id: "user-1", score: 5 },
        { onConflict: "entry_id,user_id" },
      );
      expect(memberProps.onComplete).toHaveBeenCalled();
    });
  });

  it("does not save rating for creator on Done", async () => {
    mockQuestions = [
      { id: "q1", question_text: "How spicy?", question_type: "scale", question_order: 1 },
    ];

    render(<FollowUpQuestions {...creatorProps} />);
    fireEvent.click(screen.getByText("4"));
    fireEvent.click(screen.getByText("Done"));

    await waitFor(() => {
      expect(mockUpsert).not.toHaveBeenCalled();
      expect(creatorProps.onComplete).toHaveBeenCalled();
    });
  });
});
