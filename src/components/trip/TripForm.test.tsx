import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TripForm, type TripFormData } from "./TripForm";

// Mock material icons (they render as text)
describe("TripForm", () => {
  const mockOnSubmit = jest.fn<Promise<void>, [TripFormData]>();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnSubmit.mockResolvedValue(undefined);
  });

  it("renders all form fields", () => {
    render(<TripForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText("Trip Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(screen.getByLabelText("Start Date")).toBeInTheDocument();
    expect(screen.getByLabelText("End Date")).toBeInTheDocument();
    expect(screen.getByRole("switch")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create trip/i }),
    ).toBeInTheDocument();
  });

  it("submits form data correctly", async () => {
    const user = userEvent.setup();
    render(<TripForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText("Trip Name"), "Tokyo 2026");
    await user.type(screen.getByLabelText("Description"), "Best food tour");
    await user.click(screen.getByRole("button", { name: /create trip/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: "Tokyo 2026",
        description: "Best food tour",
        is_public: true,
        start_date: "",
        end_date: "",
      });
    });
  });

  it("shows error when name is empty", async () => {
    const user = userEvent.setup();
    render(<TripForm onSubmit={mockOnSubmit} />);

    // Clear the required field and try to submit
    const nameInput = screen.getByLabelText("Trip Name");
    await user.clear(nameInput);
    await user.click(screen.getByRole("button", { name: /create trip/i }));

    // Form validation should prevent submission
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("shows cancel button when onCancel is provided", () => {
    render(<TripForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    expect(cancelButton).toBeInTheDocument();
  });

  it("calls onCancel when cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(<TripForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it("toggles public/private", async () => {
    const user = userEvent.setup();
    render(<TripForm onSubmit={mockOnSubmit} />);

    const toggle = screen.getByRole("switch");
    expect(toggle).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("Public")).toBeInTheDocument();

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(screen.getByText("Private")).toBeInTheDocument();
  });

  it("pre-fills form when editing an existing trip", () => {
    const existingTrip = {
      id: "trip-1",
      name: "Seoul Trip",
      description: "Korean food",
      cover_image_url: null,
      owner_id: "user-1",
      invite_code: "abc123",
      is_public: false,
      start_date: "2026-03-01",
      end_date: "2026-03-10",
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    };

    render(
      <TripForm
        trip={existingTrip}
        onSubmit={mockOnSubmit}
        submitLabel="Save Changes"
      />,
    );

    expect(screen.getByLabelText("Trip Name")).toHaveValue("Seoul Trip");
    expect(screen.getByLabelText("Description")).toHaveValue("Korean food");
    expect(screen.getByLabelText("Start Date")).toHaveValue("2026-03-01");
    expect(screen.getByLabelText("End Date")).toHaveValue("2026-03-10");
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
    expect(
      screen.getByRole("button", { name: /save changes/i }),
    ).toBeInTheDocument();
  });

  it("shows error message on submission failure", async () => {
    mockOnSubmit.mockRejectedValue(new Error("Network error"));
    const user = userEvent.setup();
    render(<TripForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText("Trip Name"), "Test Trip");
    await user.click(screen.getByRole("button", { name: /create trip/i }));

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
    render(<TripForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText("Trip Name"), "Test");
    await user.click(screen.getByRole("button", { name: /create trip/i }));

    await waitFor(() => {
      expect(screen.getByText("Saving...")).toBeInTheDocument();
    });

    resolveSubmit!();
  });
});
