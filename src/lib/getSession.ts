import { auth, currentUser } from "@clerk/nextjs/server";
import { createSupabaseAdminClient } from "./supabaseAdmin";

export type Session = {
  userId: string;
  familyId: string | null;
  email: string | null;
  name: string | null;
};

/**
 * Returns the authenticated user and their linked family (if any).
 * Throws a 401 error if the user is not authenticated.
 */
export async function getSession(): Promise<Session> {
  const { userId } = await auth();

  if (!userId) {
    const err = new Error("Unauthorized") as Error & { status: number };
    err.status = 401;
    throw err;
  }

  const user = await currentUser();

  const admin = createSupabaseAdminClient();
  const { data: member } = await admin
    .from("family_members")
    .select("family_id")
    .eq("user_id", userId)
    .eq("active", true)
    .maybeSingle();

  return {
    userId,
    familyId: member?.family_id ?? null,
    email: user?.primaryEmailAddress?.emailAddress ?? null,
    name: user?.fullName ?? null,
  };
}

/**
 * Like getSession(), but throws 403 if the user has no linked family.
 */
export async function getSessionWithFamily(): Promise<
  Session & { familyId: string }
> {
  const session = await getSession();
  if (!session.familyId) {
    const err = new Error("No family linked") as Error & { status: number };
    err.status = 403;
    throw err;
  }
  return session as Session & { familyId: string };
}
