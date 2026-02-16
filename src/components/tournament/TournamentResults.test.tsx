import { render, screen, fireEvent } from "@testing-library/react";
import { TournamentResults, type TournamentResultEntry } from "./TournamentResults";

const mockResults: TournamentResultEntry[] = [
  {
    entryId: "a",
    totalWins: 5,
    entry: { id: "a", title: "Ramen", restaurant_name: "Ichiran", photo_url: null, avg_score: 4.5 },
  },
  {
    entryId: "b",
    totalWins: 3,
    entry: { id: "b", title: "Sushi", restaurant_name: "Sukiya", photo_url: null, avg_score: 4.0 },
  },
  {
    entryId: "c",
    totalWins: 2,
    entry: { id: "c", title: "Udon", restaurant_name: null, photo_url: null, avg_score: null },
  },
  {
    entryId: "d",
    totalWins: 1,
    entry: { id: "d", title: "Curry", restaurant_name: null, photo_url: null, avg_score: null },
  },
];

describe("TournamentResults", () => {
  it("renders empty state when no results", () => {
    render(<TournamentResults results={[]} onBack={jest.fn()} />);
    expect(screen.getByText("No results yet")).toBeInTheDocument();
  });

  it("renders champion and runner-up", () => {
    render(<TournamentResults results={mockResults} onBack={jest.fn()} />);

    expect(screen.getByText("Champion")).toBeInTheDocument();
    expect(screen.getByText("Ramen")).toBeInTheDocument();
    expect(screen.getByText("Sushi")).toBeInTheDocument();
    expect(screen.getByText("5 wins")).toBeInTheDocument();
    expect(screen.getByText("3 wins")).toBeInTheDocument();
  });

  it("renders semi-finalists", () => {
    render(<TournamentResults results={mockResults} onBack={jest.fn()} />);

    expect(screen.getByText("Semi-finalists")).toBeInTheDocument();
    expect(screen.getByText("Udon")).toBeInTheDocument();
    expect(screen.getByText("Curry")).toBeInTheDocument();
  });

  it("calls onBack when back button clicked", () => {
    const onBack = jest.fn();
    render(<TournamentResults results={mockResults} onBack={onBack} />);

    fireEvent.click(screen.getByText("Back to Tournament"));
    expect(onBack).toHaveBeenCalled();
  });
});
