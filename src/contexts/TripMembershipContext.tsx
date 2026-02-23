"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";

interface TripMembershipContextValue {
  isMember: boolean;
  role: "owner" | "editor" | "viewer" | null;
}

const defaultValue: TripMembershipContextValue = {
  isMember: false,
  role: null,
};

export const TripMembershipContext =
  createContext<TripMembershipContextValue>(defaultValue);

interface TripMembershipProviderProps {
  isMember: boolean;
  role: "owner" | "editor" | "viewer" | null;
  children: ReactNode;
}

export function TripMembershipProvider({
  isMember,
  role,
  children,
}: TripMembershipProviderProps) {
  return (
    <TripMembershipContext.Provider value={{ isMember, role }}>
      {children}
    </TripMembershipContext.Provider>
  );
}

export function useTripMembership(): TripMembershipContextValue {
  return useContext(TripMembershipContext);
}
