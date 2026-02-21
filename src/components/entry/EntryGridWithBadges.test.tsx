import { render, screen, waitFor } from "@testing-library/react";
import type { User } from "@supabase/supabase-js";
import { EntryGridWithBadges } from "./EntryGridWithBadges";

// Mock useAuth
let mockUser: User | null = { id: "user-1" } as User;
jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: mockUser }),
}));

// Mock useAiQuestions
let mockCountMap = new Map<string, number>();
const mockFetchUnansweredCount = jest.fn();
jest.mock("@/hooks/useAiQuestions", () => ({
  useAiQuestions: () => ({
    fetchUnansweredCount: mockFetchUnansweredCount,
  }),
}));

// Mock AiQuestionsBadge to simplify assertions
jest.mock("./AiQuestionsBadge", () => ({
  AiQuestionsBadge: ({
    entryId,
    hasUnanswered,
  }: {
    entryId: string;
    hasUnanswered: boolean;
  }) =>
    hasUnanswered ? (
      <div data-testid={`badge-${entryId}`}>badge</div>
    ) : null,
}));

const makeEntry = (id: string) => ({
  id,
  title: `Food ${id}`,
  restaurant_name: `Restaurant ${id}`,
  created_by: "creator-1",
  created_at: "2024-01-01",
  food_photos: [],
  profiles: { display_name: "Alice", avatar_url: null },
});

const scoreMap = { "e1": 4.5, "e2": 3.2 };

describe("EntryGridWithBadges", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = { id: "user-1" } as User;
    mockCountMap = new Map();
    mockFetchUnansweredCount.mockResolvedValue(mockCountMap);
  });

  it("renders empty state when no entries", () => {
    render(<EntryGridWithBadges entries={[]} scoreMap={{}} />);
    expect(screen.getByText("No food entries yet")).toBeInTheDocument();
  });

  it("renders entry cards", async () => {
    const entries = [makeEntry("e1"), makeEntry("e2")];
    render(<EntryGridWithBadges entries={entries} scoreMap={scoreMap} />);

    await waitFor(() => {
      expect(screen.getByText("Food e1")).toBeInTheDocument();
      expect(screen.getByText("Food e2")).toBeInTheDocument();
    });
  });

  it("calls fetchUnansweredCount once with all entry IDs when user is logged in", async () => {
    const entries = [makeEntry("e1"), makeEntry("e2")];
    render(<EntryGridWithBadges entries={entries} scoreMap={scoreMap} />);

    await waitFor(() => {
      expect(mockFetchUnansweredCount).toHaveBeenCalledTimes(1);
      expect(mockFetchUnansweredCount).toHaveBeenCalledWith(
        ["e1", "e2"],
        "user-1",
      );
    });
  });

  it("does not call fetchUnansweredCount when user is null", async () => {
    mockUser = null;
    const entries = [makeEntry("e1")];
    render(<EntryGridWithBadges entries={entries} scoreMap={scoreMap} />);

    await waitFor(() => {
      expect(mockFetchUnansweredCount).not.toHaveBeenCalled();
    });
  });

  it("shows badge for entries with unanswered questions", async () => {
    mockCountMap = new Map([["e1", 2]]);
    mockFetchUnansweredCount.mockResolvedValue(mockCountMap);

    const entries = [makeEntry("e1"), makeEntry("e2")];
    render(<EntryGridWithBadges entries={entries} scoreMap={scoreMap} />);

    await waitFor(() => {
      expect(screen.getByTestId("badge-e1")).toBeInTheDocument();
      expect(screen.queryByTestId("badge-e2")).not.toBeInTheDocument();
    });
  });

  it("shows avg score when available", async () => {
    const entries = [makeEntry("e1")];
    render(<EntryGridWithBadges entries={entries} scoreMap={{ e1: 4.5 }} />);
    await waitFor(() => {
      expect(screen.getByText("4.5")).toBeInTheDocument();
    });
  });

  it("does not show score when not in scoreMap", async () => {
    const entries = [makeEntry("e1")];
    render(<EntryGridWithBadges entries={entries} scoreMap={{}} />);
    await waitFor(() => {
      expect(screen.queryByText("4.5")).not.toBeInTheDocument();
    });
  });
});
