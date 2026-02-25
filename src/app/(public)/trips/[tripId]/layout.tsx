import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function TripLayout({ children }: Props) {
  return <>{children}</>;
}
