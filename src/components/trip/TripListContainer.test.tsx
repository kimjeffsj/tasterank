import { render, screen, within, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Tables } from "@/types/database";
import { TripListContainer } from "./TripListContainer";

type Trip = Tables<"trips">;

const mockTrips: Trip[] = [
  {
    id: "trip-1",
    name: "Tokyo Adventure",
    description: "Japan trip",
    cover_image_url: null,
    is_public: true,
    start_date: "2026-01-10",
    end_date: "2026-01-20",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: null,
    owner_id: "user-1",
    invite_code: "abc",
  },
  {
    id: "trip-2",
    name: "Barcelona Bites",
    description: "Spain food tour",
    cover_image_url: null,
    is_public: false,
    start_date: "2026-03-01",
    end_date: "2026-03-10",
    created_at: "2026-02-01T00:00:00Z",
    updated_at: null,
    owner_id: "user-1",
    invite_code: "def",
  },
  {
    id: "trip-3",
    name: "Alaskan Catch",
    description: "Seafood trip",
    cover_image_url: null,
    is_public: true,
    start_date: "2025-12-01",
    end_date: "2025-12-15",
    created_at: "2025-12-01T00:00:00Z",
    updated_at: null,
    owner_id: "user-2",
    invite_code: "ghi",
  },
];

// Fake timers for SearchBar debounce
beforeEach(() => {
  jest.useFakeTimers();
});
afterEach(() => {
  jest.useRealTimers();
});

describe("TripListContainer", () => {
  it("renders all trips by default", () => {
    render(<TripListContainer trips={mockTrips} loading={false} />);
    expect(screen.getByText("Tokyo Adventure")).toBeInTheDocument();
    expect(screen.getByText("Barcelona Bites")).toBeInTheDocument();
    expect(screen.getByText("Alaskan Catch")).toBeInTheDocument();
  });

  it("shows loading skeletons when loading", () => {
    render(<TripListContainer trips={[]} loading={true} />);
    // Should render skeleton placeholders
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("shows empty state when no trips", () => {
    render(<TripListContainer trips={[]} loading={false} />);
    expect(screen.getByText(/no trips/i)).toBeInTheDocument();
  });

  it("filters by public/private", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<TripListContainer trips={mockTrips} loading={false} />);

    await user.click(screen.getByRole("button", { name: /private/i }));

    expect(screen.queryByText("Tokyo Adventure")).not.toBeInTheDocument();
    expect(screen.getByText("Barcelona Bites")).toBeInTheDocument();
    expect(screen.queryByText("Alaskan Catch")).not.toBeInTheDocument();
  });

  it("filters by search query", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<TripListContainer trips={mockTrips} loading={false} />);

    const input = screen.getByPlaceholderText("Search trips...");
    await user.type(input, "Tokyo");
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(screen.getByText("Tokyo Adventure")).toBeInTheDocument();
    expect(screen.queryByText("Barcelona Bites")).not.toBeInTheDocument();
    expect(screen.queryByText("Alaskan Catch")).not.toBeInTheDocument();
  });

  it("sorts by name (A-Z)", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<TripListContainer trips={mockTrips} loading={false} />);

    // Open sort dropdown and select Name
    await user.click(screen.getByRole("button", { name: /sort/i }));
    await user.click(screen.getByText("Name"));

    const links = screen.getAllByRole("link");
    const names = links.map((l) => l.textContent);
    // Alaskan Catch should come first alphabetically
    expect(names[0]).toContain("Alaskan Catch");
  });

  it("toggles between grid and list view", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<TripListContainer trips={mockTrips} loading={false} />);

    // Default is list view
    await user.click(screen.getByRole("button", { name: /grid view/i }));
    // After toggling to grid, grid cards should be rendered (aspect-[4/5])
    const links = screen.getAllByRole("link");
    expect(links[0].className).toContain("aspect-4/5");
  });

  it("shows filtered empty state when search finds nothing", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<TripListContainer trips={mockTrips} loading={false} />);

    const input = screen.getByPlaceholderText("Search trips...");
    await user.type(input, "zzzzz");
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(screen.getByText(/no trips found/i)).toBeInTheDocument();
  });

  it("accepts custom emptyIcon and emptyTitle", () => {
    render(
      <TripListContainer
        trips={[]}
        loading={false}
        emptyIcon="explore"
        emptyTitle="No public trips yet"
      />,
    );
    expect(screen.getByText("explore")).toBeInTheDocument();
    expect(screen.getByText("No public trips yet")).toBeInTheDocument();
  });
});
