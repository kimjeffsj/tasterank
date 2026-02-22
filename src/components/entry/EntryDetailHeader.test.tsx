import { render, screen } from "@testing-library/react";
import { EntryDetailHeader } from "./EntryDetailHeader";

describe("EntryDetailHeader", () => {
  const baseProps = {
    title: "Tonkotsu Ramen",
    restaurantName: "Ippudo",
    location: "Tokyo, Japan",
    avgScore: 8.5,
    ratingCount: 12,
    tags: [
      { name: "ramen", category: "type" },
      { name: "pork", category: "ingredient" },
    ],
    creatorName: "Alice",
    creatorAvatar: null as string | null,
  };

  it("renders the entry title", () => {
    render(<EntryDetailHeader {...baseProps} />);
    expect(screen.getByText("Tonkotsu Ramen")).toBeInTheDocument();
  });

  it("renders restaurant name", () => {
    render(<EntryDetailHeader {...baseProps} />);
    expect(screen.getByText("Ippudo")).toBeInTheDocument();
  });

  it("renders location when provided", () => {
    render(<EntryDetailHeader {...baseProps} />);
    expect(screen.getByText("Tokyo, Japan")).toBeInTheDocument();
  });

  it("does not render location when null", () => {
    render(<EntryDetailHeader {...baseProps} location={null} />);
    expect(screen.queryByText("Tokyo, Japan")).not.toBeInTheDocument();
  });

  it("renders avg score when available", () => {
    render(<EntryDetailHeader {...baseProps} />);
    expect(screen.getByText("8.5")).toBeInTheDocument();
  });

  it("renders rating count", () => {
    render(<EntryDetailHeader {...baseProps} />);
    expect(screen.getByText(/12/)).toBeInTheDocument();
  });

  it("does not render score badge when avgScore is null", () => {
    render(<EntryDetailHeader {...baseProps} avgScore={null} />);
    expect(screen.queryByText("8.5")).not.toBeInTheDocument();
  });

  it("renders tags", () => {
    render(<EntryDetailHeader {...baseProps} />);
    expect(screen.getByText("RAMEN")).toBeInTheDocument();
    expect(screen.getByText("PORK")).toBeInTheDocument();
  });

  it("does not render tags section when empty", () => {
    render(<EntryDetailHeader {...baseProps} tags={[]} />);
    expect(screen.queryByText("RAMEN")).not.toBeInTheDocument();
  });

  it("renders creator name", () => {
    render(<EntryDetailHeader {...baseProps} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });
});
