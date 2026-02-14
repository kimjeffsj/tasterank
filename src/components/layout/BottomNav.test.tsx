import { render, screen } from "@testing-library/react";
import { BottomNav } from "./BottomNav";

// Mock next/navigation
const mockPathname = jest.fn();
jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
}));

describe("BottomNav", () => {
  beforeEach(() => {
    mockPathname.mockReturnValue("/");
  });

  it("renders all 5 nav items", () => {
    render(<BottomNav />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
    expect(screen.getByText("Saved")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    // Center add button (no label, just icon)
    const addLink = screen.getByRole("link", { name: /add/i });
    expect(addLink).toBeInTheDocument();
  });

  it("highlights Home tab as active on / route", () => {
    mockPathname.mockReturnValue("/");
    render(<BottomNav />);

    const homeLink = screen.getByRole("link", { name: /home/i });
    expect(homeLink).toHaveClass("text-primary");
  });

  it("highlights Search tab as active on /search route", () => {
    mockPathname.mockReturnValue("/search");
    render(<BottomNav />);

    const searchLink = screen.getByRole("link", { name: /search/i });
    expect(searchLink).toHaveClass("text-primary");
  });

  it("links to correct destinations", () => {
    render(<BottomNav />);

    expect(screen.getByRole("link", { name: /home/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /search/i })).toHaveAttribute("href", "/search");
    expect(screen.getByRole("link", { name: /add/i })).toHaveAttribute("href", "/trips/new");
    expect(screen.getByRole("link", { name: /saved/i })).toHaveAttribute("href", "/saved");
    expect(screen.getByRole("link", { name: /profile/i })).toHaveAttribute("href", "/profile");
  });

  it("center add button has raised styling", () => {
    render(<BottomNav />);

    const addLink = screen.getByRole("link", { name: /add/i });
    expect(addLink).toHaveClass("-mt-8");
  });

  it("returns null on /trips/[tripId] routes", () => {
    mockPathname.mockReturnValue("/trips/abc123");
    const { container } = render(<BottomNav />);
    expect(container.innerHTML).toBe("");
  });

  it("returns null on /trips/[tripId]/ranking routes", () => {
    mockPathname.mockReturnValue("/trips/abc123/ranking");
    const { container } = render(<BottomNav />);
    expect(container.innerHTML).toBe("");
  });
});
