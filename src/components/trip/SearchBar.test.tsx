import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchBar } from "./SearchBar";

describe("SearchBar", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders search input with placeholder", () => {
    render(<SearchBar value="" onChange={jest.fn()} />);
    expect(screen.getByPlaceholderText("Search trips...")).toBeInTheDocument();
  });

  it("renders custom placeholder", () => {
    render(
      <SearchBar value="" onChange={jest.fn()} placeholder="Find food..." />,
    );
    expect(screen.getByPlaceholderText("Find food...")).toBeInTheDocument();
  });

  it("renders search icon", () => {
    render(<SearchBar value="" onChange={jest.fn()} />);
    expect(screen.getByText("search")).toBeInTheDocument();
  });

  it("displays the current value", () => {
    render(<SearchBar value="Tokyo" onChange={jest.fn()} />);
    expect(screen.getByDisplayValue("Tokyo")).toBeInTheDocument();
  });

  it("calls onChange with debounced input", async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<SearchBar value="" onChange={handleChange} />);

    const input = screen.getByPlaceholderText("Search trips...");
    await user.type(input, "Tok");

    // Should not have been called yet (debounce pending)
    expect(handleChange).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(handleChange).toHaveBeenCalledWith("Tok");
  });

  it("shows clear button when value is non-empty", () => {
    render(<SearchBar value="test" onChange={jest.fn()} />);
    expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();
  });

  it("hides clear button when value is empty", () => {
    render(<SearchBar value="" onChange={jest.fn()} />);
    expect(
      screen.queryByRole("button", { name: /clear/i }),
    ).not.toBeInTheDocument();
  });

  it("calls onChange with empty string when clear is clicked", async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<SearchBar value="test" onChange={handleChange} />);

    await user.click(screen.getByRole("button", { name: /clear/i }));

    expect(handleChange).toHaveBeenCalledWith("");
  });
});
