import { render, screen } from "@testing-library/react";
import { TripCardCompact } from "./TripCardCompact";

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

describe("TripCardCompact", () => {
  it("renders trip name", () => {
    render(<TripCardCompact trip={mockTrip} />);
    expect(screen.getByText("Tokyo Adventure")).toBeInTheDocument();
  });

  it("renders trip description", () => {
    render(<TripCardCompact trip={mockTrip} />);
    expect(
      screen.getByText("Amazing food journey through Tokyo"),
    ).toBeInTheDocument();
  });

  it("renders cover image when available", () => {
    render(<TripCardCompact trip={mockTrip} />);
    const img = screen.getByAltText("Tokyo Adventure");
    expect(img).toHaveAttribute("src", "https://example.com/tokyo.jpg");
  });

  it("renders placeholder when no cover image", () => {
    const trip = { ...mockTrip, cover_image_url: null };
    render(<TripCardCompact trip={trip} />);
    expect(screen.getByText("restaurant")).toBeInTheDocument();
  });

  it("shows public badge for public trips", () => {
    render(<TripCardCompact trip={mockTrip} />);
    expect(screen.getByText("Public")).toBeInTheDocument();
  });

  it("shows private badge for private trips", () => {
    const trip = { ...mockTrip, is_public: false };
    render(<TripCardCompact trip={trip} />);
    expect(screen.getByText("Private")).toBeInTheDocument();
  });

  it("renders date range when dates are available", () => {
    render(<TripCardCompact trip={mockTrip} />);
    // Check for calendar icon (indicates date rendering)
    expect(screen.getByText("calendar_today")).toBeInTheDocument();
  });

  it("links to the trip detail page", () => {
    render(<TripCardCompact trip={mockTrip} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/trips/trip-1");
  });
});
