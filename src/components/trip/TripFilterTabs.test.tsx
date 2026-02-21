import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TripFilterTabs, type TripFilter } from "./TripFilterTabs";

describe("TripFilterTabs", () => {
  const filters: TripFilter[] = ["all", "public", "private"];

  it("renders all filter tabs", () => {
    render(<TripFilterTabs value="all" onChange={jest.fn()} />);
    expect(screen.getByRole("button", { name: /all/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /public/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /private/i }),
    ).toBeInTheDocument();
  });

  it("highlights the active tab", () => {
    render(<TripFilterTabs value="public" onChange={jest.fn()} />);
    const publicTab = screen.getByRole("button", { name: /public/i });
    expect(publicTab).toHaveClass("bg-primary");
  });

  it("calls onChange when a tab is clicked", async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();
    render(<TripFilterTabs value="all" onChange={handleChange} />);

    await user.click(screen.getByRole("button", { name: /private/i }));
    expect(handleChange).toHaveBeenCalledWith("private");
  });

  it("does not call onChange when active tab is clicked", async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();
    render(<TripFilterTabs value="all" onChange={handleChange} />);

    await user.click(screen.getByRole("button", { name: /all/i }));
    expect(handleChange).not.toHaveBeenCalled();
  });
});
