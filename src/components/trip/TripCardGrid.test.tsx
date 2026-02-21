import { render, screen } from "@testing-library/react";
import { TripCardGrid } from "./TripCardGrid";

const mockTrip = {
  id: "trip-1",
  name: "Tokyo Adventure",
  description: "Amazing food journey through Tokyo",
  cover_image_url: "https://example.com/tokyo.jpg",
  is_public: true,
  start_date: "2026-01-10",
  end_date: "2026-01-20",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: null,
  owner_id: "user-1",
  invite_code: "abc123",
};

describe("TripCardGrid", () => {
  it("renders trip name", () => {
    render(<TripCardGrid trip={mockTrip} />);
    expect(screen.getByText("Tokyo Adventure")).toBeInTheDocument();
  });

  it("renders trip description", () => {
    render(<TripCardGrid trip={mockTrip} />);
    expect(
      screen.getByText("Amazing food journey through Tokyo"),
    ).toBeInTheDocument();
  });

  it("renders cover image when available", () => {
    render(<TripCardGrid trip={mockTrip} />);
    const img = screen.getByAltText("Tokyo Adventure");
    expect(img).toHaveAttribute("src", "https://example.com/tokyo.jpg");
  });

  it("renders gradient placeholder when no cover image", () => {
    const trip = { ...mockTrip, cover_image_url: null };
    render(<TripCardGrid trip={trip} />);
    // Should still render the trip name
    expect(screen.getByText("Tokyo Adventure")).toBeInTheDocument();
    // No img should be present
    expect(screen.queryByAltText("Tokyo Adventure")).not.toBeInTheDocument();
  });

  it("shows visibility badge", () => {
    render(<TripCardGrid trip={mockTrip} />);
    expect(screen.getByText("Public")).toBeInTheDocument();
  });

  it("links to the trip detail page", () => {
    render(<TripCardGrid trip={mockTrip} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/trips/trip-1");
  });

  it("uses aspect-[4/5] container", () => {
    render(<TripCardGrid trip={mockTrip} />);
    const link = screen.getByRole("link");
    expect(link.className).toContain("aspect-4/5");
  });
});
