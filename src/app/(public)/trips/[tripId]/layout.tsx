import { createClient } from "@/lib/supabase/server";
import { TripMembershipProvider } from "@/contexts/TripMembershipContext";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  params: Promise<{ tripId: string }>;
}

export default async function TripLayout({ children, params }: Props) {
  const { tripId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isMember = false;
  let role: "owner" | "editor" | "viewer" | null = null;

  if (user) {
    const { data: member } = await supabase
      .from("trip_members")
      .select("role")
      .eq("trip_id", tripId)
      .eq("user_id", user.id)
      .single();

    if (member) {
      isMember = true;
      role = member.role as "owner" | "editor" | "viewer";
    }
  }

  return (
    <TripMembershipProvider isMember={isMember} role={role}>
      {children}
    </TripMembershipProvider>
  );
}
