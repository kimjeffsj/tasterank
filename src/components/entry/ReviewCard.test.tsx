import { render, screen } from "@testing-library/react";
import { ReviewCard } from "./ReviewCard";

describe("ReviewCard", () => {
  const baseProps = {
    displayName: "Alice",
    avatarUrl: null as string | null,
    score: 8.5,
    comment: "Really delicious!",
    createdAt: "2024-01-15T00:00:00.000Z",
  };

  it("renders reviewer name", () => {
    render(<ReviewCard {...baseProps} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("renders score", () => {
    render(<ReviewCard {...baseProps} />);
    expect(screen.getByText("8.5")).toBeInTheDocument();
  });

  it("renders comment", () => {
    render(<ReviewCard {...baseProps} />);
    expect(screen.getByText("Really delicious!")).toBeInTheDocument();
  });

  it("does not render comment section when no comment", () => {
    render(<ReviewCard {...baseProps} comment={null} />);
    expect(screen.queryByText("Really delicious!")).not.toBeInTheDocument();
  });

  it("renders avatar image when provided", () => {
    render(
      <ReviewCard
        {...baseProps}
        avatarUrl="https://example.com/avatar.jpg"
      />
    );
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://example.com/avatar.jpg");
  });

  it("renders person icon when no avatar", () => {
    render(<ReviewCard {...baseProps} />);
    expect(screen.getByText("person")).toBeInTheDocument();
  });

  it("renders the card with correct styling class", () => {
    render(<ReviewCard {...baseProps} />);
    const card = screen.getByTestId("review-card");
    expect(card).toHaveClass("bg-white");
  });
});
