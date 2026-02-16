import { render, screen, fireEvent } from "@testing-library/react";
import { MatchCard } from "./MatchCard";
import type { TournamentEntryInfo } from "@/hooks/useTournament";

const entryA: TournamentEntryInfo = {
  id: "a",
  title: "Ramen",
  restaurant_name: "Ichiran",
  photo_url: "https://example.com/ramen.jpg",
  avg_score: 4.5,
};

const entryB: TournamentEntryInfo = {
  id: "b",
  title: "Sushi",
  restaurant_name: "Sukiyabashi",
  photo_url: null,
  avg_score: null,
};

describe("MatchCard", () => {
  it("renders both entries", () => {
    render(<MatchCard entryA={entryA} entryB={entryB} onVote={jest.fn()} />);

    expect(screen.getByText("Ramen")).toBeInTheDocument();
    expect(screen.getByText("Ichiran")).toBeInTheDocument();
    expect(screen.getByText("Sushi")).toBeInTheDocument();
    expect(screen.getByText("Sukiyabashi")).toBeInTheDocument();
    expect(screen.getByText("VS")).toBeInTheDocument();
  });

  it("calls onVote with correct entry id when clicked", () => {
    const onVote = jest.fn();
    render(<MatchCard entryA={entryA} entryB={entryB} onVote={onVote} />);

    fireEvent.click(screen.getByText("Ramen").closest("button")!);
    expect(onVote).toHaveBeenCalledWith("a");

    fireEvent.click(screen.getByText("Sushi").closest("button")!);
    expect(onVote).toHaveBeenCalledWith("b");
  });

  it("disables buttons when disabled prop is true", () => {
    render(<MatchCard entryA={entryA} entryB={entryB} onVote={jest.fn()} disabled />);

    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => expect(btn).toBeDisabled());
  });

  it("shows rating badge only when avg_score exists", () => {
    render(<MatchCard entryA={entryA} entryB={entryB} onVote={jest.fn()} />);

    expect(screen.getByText("4.5")).toBeInTheDocument();
    // entryB has no score, so no score text for it
    expect(screen.queryAllByText(/\d\.\d/)).toHaveLength(1);
  });
});
