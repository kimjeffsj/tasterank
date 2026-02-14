import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EntryForm, type EntryFormData } from "./EntryForm";

// Mock URL.createObjectURL for PhotoUploader previews
global.URL.createObjectURL = jest.fn(() => "blob:mock-url");
global.URL.revokeObjectURL = jest.fn();

// Mock shadcn Slider (uses Radix internals)
jest.mock("@/components/ui/slider", () => ({
  Slider: ({ value, onValueChange, ...props }: any) => (
    <input
      type="range"
      role="slider"
      value={value?.[0] ?? 7}
      onChange={(e: any) => onValueChange?.([parseFloat(e.target.value)])}
      aria-label="Taste score"
    />
  ),
}));

describe("EntryForm", () => {
  const mockOnSubmit = jest.fn<Promise<void>, [EntryFormData]>();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnSubmit.mockResolvedValue(undefined);
  });

  it("renders all form fields", () => {
    render(<EntryForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText("Food Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Restaurant")).toBeInTheDocument();
    expect(screen.getByLabelText("Location")).toBeInTheDocument();
    expect(screen.getByLabelText("Quick Review")).toBeInTheDocument();
    expect(screen.getByText("Taste Score")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /save/i }),
    ).toBeInTheDocument();
  });

  it("submits form data correctly", async () => {
    const user = userEvent.setup();
    render(<EntryForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText("Food Name"), "Spicy Miso Ramen");
    await user.type(screen.getByLabelText("Restaurant"), "Ichiran");
    await user.type(screen.getByLabelText("Location"), "Shibuya, Tokyo");
    await user.type(screen.getByLabelText("Quick Review"), "Best ramen ever!");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: "Spicy Miso Ramen",
        restaurant_name: "Ichiran",
        location_name: "Shibuya, Tokyo",
        description: "Best ramen ever!",
        photos: [],
        score: 7,
        tags: [],
      });
    });
  });

  it("disables submit when food name is empty", () => {
    render(<EntryForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole("button", { name: /save/i });
    expect(submitButton).toBeDisabled();
  });

  it("shows validation error when submitting whitespace-only name", async () => {
    const user = userEvent.setup();
    render(<EntryForm onSubmit={mockOnSubmit} />);

    // Type spaces (button becomes enabled due to non-empty string)
    await user.type(screen.getByLabelText("Food Name"), "   ");
    // Button should still be disabled since trim() is empty
    expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("submits with only required field (food name)", async () => {
    const user = userEvent.setup();
    render(<EntryForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText("Food Name"), "Takoyaki");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: "Takoyaki",
        restaurant_name: "",
        location_name: "",
        description: "",
        photos: [],
        score: 7,
        tags: [],
      });
    });
  });

  it("shows cancel button when onCancel is provided", () => {
    render(<EntryForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    expect(cancelButton).toBeInTheDocument();
  });

  it("calls onCancel when cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(<EntryForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it("pre-fills form when editing an existing entry", () => {
    const existingEntry = {
      id: "entry-1",
      title: "Tonkotsu Ramen",
      restaurant_name: "Ippudo",
      location_name: "Harajuku, Tokyo",
      description: "Rich and creamy",
      trip_id: "trip-1",
      created_by: "user-1",
      latitude: null,
      longitude: null,
      visited_at: null,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    };

    render(
      <EntryForm
        entry={existingEntry}
        onSubmit={mockOnSubmit}
        submitLabel="Update"
      />,
    );

    expect(screen.getByLabelText("Food Name")).toHaveValue("Tonkotsu Ramen");
    expect(screen.getByLabelText("Restaurant")).toHaveValue("Ippudo");
    expect(screen.getByLabelText("Location")).toHaveValue("Harajuku, Tokyo");
    expect(screen.getByLabelText("Quick Review")).toHaveValue(
      "Rich and creamy",
    );
    expect(
      screen.getByRole("button", { name: /update/i }),
    ).toBeInTheDocument();
  });

  it("shows error message on submission failure", async () => {
    mockOnSubmit.mockRejectedValue(new Error("Network error"));
    const user = userEvent.setup();
    render(<EntryForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText("Food Name"), "Test Food");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Network error");
    });
  });

  it("disables submit button while submitting", async () => {
    let resolveSubmit: () => void;
    mockOnSubmit.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve;
        }),
    );

    const user = userEvent.setup();
    render(<EntryForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText("Food Name"), "Test");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText("Saving...")).toBeInTheDocument();
    });

    resolveSubmit!();
  });

  it("trims whitespace from inputs", async () => {
    const user = userEvent.setup();
    render(<EntryForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText("Food Name"), "  Sushi  ");
    await user.type(screen.getByLabelText("Restaurant"), "  Tsukiji  ");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Sushi",
          restaurant_name: "Tsukiji",
        }),
      );
    });
  });
});
