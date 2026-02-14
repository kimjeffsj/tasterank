import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PhotoUploader } from "./PhotoUploader";

// Mock URL.createObjectURL
const mockCreateObjectURL = jest.fn(() => "blob:mock-url");
const mockRevokeObjectURL = jest.fn();
global.URL.createObjectURL = mockCreateObjectURL;
global.URL.revokeObjectURL = mockRevokeObjectURL;

describe("PhotoUploader", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders add photo button", () => {
    render(<PhotoUploader photos={[]} onChange={mockOnChange} />);

    expect(screen.getByLabelText("Add photo")).toBeInTheDocument();
  });

  it("accepts image files", () => {
    render(<PhotoUploader photos={[]} onChange={mockOnChange} />);

    const input = screen.getByTestId("photo-input");
    expect(input).toHaveAttribute("accept", "image/*");
  });

  it("calls onChange when files are selected", async () => {
    const user = userEvent.setup();
    render(<PhotoUploader photos={[]} onChange={mockOnChange} />);

    const file = new File(["photo"], "food.jpg", { type: "image/jpeg" });
    const input = screen.getByTestId("photo-input");
    await user.upload(input, file);

    expect(mockOnChange).toHaveBeenCalledWith([file]);
  });

  it("displays preview thumbnails for selected photos", () => {
    const files = [
      new File(["a"], "photo1.jpg", { type: "image/jpeg" }),
      new File(["b"], "photo2.jpg", { type: "image/jpeg" }),
    ];

    render(<PhotoUploader photos={files} onChange={mockOnChange} />);

    const previews = screen.getAllByRole("img");
    expect(previews).toHaveLength(2);
  });

  it("allows removing a photo", async () => {
    const user = userEvent.setup();
    const files = [
      new File(["a"], "photo1.jpg", { type: "image/jpeg" }),
      new File(["b"], "photo2.jpg", { type: "image/jpeg" }),
    ];

    render(<PhotoUploader photos={files} onChange={mockOnChange} />);

    const removeButtons = screen.getAllByLabelText("Remove photo");
    await user.click(removeButtons[0]);

    // Should call onChange with the remaining photo
    expect(mockOnChange).toHaveBeenCalledWith([files[1]]);
  });

  it("limits to maxPhotos", () => {
    const files = [
      new File(["a"], "p1.jpg", { type: "image/jpeg" }),
      new File(["b"], "p2.jpg", { type: "image/jpeg" }),
      new File(["c"], "p3.jpg", { type: "image/jpeg" }),
      new File(["d"], "p4.jpg", { type: "image/jpeg" }),
      new File(["e"], "p5.jpg", { type: "image/jpeg" }),
    ];

    render(
      <PhotoUploader photos={files} onChange={mockOnChange} maxPhotos={5} />,
    );

    // Add button should not be visible when at max
    expect(screen.queryByLabelText("Add photo")).not.toBeInTheDocument();
  });

  it("shows add button when under maxPhotos", () => {
    const files = [new File(["a"], "p1.jpg", { type: "image/jpeg" })];

    render(
      <PhotoUploader photos={files} onChange={mockOnChange} maxPhotos={5} />,
    );

    expect(screen.getByLabelText("Add photo")).toBeInTheDocument();
  });

  it("appends new photos to existing ones", async () => {
    const user = userEvent.setup();
    const existing = [new File(["a"], "p1.jpg", { type: "image/jpeg" })];

    render(<PhotoUploader photos={existing} onChange={mockOnChange} />);

    const newFile = new File(["b"], "p2.jpg", { type: "image/jpeg" });
    const input = screen.getByTestId("photo-input");
    await user.upload(input, newFile);

    expect(mockOnChange).toHaveBeenCalledWith([...existing, newFile]);
  });
});
