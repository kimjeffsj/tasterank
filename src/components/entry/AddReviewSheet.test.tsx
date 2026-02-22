import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AddReviewSheet } from "./AddReviewSheet";

// Mock shadcn Sheet
jest.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="sheet">{children}</div> : null,
  SheetContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sheet-content">{children}</div>
  ),
  SheetHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SheetTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
}));

// Mock RatingSlider
jest.mock("./RatingSlider", () => ({
  RatingSlider: ({
    value,
    onChange,
  }: {
    value: number;
    onChange: (v: number) => void;
  }) => (
    <input
      type="range"
      role="slider"
      value={value}
      min={1}
      max={10}
      step={0.5}
      aria-label="Taste score"
      onChange={(e) => onChange(parseFloat(e.target.value))}
    />
  ),
}));

// Mock useRatings
const mockUpsertRating = jest.fn();
jest.mock("@/hooks/useRatings", () => ({
  useRatings: () => ({
    upsertRating: mockUpsertRating,
    loading: false,
    error: null,
  }),
}));

// Mock useAuth
const mockUser = { id: "user-1" };
jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: mockUser }),
}));

describe("AddReviewSheet", () => {
  const baseProps = {
    entryId: "entry-123",
    open: true,
    onOpenChange: jest.fn(),
    onReviewAdded: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUpsertRating.mockResolvedValue({});
  });

  it("renders the sheet when open is true", () => {
    render(<AddReviewSheet {...baseProps} />);
    expect(screen.getByTestId("sheet")).toBeInTheDocument();
  });

  it("does not render when open is false", () => {
    render(<AddReviewSheet {...baseProps} open={false} />);
    expect(screen.queryByTestId("sheet")).not.toBeInTheDocument();
  });

  it("renders title 'Add Review'", () => {
    render(<AddReviewSheet {...baseProps} />);
    expect(screen.getByText("Add Review")).toBeInTheDocument();
  });

  it("renders the rating slider", () => {
    render(<AddReviewSheet {...baseProps} />);
    expect(screen.getByRole("slider")).toBeInTheDocument();
  });

  it("renders comment textarea", () => {
    render(<AddReviewSheet {...baseProps} />);
    expect(screen.getByPlaceholderText(/comment/i)).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(<AddReviewSheet {...baseProps} />);
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  it("calls upsertRating on submit", async () => {
    render(<AddReviewSheet {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(mockUpsertRating).toHaveBeenCalledWith(
        expect.objectContaining({
          entry_id: "entry-123",
          user_id: "user-1",
          score: expect.any(Number),
        })
      );
    });
  });

  it("calls onReviewAdded after successful submission", async () => {
    const onReviewAdded = jest.fn();
    render(<AddReviewSheet {...baseProps} onReviewAdded={onReviewAdded} />);
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(onReviewAdded).toHaveBeenCalled();
    });
  });

  it("allows updating comment text", () => {
    render(<AddReviewSheet {...baseProps} />);
    const textarea = screen.getByPlaceholderText(/comment/i);
    fireEvent.change(textarea, { target: { value: "Very tasty!" } });
    expect(textarea).toHaveValue("Very tasty!");
  });
});
