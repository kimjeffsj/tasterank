export const DEMO_TRIP_IDS = [
  "00000000-0000-4000-a000-000000000010",
  "00000000-0000-4000-a000-000000000020",
] as const;

export const DEMO_USER_ID = "00000000-0000-4000-a000-000000000001";

export function isDemoTrip(tripId: string): boolean {
  return (DEMO_TRIP_IDS as readonly string[]).includes(tripId);
}
