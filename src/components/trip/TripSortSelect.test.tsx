import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TripSortSelect, type TripSort } from "./TripSortSelect";

describe("TripSortSelect", () => {
  it("renders sort button with current label", () => {
    render(<TripSortSelect value="latest" onChange={jest.fn()} />);
    expect(screen.getByRole("button", { name: /sort/i })).toBeInTheDocument();
    expect(screen.getByText(/latest/i)).toBeInTheDocument();
  });

  it("shows sort options when clicked", async () => {
    const user = userEvent.setup();
    render(<TripSortSelect value="latest" onChange={jest.fn()} />);

    await user.click(screen.getByRole("button", { name: /sort/i }));

    // "Latest" appears twice (button label + dropdown), others appear once
    expect(screen.getAllByText("Latest")).toHaveLength(2);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Start Date")).toBeInTheDocument();
  });

  it("calls onChange when an option is selected", async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();
    render(<TripSortSelect value="latest" onChange={handleChange} />);

    await user.click(screen.getByRole("button", { name: /sort/i }));
    await user.click(screen.getByText("Name"));

    expect(handleChange).toHaveBeenCalledWith("name");
  });

  it("closes dropdown after selection", async () => {
    const user = userEvent.setup();
    render(<TripSortSelect value="latest" onChange={jest.fn()} />);

    await user.click(screen.getByRole("button", { name: /sort/i }));
    await user.click(screen.getByText("Name"));

    // Dropdown should close — only the button's text should remain
    expect(screen.queryByText("Start Date")).not.toBeInTheDocument();
  });
});
