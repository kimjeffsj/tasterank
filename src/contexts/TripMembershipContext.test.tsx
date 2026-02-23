import { render, screen, renderHook } from "@testing-library/react";
import React from "react";
import {
  TripMembershipContext,
  TripMembershipProvider,
  useTripMembership,
} from "./TripMembershipContext";

describe("TripMembershipContext", () => {
  describe("useTripMembership - default values without Provider", () => {
    it("returns default isMember=false when no Provider is present", () => {
      const { result } = renderHook(() => useTripMembership());
      expect(result.current.isMember).toBe(false);
    });

    it("returns default role=null when no Provider is present", () => {
      const { result } = renderHook(() => useTripMembership());
      expect(result.current.role).toBeNull();
    });

    it("does NOT throw when used outside Provider", () => {
      expect(() => renderHook(() => useTripMembership())).not.toThrow();
    });
  });

  describe("useTripMembership - provided values", () => {
    it("returns isMember=true when wrapped in provider with isMember=true", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TripMembershipProvider isMember={true} role="owner">
          {children}
        </TripMembershipProvider>
      );

      const { result } = renderHook(() => useTripMembership(), { wrapper });
      expect(result.current.isMember).toBe(true);
    });

    it("returns role='owner' when wrapped in provider with role=owner", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TripMembershipProvider isMember={true} role="owner">
          {children}
        </TripMembershipProvider>
      );

      const { result } = renderHook(() => useTripMembership(), { wrapper });
      expect(result.current.role).toBe("owner");
    });

    it("returns role='editor' when wrapped in provider with role=editor", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TripMembershipProvider isMember={true} role="editor">
          {children}
        </TripMembershipProvider>
      );

      const { result } = renderHook(() => useTripMembership(), { wrapper });
      expect(result.current.role).toBe("editor");
    });

    it("returns role='viewer' when wrapped in provider with role=viewer", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TripMembershipProvider isMember={false} role="viewer">
          {children}
        </TripMembershipProvider>
      );

      const { result } = renderHook(() => useTripMembership(), { wrapper });
      expect(result.current.role).toBe("viewer");
    });

    it("returns isMember=false and role=null when provider has isMember=false and role=null", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TripMembershipProvider isMember={false} role={null}>
          {children}
        </TripMembershipProvider>
      );

      const { result } = renderHook(() => useTripMembership(), { wrapper });
      expect(result.current.isMember).toBe(false);
      expect(result.current.role).toBeNull();
    });
  });

  describe("TripMembershipProvider - renders children correctly", () => {
    it("renders children when provided", () => {
      render(
        <TripMembershipProvider isMember={true} role="owner">
          <span>child content</span>
        </TripMembershipProvider>
      );

      expect(screen.getByText("child content")).toBeInTheDocument();
    });

    it("renders multiple children", () => {
      render(
        <TripMembershipProvider isMember={false} role={null}>
          <span>first child</span>
          <span>second child</span>
        </TripMembershipProvider>
      );

      expect(screen.getByText("first child")).toBeInTheDocument();
      expect(screen.getByText("second child")).toBeInTheDocument();
    });
  });
});
