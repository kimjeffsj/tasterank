import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FollowUpQuestions } from "./FollowUpQuestions";

// Mock useAiQuestions hook
const mockGenerateQuestions = jest.fn();
const mockSaveResponses = jest.fn();
let mockQuestions: unknown[] = [];
let mockLoading = false;

jest.mock("@/hooks/useAiQuestions", () => ({
  useAiQuestions: () => ({
    questions: mockQuestions,
    loading: mockLoading,
    error: null,
    generateQuestions: mockGenerateQuestions,
    saveResponses: mockSaveResponses,
  }),
}));

// Mock useAuth
jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "user-1" } }),
}));

describe("FollowUpQuestions", () => {
  const defaultProps = {
    entryId: "entry-1",
    title: "Tonkotsu Ramen",
    onComplete: jest.fn(),
    onSkip: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockQuestions = [];
    mockLoading = false;
    mockSaveResponses.mockResolvedValue(undefined);
  });

  it("calls generateQuestions on mount", () => {
    render(<FollowUpQuestions {...defaultProps} />);
    expect(mockGenerateQuestions).toHaveBeenCalledWith(
      expect.objectContaining({
        entryId: "entry-1",
        title: "Tonkotsu Ramen",
      }),
    );
  });

  it("shows loading skeleton while generating", () => {
    mockLoading = true;
    render(<FollowUpQuestions {...defaultProps} />);
    expect(screen.getByText("Generating questions...")).toBeInTheDocument();
  });

  it("auto-skips when no questions generated", async () => {
    mockQuestions = [];
    mockLoading = false;
    mockGenerateQuestions.mockImplementation(() => {
      // questions stay empty
    });

    render(<FollowUpQuestions {...defaultProps} />);

    await waitFor(() => {
      expect(defaultProps.onSkip).toHaveBeenCalled();
    });
  });

  it("renders scale question with 1-5 buttons", () => {
    mockQuestions = [
      { id: "q1", question_text: "How spicy was it?", question_type: "scale", question_order: 1 },
    ];

    render(<FollowUpQuestions {...defaultProps} />);
    expect(screen.getByText("How spicy was it?")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders text question with textarea", () => {
    mockQuestions = [
      { id: "q2", question_text: "Any tips?", question_type: "text", question_order: 1 },
    ];

    render(<FollowUpQuestions {...defaultProps} />);
    expect(screen.getByText("Any tips?")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Type your answer...")).toBeInTheDocument();
  });

  it("renders choice question with pill buttons", () => {
    mockQuestions = [
      { id: "q3", question_text: "Would you revisit?", question_type: "choice", options: ["Definitely", "Maybe", "Unlikely"], question_order: 1 },
    ];

    render(<FollowUpQuestions {...defaultProps} />);
    expect(screen.getByText("Would you revisit?")).toBeInTheDocument();
    expect(screen.getByText("Definitely")).toBeInTheDocument();
    expect(screen.getByText("Maybe")).toBeInTheDocument();
    expect(screen.getByText("Unlikely")).toBeInTheDocument();
  });

  it("calls onSkip when Skip button clicked", () => {
    mockQuestions = [
      { id: "q1", question_text: "How spicy?", question_type: "scale", question_order: 1 },
    ];

    render(<FollowUpQuestions {...defaultProps} />);
    fireEvent.click(screen.getByText("Skip"));
    expect(defaultProps.onSkip).toHaveBeenCalled();
  });

  it("saves responses and calls onComplete when Done clicked", async () => {
    mockQuestions = [
      { id: "q1", question_text: "How spicy?", question_type: "scale", question_order: 1 },
    ];

    render(<FollowUpQuestions {...defaultProps} />);

    // Select scale value
    fireEvent.click(screen.getByText("4"));

    // Click Done
    fireEvent.click(screen.getByText("Done"));

    await waitFor(() => {
      expect(mockSaveResponses).toHaveBeenCalledWith(
        "user-1",
        expect.any(Map),
      );
      expect(defaultProps.onComplete).toHaveBeenCalled();
    });
  });

  it("passes optional props to generateQuestions", () => {
    render(
      <FollowUpQuestions
        {...defaultProps}
        restaurantName="Ichiran"
        tags={["japanese"]}
        score={8}
        description="Rich broth"
      />,
    );

    expect(mockGenerateQuestions).toHaveBeenCalledWith({
      entryId: "entry-1",
      title: "Tonkotsu Ramen",
      restaurantName: "Ichiran",
      tags: ["japanese"],
      score: 8,
      description: "Rich broth",
    });
  });
});
