import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DateInput } from "./DateInput";

describe("DateInput", () => {
  it("renders placeholder when value is empty", () => {
    render(<DateInput id="test-date" value="" onChange={jest.fn()} />);
    expect(screen.getByText("Select date")).toBeInTheDocument();
  });

  it("renders custom placeholder when provided", () => {
    render(
      <DateInput
        id="test-date"
        value=""
        onChange={jest.fn()}
        placeholder="Pick a date"
      />,
    );
    expect(screen.getByText("Pick a date")).toBeInTheDocument();
  });

  it("renders formatted date when value is provided", () => {
    render(
      <DateInput id="test-date" value="2026-03-01" onChange={jest.fn()} />,
    );
    expect(screen.getByText("Mar 1, 2026")).toBeInTheDocument();
  });

  it("shows calendar_today Material Icon", () => {
    render(<DateInput id="test-date" value="" onChange={jest.fn()} />);
    expect(screen.getByText("calendar_today")).toBeInTheDocument();
  });

  it("calls onChange on native input change", async () => {
    const handleChange = jest.fn();
    render(<DateInput id="test-date" value="" onChange={handleChange} />);

    const input = document.getElementById("test-date") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.type).toBe("date");

    await userEvent.setup().type(input, "2026-05-15");
    expect(handleChange).toHaveBeenCalled();
  });

  it("supports label htmlFor association via id", () => {
    render(
      <>
        <label htmlFor="my-date">My Date</label>
        <DateInput id="my-date" value="" onChange={jest.fn()} />
      </>,
    );
    expect(screen.getByLabelText("My Date")).toBeInTheDocument();
  });

  it("passes min and max to native input", () => {
    render(
      <DateInput
        id="test-date"
        value=""
        onChange={jest.fn()}
        min="2026-01-01"
        max="2026-12-31"
      />,
    );

    const input = document.getElementById("test-date") as HTMLInputElement;
    expect(input).toHaveAttribute("min", "2026-01-01");
    expect(input).toHaveAttribute("max", "2026-12-31");
  });

  it("retains native input value for form association", () => {
    render(
      <DateInput id="test-date" value="2026-06-15" onChange={jest.fn()} />,
    );

    const input = document.getElementById("test-date") as HTMLInputElement;
    expect(input.value).toBe("2026-06-15");
  });
});
