import { render, screen, fireEvent } from "@testing-library/react";
import { RatingSlider } from "./RatingSlider";

// Mock the shadcn Slider since it uses Radix internals
jest.mock("@/components/ui/slider", () => ({
  Slider: ({
    value,
    onValueChange,
    min,
    max,
    step,
    ...props
  }: {
    value: number[];
    onValueChange: (value: number[]) => void;
    min: number;
    max: number;
    step: number;
  }) => (
    <input
      type="range"
      role="slider"
      value={value[0]}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onValueChange([parseFloat(e.target.value)])}
      aria-label="Taste score"
      {...props}
    />
  ),
}));

describe("RatingSlider", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with default score", () => {
    render(<RatingSlider value={5} onChange={mockOnChange} />);

    expect(screen.getByText("5.0")).toBeInTheDocument();
    expect(screen.getByRole("slider")).toBeInTheDocument();
  });

  it("displays the current score prominently", () => {
    render(<RatingSlider value={8.5} onChange={mockOnChange} />);

    expect(screen.getByText("8.5")).toBeInTheDocument();
  });

  it("shows emoji labels", () => {
    render(<RatingSlider value={5} onChange={mockOnChange} />);

    expect(screen.getByText(/Meh/)).toBeInTheDocument();
    expect(screen.getByText(/Amazing/)).toBeInTheDocument();
  });

  it("calls onChange when slider value changes", () => {
    render(<RatingSlider value={5} onChange={mockOnChange} />);

    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "8" } });

    expect(mockOnChange).toHaveBeenCalledWith(8);
  });

  it("shows correct mood for low scores", () => {
    render(<RatingSlider value={2} onChange={mockOnChange} />);

    // Score text should be present
    expect(screen.getByText("2.0")).toBeInTheDocument();
  });

  it("shows correct mood for high scores", () => {
    render(<RatingSlider value={9.5} onChange={mockOnChange} />);

    expect(screen.getByText("9.5")).toBeInTheDocument();
  });
});
