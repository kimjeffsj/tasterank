import { render, screen, fireEvent } from "@testing-library/react";
import { PhotoCarousel } from "./PhotoCarousel";

describe("PhotoCarousel", () => {
  const mockPhotos = [
    { photo_url: "https://example.com/photo1.jpg", display_order: 0 },
    { photo_url: "https://example.com/photo2.jpg", display_order: 1 },
    { photo_url: "https://example.com/photo3.jpg", display_order: 2 },
  ];

  it("renders placeholder when no photos", () => {
    render(<PhotoCarousel photos={[]} title="Ramen" />);
    expect(screen.getByText("restaurant")).toBeInTheDocument();
  });

  it("renders single photo", () => {
    render(
      <PhotoCarousel
        photos={[{ photo_url: "https://example.com/photo1.jpg", display_order: 0 }]}
        title="Ramen"
      />
    );
    const img = screen.getByAltText("Ramen 1");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/photo1.jpg");
  });

  it("renders multiple photos with pagination dots", () => {
    render(<PhotoCarousel photos={mockPhotos} title="Ramen" />);
    const dots = screen.getAllByRole("button", { name: /photo/i });
    expect(dots).toHaveLength(3);
  });

  it("does not render pagination dots for single photo", () => {
    render(
      <PhotoCarousel
        photos={[{ photo_url: "https://example.com/photo1.jpg", display_order: 0 }]}
        title="Ramen"
      />
    );
    const dots = screen.queryAllByRole("button", { name: /photo/i });
    expect(dots).toHaveLength(0);
  });

  it("renders photos sorted by display_order", () => {
    const unsortedPhotos = [
      { photo_url: "https://example.com/photo2.jpg", display_order: 1 },
      { photo_url: "https://example.com/photo1.jpg", display_order: 0 },
    ];
    render(<PhotoCarousel photos={unsortedPhotos} title="Ramen" />);
    const images = screen.getAllByRole("img");
    expect(images[0]).toHaveAttribute("src", "https://example.com/photo1.jpg");
  });

  it("renders carousel container with correct height class", () => {
    render(<PhotoCarousel photos={mockPhotos} title="Ramen" />);
    const container = screen.getByTestId("photo-carousel");
    expect(container).toHaveClass("h-[400px]");
  });

  it("renders share button when showShareButton is true", () => {
    render(<PhotoCarousel photos={mockPhotos} title="Ramen" showShareButton={true} />);
    const shareButton = screen.getByRole("button", { name: "Share" });
    expect(shareButton).toBeInTheDocument();
  });

  it("does not render share button when showShareButton is not provided", () => {
    render(<PhotoCarousel photos={mockPhotos} title="Ramen" />);
    const shareButton = screen.queryByRole("button", { name: "Share" });
    expect(shareButton).not.toBeInTheDocument();
  });

  it("renders share button in empty state when showShareButton is true", () => {
    render(<PhotoCarousel photos={[]} title="Ramen" showShareButton={true} />);
    const shareButton = screen.getByRole("button", { name: "Share" });
    expect(shareButton).toBeInTheDocument();
  });

  it("does not render share button in empty state when showShareButton is not provided", () => {
    render(<PhotoCarousel photos={[]} title="Ramen" />);
    const shareButton = screen.queryByRole("button", { name: "Share" });
    expect(shareButton).not.toBeInTheDocument();
  });

  it("calls navigator.share when share button is clicked and Web Share API is available", () => {
    const mockShare = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", {
      value: mockShare,
      configurable: true,
    });

    render(<PhotoCarousel photos={mockPhotos} title="Ramen" showShareButton={true} />);
    const shareButton = screen.getByRole("button", { name: "Share" });
    fireEvent.click(shareButton);

    expect(mockShare).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Ramen" })
    );
  });
});
