import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}));
vi.mock("./supabaseAdmin", () => ({
  createSupabaseAdminClient: vi.fn(),
}));

import { auth, currentUser } from "@clerk/nextjs/server";
import { getSession, getSessionWithFamily } from "./getSession";
import { createSupabaseAdminClient } from "./supabaseAdmin";

type Member = { family_id: string } | null;

function fakeAdmin(member: Member) {
  const chain = {
    select: () => chain,
    eq: () => chain,
    maybeSingle: async () => ({ data: member, error: null }),
  };
  return { from: () => chain };
}

const CLERK_USER_ID = "user_2abcDEF";

const CLERK_USER = {
  primaryEmailAddress: { emailAddress: "frank@example.com" },
  fullName: "Frank",
};

function signedIn() {
  vi.mocked(auth).mockResolvedValue({ userId: CLERK_USER_ID } as never);
  vi.mocked(currentUser).mockResolvedValue(CLERK_USER as never);
}

function signedOut() {
  vi.mocked(auth).mockResolvedValue({ userId: null } as never);
  vi.mocked(currentUser).mockResolvedValue(null as never);
}

beforeEach(() => {
  vi.mocked(auth).mockReset();
  vi.mocked(currentUser).mockReset();
  vi.mocked(createSupabaseAdminClient).mockReset();
});

describe("getSession — contrato consumido pelas 14 rotas de API", () => {
  it("devolve userId, familyId, email e name quando ha familia", async () => {
    signedIn();
    vi.mocked(createSupabaseAdminClient).mockReturnValue(
      fakeAdmin({ family_id: "fam-1" }) as never
    );

    const session = await getSession();

    expect(session).toEqual({
      userId: CLERK_USER_ID,
      familyId: "fam-1",
      email: "frank@example.com",
      name: "Frank",
    });
  });

  it("devolve familyId null quando o usuario nao tem familia", async () => {
    signedIn();
    vi.mocked(createSupabaseAdminClient).mockReturnValue(
      fakeAdmin(null) as never
    );

    const session = await getSession();

    expect(session.familyId).toBeNull();
    expect(session.userId).toBe(CLERK_USER_ID);
  });

  it("lanca erro 401 quando nao ha usuario autenticado", async () => {
    signedOut();
    vi.mocked(createSupabaseAdminClient).mockReturnValue(
      fakeAdmin(null) as never
    );

    await expect(getSession()).rejects.toMatchObject({ status: 401 });
  });
});

describe("getSessionWithFamily", () => {
  it("lanca erro 403 quando o usuario nao tem familia", async () => {
    signedIn();
    vi.mocked(createSupabaseAdminClient).mockReturnValue(
      fakeAdmin(null) as never
    );

    await expect(getSessionWithFamily()).rejects.toMatchObject({ status: 403 });
  });

  it("devolve a sessao com familyId garantido quando ha familia", async () => {
    signedIn();
    vi.mocked(createSupabaseAdminClient).mockReturnValue(
      fakeAdmin({ family_id: "fam-1" }) as never
    );

    const session = await getSessionWithFamily();

    expect(session.familyId).toBe("fam-1");
  });
});
