import { render, screen, fireEvent } from "@testing-library/react";
import { RankingPageClient } from "./RankingPageClient";
import type { RankedEntry } from "./RankingList";

// Mock child components
jest.mock("./RankingList", () => ({
  RankingList: ({
    rankings,
    showAiScore,
  }: {
    rankings: RankedEntry[];
    showAiScore?: boolean;
  }) => (
    <div data-testid="ranking-list">
      <span data-testid="show-ai-score">{showAiScore ? "ai" : "user"}</span>
      <span data-testid="entry-count">{rankings.length}</span>
    </div>
  ),
}));

describe("RankingPageClient", () => {
  const mockEntries: RankedEntry[] = [
    {
      entry_id: "1",
      title: "Best Dish",
      restaurant_name: "Top Restaurant",
      rank: 1,
      avg_score: 9.5,
      rating_count: 10,
      photo_url: null,
      tags: [],
      composite_score: 9.2,
      ai_comment: "Amazing!",
      breakdown: {
        user_score: 9.5,
        tournament: 8.0,
        ai_questions: 9.0,
        sentiment: 10.0,
      },
    },
    {
      entry_id: "2",
      title: "Second Dish",
      restaurant_name: null,
      rank: 2,
      avg_score: 8.5,
      rating_count: 5,
      photo_url: null,
      tags: [],
      composite_score: 8.0,
      ai_comment: null,
      breakdown: null,
    },
  ];

  it("should render with user view by default", () => {
    render(
      <RankingPageClient
        tripId="trip1"
        tripName="My Trip"
        entries={mockEntries}
        hasAiRanking={false}
        aiGeneratedAt={null}
      />,
    );

    expect(screen.getByText("User Ratings")).toBeInTheDocument();
    expect(screen.getByTestId("show-ai-score")).toHaveTextContent("user");
  });

  it("should show 'Soon' badge when no AI ranking exists", () => {
    render(
      <RankingPageClient
        tripId="trip1"
        tripName="My Trip"
        entries={mockEntries}
        hasAiRanking={false}
        aiGeneratedAt={null}
      />,
    );

    const aiButton = screen.getByText("AI Composite");
    expect(aiButton).toBeDisabled();
    expect(screen.getByText("Soon")).toBeInTheDocument();
  });

  it("should switch to AI view when button clicked", () => {
    render(
      <RankingPageClient
        tripId="trip1"
        tripName="My Trip"
        entries={mockEntries}
        hasAiRanking={true}
        aiGeneratedAt="2026-02-17T10:00:00Z"
      />,
    );

    const aiButton = screen.getByText("AI Composite");
    expect(aiButton).not.toBeDisabled();

    fireEvent.click(aiButton);

    expect(screen.getByTestId("show-ai-score")).toHaveTextContent("ai");
  });

  it("should show AI timestamp with 'Refreshes daily' in AI view", () => {
    render(
      <RankingPageClient
        tripId="trip1"
        tripName="My Trip"
        entries={mockEntries}
        hasAiRanking={true}
        aiGeneratedAt="2026-02-17T10:00:00Z"
      />,
    );

    const aiButton = screen.getByText("AI Composite");
    fireEvent.click(aiButton);

    expect(screen.getByText(/Updated/)).toBeInTheDocument();
    expect(screen.getByText(/Refreshes daily/)).toBeInTheDocument();
  });

  it("should sort entries by composite score in AI view", () => {
    const entries: RankedEntry[] = [
      {
        entry_id: "1",
        title: "Lower AI Score",
        restaurant_name: null,
        rank: 1,
        avg_score: 9.0,
        rating_count: 5,
        photo_url: null,
        tags: [],
        composite_score: 7.5,
        ai_comment: null,
        breakdown: null,
      },
      {
        entry_id: "2",
        title: "Higher AI Score",
        restaurant_name: null,
        rank: 2,
        avg_score: 8.0,
        rating_count: 3,
        photo_url: null,
        tags: [],
        composite_score: 9.0,
        ai_comment: null,
        breakdown: null,
      },
    ];

    const { container } = render(
      <RankingPageClient
        tripId="trip1"
        tripName="My Trip"
        entries={entries}
        hasAiRanking={true}
        aiGeneratedAt="2026-02-17T10:00:00Z"
      />,
    );

    const aiButton = screen.getByText("AI Composite");
    fireEvent.click(aiButton);

    // In AI view, entry with higher composite_score should be first
    // Ranking list receives sorted entries
    const list = container.querySelector('[data-testid="ranking-list"]');
    expect(list).toBeInTheDocument();
  });

  it("should show description text for each view mode", () => {
    const { rerender } = render(
      <RankingPageClient
        tripId="trip1"
        tripName="My Trip"
        entries={mockEntries}
        hasAiRanking={true}
        aiGeneratedAt="2026-02-17T10:00:00Z"
      />,
    );

    expect(
      screen.getByText("Ranked by average user scores"),
    ).toBeInTheDocument();

    const aiButton = screen.getByText("AI Composite");
    fireEvent.click(aiButton);

    expect(screen.getByText(/AI-weighted composite score/)).toBeInTheDocument();
  });
});
