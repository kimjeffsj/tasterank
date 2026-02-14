import { render, screen, fireEvent } from "@testing-library/react";
import { RankingList } from "./RankingList";
import type { RankedEntry } from "./RankingList";

const makeEntry = (overrides: Partial<RankedEntry> = {}): RankedEntry => ({
  entry_id: "entry-1",
  title: "Ichiran Ramen",
  restaurant_name: "Ichiran Shibuya",
  rank: 1,
  avg_score: 9.2,
  rating_count: 3,
  photo_url: "https://example.com/ramen.jpg",
  tags: [
    { id: "t1", name: "Ramen", category: "cuisine" },
    { id: "t2", name: "Spicy", category: "flavor" },
  ],
  ...overrides,
});

describe("RankingList", () => {
  it("renders 1st place card with name, score, and photo", () => {
    const entries = [makeEntry()];
    render(<RankingList rankings={entries} tripName="Tokyo Trip" />);

    expect(screen.getByText("Ichiran Ramen")).toBeInTheDocument();
    expect(screen.getByText("9.2")).toBeInTheDocument();
    const img = screen.getByAltText("Ichiran Ramen");
    expect(img).toHaveAttribute("src", "https://example.com/ramen.jpg");
  });

  it("renders 2nd and 3rd place cards", () => {
    const entries = [
      makeEntry({ entry_id: "e1", title: "Ramen #1", rank: 1 }),
      makeEntry({ entry_id: "e2", title: "Sushi Place", rank: 2, avg_score: 8.5 }),
      makeEntry({ entry_id: "e3", title: "Tempura Spot", rank: 3, avg_score: 7.8 }),
    ];
    render(<RankingList rankings={entries} tripName="Tokyo Trip" />);

    expect(screen.getByText("Sushi Place")).toBeInTheDocument();
    expect(screen.getByText("8.5")).toBeInTheDocument();
    expect(screen.getByText("Tempura Spot")).toBeInTheDocument();
    expect(screen.getByText("7.8")).toBeInTheDocument();
  });

  it("renders runners-up list for 4th+ entries", () => {
    const entries = [
      makeEntry({ entry_id: "e1", title: "First", rank: 1 }),
      makeEntry({ entry_id: "e2", title: "Second", rank: 2 }),
      makeEntry({ entry_id: "e3", title: "Third", rank: 3 }),
      makeEntry({ entry_id: "e4", title: "Fourth Place", rank: 4, avg_score: 7.0, restaurant_name: "Runner Up Cafe" }),
      makeEntry({ entry_id: "e5", title: "Fifth Place", rank: 5, avg_score: 6.5 }),
    ];
    render(<RankingList rankings={entries} tripName="Tokyo Trip" />);

    expect(screen.getByText("Fourth Place")).toBeInTheDocument();
    expect(screen.getByText("Runner Up Cafe")).toBeInTheDocument();
    expect(screen.getByText("Fifth Place")).toBeInTheDocument();
  });

  it("filters entries by tag when a tag pill is clicked", () => {
    const entries = [
      makeEntry({ entry_id: "e1", title: "Ramen Shop", rank: 1, tags: [{ id: "t1", name: "Ramen", category: "cuisine" }] }),
      makeEntry({ entry_id: "e2", title: "Sushi Bar", rank: 2, avg_score: 8.0, tags: [{ id: "t2", name: "Sushi", category: "cuisine" }] }),
    ];
    render(<RankingList rankings={entries} tripName="Tokyo Trip" />);

    fireEvent.click(screen.getByRole("button", { name: "Ramen" }));

    expect(screen.getByText("Ramen Shop")).toBeInTheDocument();
    expect(screen.queryByText("Sushi Bar")).not.toBeInTheDocument();
  });

  it("shows all entries when 'All' filter is clicked", () => {
    const entries = [
      makeEntry({ entry_id: "e1", title: "Ramen Shop", rank: 1, tags: [{ id: "t1", name: "Ramen", category: "cuisine" }] }),
      makeEntry({ entry_id: "e2", title: "Sushi Bar", rank: 2, avg_score: 8.0, tags: [{ id: "t2", name: "Sushi", category: "cuisine" }] }),
    ];
    render(<RankingList rankings={entries} tripName="Tokyo Trip" />);

    // Filter first
    fireEvent.click(screen.getByRole("button", { name: "Ramen" }));
    expect(screen.queryByText("Sushi Bar")).not.toBeInTheDocument();

    // Reset to All
    fireEvent.click(screen.getByRole("button", { name: "All" }));
    expect(screen.getByText("Ramen Shop")).toBeInTheDocument();
    expect(screen.getByText("Sushi Bar")).toBeInTheDocument();
  });

  it("renders empty state when no rankings exist", () => {
    render(<RankingList rankings={[]} tripName="Tokyo Trip" />);

    expect(screen.getByText("No rankings yet")).toBeInTheDocument();
  });

  it("shows fallback icon when entry has no photo", () => {
    const entries = [makeEntry({ photo_url: null })];
    render(<RankingList rankings={entries} tripName="Tokyo Trip" />);

    expect(screen.queryByAltText("Ichiran Ramen")).not.toBeInTheDocument();
    // Should show the restaurant fallback icon
    const icons = document.querySelectorAll(".material-icons-round");
    const restaurantIcon = Array.from(icons).find((el) => el.textContent === "restaurant");
    expect(restaurantIcon).toBeTruthy();
  });

  it("handles entries without ratings gracefully", () => {
    const entries = [makeEntry({ avg_score: null, rating_count: 0 })];
    render(<RankingList rankings={entries} tripName="Tokyo Trip" />);

    expect(screen.getByText("Ichiran Ramen")).toBeInTheDocument();
    // Should not show a score
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });
});
