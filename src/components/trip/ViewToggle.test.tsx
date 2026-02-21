import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ViewToggle, type ViewMode } from "./ViewToggle";

describe("ViewToggle", () => {
  it("renders grid and list buttons", () => {
    render(<ViewToggle value="grid" onChange={jest.fn()} />);
    expect(
      screen.getByRole("button", { name: /grid view/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /list view/i }),
    ).toBeInTheDocument();
  });

  it("highlights the active view mode", () => {
    render(<ViewToggle value="list" onChange={jest.fn()} />);
    const listBtn = screen.getByRole("button", { name: /list view/i });
    expect(listBtn).toHaveClass("text-primary");
  });

  it("calls onChange when toggling view", async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();
    render(<ViewToggle value="grid" onChange={handleChange} />);

    await user.click(screen.getByRole("button", { name: /list view/i }));
    expect(handleChange).toHaveBeenCalledWith("list");
  });

  it("does not call onChange when active mode is clicked", async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();
    render(<ViewToggle value="grid" onChange={handleChange} />);

    await user.click(screen.getByRole("button", { name: /grid view/i }));
    expect(handleChange).not.toHaveBeenCalled();
  });
});
