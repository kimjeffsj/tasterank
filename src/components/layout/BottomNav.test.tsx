import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { BottomNav } from "./BottomNav";
import React from "react";

// Mock next/navigation
const mockPathname = jest.fn();
const mockRouterPush = jest.fn();

jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
  useRouter: () => ({ push: mockRouterPush }),
}));

// Mock useAuth
const mockUser = jest.fn();
jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: mockUser() }),
}));

// Mock LoginPrompt
jest.mock("@/components/auth/LoginPrompt", () => ({
  LoginPrompt: ({ open }: { open: boolean }) =>
    open ? <div data-testid="login-prompt" /> : null,
}));

// Mock Supabase client with chainable query builder
const mockSingle = jest.fn();
jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: mockSingle,
          }),
        }),
      }),
    }),
  }),
}));

describe("BottomNav", () => {
  beforeEach(() => {
    mockPathname.mockReturnValue("/");
    mockUser.mockReturnValue(null);
    mockRouterPush.mockClear();
    mockSingle.mockResolvedValue({ data: null, error: null });
  });

  // -------------------------
  // shouldHideNav tests
  // -------------------------
  describe("shouldHideNav", () => {
    it("should NOT render on tournament page", () => {
      mockPathname.mockReturnValue("/trips/abc123/tournament");
      const { container } = render(<BottomNav />);
      expect(container.innerHTML).toBe("");
    });

    it("should NOT render on /trips/new page", () => {
      mockPathname.mockReturnValue("/trips/new");
      const { container } = render(<BottomNav />);
      expect(container.innerHTML).toBe("");
    });

    it("should NOT render on trip edit page", () => {
      mockPathname.mockReturnValue("/trips/abc123/edit");
      const { container } = render(<BottomNav />);
      expect(container.innerHTML).toBe("");
    });

    it("should NOT render on entry detail page", () => {
      mockPathname.mockReturnValue("/trips/abc123/entries/entry456");
      const { container } = render(<BottomNav />);
      expect(container.innerHTML).toBe("");
    });

    it("should render on trip detail page", () => {
      mockPathname.mockReturnValue("/trips/abc123");
      const { container } = render(<BottomNav />);
      expect(container.innerHTML).not.toBe("");
    });

    it("should render on trip ranking page", () => {
      mockPathname.mockReturnValue("/trips/abc123/ranking");
      const { container } = render(<BottomNav />);
      expect(container.innerHTML).not.toBe("");
    });

    it("should render on home page", () => {
      mockPathname.mockReturnValue("/");
      const { container } = render(<BottomNav />);
      expect(container.innerHTML).not.toBe("");
    });
  });

  // -------------------------
  // Center button: trip page, member user
  // -------------------------
  describe("center button - trip page, member user", () => {
    it("navigates to entries/new when member clicks center button on trip page", async () => {
      mockPathname.mockReturnValue("/trips/abc123");
      mockUser.mockReturnValue({ id: "user1" });
      mockSingle.mockResolvedValue({ data: { role: "owner" }, error: null });

      render(<BottomNav />);

      // Flush useEffect, Promise.then(), and React state update
      await act(async () => {});

      const centerBtn = screen.getByLabelText("Add Photos");
      fireEvent.click(centerBtn);

      expect(mockRouterPush).toHaveBeenCalledWith("/trips/abc123/entries/new");
    });

    it("does NOT show popover when member clicks center button", async () => {
      mockPathname.mockReturnValue("/trips/abc123");
      mockUser.mockReturnValue({ id: "user1" });
      mockSingle.mockResolvedValue({ data: { role: "owner" }, error: null });

      render(<BottomNav />);

      await act(async () => {});

      const centerBtn = screen.getByLabelText("Add Photos");
      fireEvent.click(centerBtn);

      expect(
        screen.queryByText("You must be a member to add photos."),
      ).not.toBeInTheDocument();
    });
  });

  // -------------------------
  // Center button: trip page, non-member logged-in user
  // -------------------------
  describe("center button - trip page, non-member logged-in user", () => {
    it("shows member-only popover when non-member logged-in user clicks center button", async () => {
      mockPathname.mockReturnValue("/trips/abc123");
      mockUser.mockReturnValue({ id: "user1" });
      mockSingle.mockResolvedValue({ data: null, error: { message: "not found" } });

      render(<BottomNav />);

      await waitFor(() => {
        expect(mockSingle).toHaveBeenCalled();
      });

      const centerBtn = screen.getByLabelText("Add Photos");
      fireEvent.click(centerBtn);

      expect(
        screen.getByText("You must be a member to add photos."),
      ).toBeInTheDocument();
    });

    it("does NOT navigate when non-member logged-in user clicks center button", async () => {
      mockPathname.mockReturnValue("/trips/abc123");
      mockUser.mockReturnValue({ id: "user1" });
      mockSingle.mockResolvedValue({ data: null, error: { message: "not found" } });

      render(<BottomNav />);

      await waitFor(() => {
        expect(mockSingle).toHaveBeenCalled();
      });

      const centerBtn = screen.getByLabelText("Add Photos");
      fireEvent.click(centerBtn);

      expect(mockRouterPush).not.toHaveBeenCalled();
    });

    it("does NOT show LoginPrompt when non-member logged-in user clicks center button", async () => {
      mockPathname.mockReturnValue("/trips/abc123");
      mockUser.mockReturnValue({ id: "user1" });
      mockSingle.mockResolvedValue({ data: null, error: { message: "not found" } });

      render(<BottomNav />);

      await waitFor(() => {
        expect(mockSingle).toHaveBeenCalled();
      });

      const centerBtn = screen.getByLabelText("Add Photos");
      fireEvent.click(centerBtn);

      expect(screen.queryByTestId("login-prompt")).not.toBeInTheDocument();
    });
  });

  // -------------------------
  // Center button: trip page, non-logged-in user
  // -------------------------
  describe("center button - trip page, non-logged-in user", () => {
    it("shows LoginPrompt when non-logged-in user clicks center button on trip page", () => {
      mockPathname.mockReturnValue("/trips/abc123");
      mockUser.mockReturnValue(null);

      render(<BottomNav />);

      const centerBtn = screen.getByLabelText("Add Photos");
      fireEvent.click(centerBtn);

      expect(screen.getByTestId("login-prompt")).toBeInTheDocument();
    });

    it("does NOT navigate when non-logged-in user clicks center button on trip page", () => {
      mockPathname.mockReturnValue("/trips/abc123");
      mockUser.mockReturnValue(null);

      render(<BottomNav />);

      const centerBtn = screen.getByLabelText("Add Photos");
      fireEvent.click(centerBtn);

      expect(mockRouterPush).not.toHaveBeenCalled();
    });
  });

  // -------------------------
  // Center button: non-trip page
  // -------------------------
  describe("center button - non-trip page", () => {
    it("navigates to /trips/new when logged-in user clicks center button on home", () => {
      mockPathname.mockReturnValue("/");
      mockUser.mockReturnValue({ id: "user1" });

      render(<BottomNav />);

      const centerBtn = screen.getByLabelText("Add Trip");
      fireEvent.click(centerBtn);

      expect(mockRouterPush).toHaveBeenCalledWith("/trips/new");
    });

    it("shows LoginPrompt when non-logged-in user clicks center button on home", () => {
      mockPathname.mockReturnValue("/");
      mockUser.mockReturnValue(null);

      render(<BottomNav />);

      const centerBtn = screen.getByLabelText("Add Trip");
      fireEvent.click(centerBtn);

      expect(screen.getByTestId("login-prompt")).toBeInTheDocument();
    });
  });
});
