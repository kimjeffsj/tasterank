import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InviteShare } from "./InviteShare";

describe("InviteShare", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders invite URL with invite code", () => {
    render(<InviteShare inviteCode="abc123" />);

    expect(screen.getByText("Invite Members")).toBeInTheDocument();
    expect(screen.getByText(/\/join\/abc123/)).toBeInTheDocument();
  });

  it("shows copied state after clicking copy button", async () => {
    const user = userEvent.setup();
    render(<InviteShare inviteCode="abc123" />);

    // Initially shows content_copy icon text
    expect(screen.getByText("content_copy")).toBeInTheDocument();

    const copyButton = screen.getAllByRole("button")[0];
    await user.click(copyButton);

    // After click, icon changes to "check" and confirmation shows
    await waitFor(() => {
      expect(screen.getByText("check")).toBeInTheDocument();
      expect(
        screen.getByText("Link copied to clipboard!"),
      ).toBeInTheDocument();
    });
  });

  it("hides copied confirmation after timeout", async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<InviteShare inviteCode="abc123" />);

    const copyButton = screen.getAllByRole("button")[0];
    await user.click(copyButton);

    await waitFor(() => {
      expect(screen.getByText("Link copied to clipboard!")).toBeInTheDocument();
    });

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(
        screen.queryByText("Link copied to clipboard!"),
      ).not.toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  it("renders both copy and share buttons", () => {
    render(<InviteShare inviteCode="test123" />);

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
  });

  it("displays the full invite URL", () => {
    render(<InviteShare inviteCode="xyz789" />);

    expect(screen.getByText(/\/join\/xyz789/)).toBeInTheDocument();
  });
});
