import { render, screen, fireEvent } from "@testing-library/react";
import { TagSelector } from "./TagSelector";

describe("TagSelector", () => {
  const defaultProps = {
    selectedTags: [] as { name: string; category?: string; isAiSuggested?: boolean }[],
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders tag input and add button", () => {
    render(<TagSelector {...defaultProps} />);

    expect(screen.getByPlaceholderText("Add a tag...")).toBeInTheDocument();
    expect(screen.getByLabelText("Add tag")).toBeInTheDocument();
  });

  it("renders selected tags as chips", () => {
    render(
      <TagSelector
        {...defaultProps}
        selectedTags={[
          { name: "Spicy", category: "flavor" },
          { name: "Korean", category: "cuisine" },
        ]}
      />,
    );

    expect(screen.getByText("Spicy")).toBeInTheDocument();
    expect(screen.getByText("Korean")).toBeInTheDocument();
  });

  it("adds a tag when typing and pressing Enter", () => {
    const onChange = jest.fn();
    render(<TagSelector {...defaultProps} onChange={onChange} />);

    const input = screen.getByPlaceholderText("Add a tag...");
    fireEvent.change(input, { target: { value: "Sweet" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onChange).toHaveBeenCalledWith([{ name: "Sweet" }]);
  });

  it("adds a tag when clicking the add button", () => {
    const onChange = jest.fn();
    render(<TagSelector {...defaultProps} onChange={onChange} />);

    const input = screen.getByPlaceholderText("Add a tag...");
    fireEvent.change(input, { target: { value: "Crunchy" } });
    fireEvent.click(screen.getByLabelText("Add tag"));

    expect(onChange).toHaveBeenCalledWith([{ name: "Crunchy" }]);
  });

  it("does not add empty tag", () => {
    const onChange = jest.fn();
    render(<TagSelector {...defaultProps} onChange={onChange} />);

    const input = screen.getByPlaceholderText("Add a tag...");
    fireEvent.change(input, { target: { value: "  " } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onChange).not.toHaveBeenCalled();
  });

  it("does not add duplicate tag", () => {
    const onChange = jest.fn();
    render(
      <TagSelector
        selectedTags={[{ name: "Spicy" }]}
        onChange={onChange}
      />,
    );

    const input = screen.getByPlaceholderText("Add a tag...");
    fireEvent.change(input, { target: { value: "Spicy" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onChange).not.toHaveBeenCalled();
  });

  it("removes a tag when clicking the remove button", () => {
    const onChange = jest.fn();
    render(
      <TagSelector
        selectedTags={[
          { name: "Spicy", category: "flavor" },
          { name: "Korean", category: "cuisine" },
        ]}
        onChange={onChange}
      />,
    );

    // Each chip has a close button
    const removeButtons = screen.getAllByLabelText(/Remove/);
    fireEvent.click(removeButtons[0]);

    expect(onChange).toHaveBeenCalledWith([
      { name: "Korean", category: "cuisine" },
    ]);
  });

  it("clears input after adding a tag", () => {
    render(<TagSelector {...defaultProps} onChange={jest.fn()} />);

    const input = screen.getByPlaceholderText("Add a tag...") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Umami" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(input.value).toBe("");
  });

  it("renders AI suggested tags with sparkle indicator", () => {
    render(
      <TagSelector
        selectedTags={[
          { name: "Spicy", isAiSuggested: true },
          { name: "Homemade" },
        ]}
        onChange={jest.fn()}
      />,
    );

    // AI suggested tag should have the auto_awesome icon
    const chips = screen.getByText("Spicy").closest("button");
    expect(chips?.querySelector(".material-icons-round")?.textContent).toBe(
      "auto_awesome",
    );
  });

  it("renders AI suggest button when onAiSuggest is provided", () => {
    render(
      <TagSelector
        {...defaultProps}
        onAiSuggest={jest.fn()}
      />,
    );

    expect(screen.getByText("AI Suggest")).toBeInTheDocument();
  });

  it("does not render AI suggest button when onAiSuggest is not provided", () => {
    render(<TagSelector {...defaultProps} />);

    expect(screen.queryByText("AI Suggest")).not.toBeInTheDocument();
  });

  it("calls onAiSuggest when AI button is clicked", () => {
    const onAiSuggest = jest.fn();
    render(
      <TagSelector
        {...defaultProps}
        onAiSuggest={onAiSuggest}
      />,
    );

    fireEvent.click(screen.getByText("AI Suggest"));
    expect(onAiSuggest).toHaveBeenCalled();
  });

  it("shows loading state on AI suggest button", () => {
    render(
      <TagSelector
        {...defaultProps}
        onAiSuggest={jest.fn()}
        aiLoading={true}
      />,
    );

    const btn = screen.getByText("Suggesting...");
    expect(btn.closest("button")).toBeDisabled();
  });
});
