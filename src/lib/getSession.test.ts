import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));
vi.mock("./supabaseAdmin", () => ({
  createSupabaseAdminClient: vi.fn(),
}));

import { getSession, getSessionWithFamily } from "./getSession";
import { createSupabaseServerClient } from "./supabase/server";
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

function fakeServer(user: unknown, error: unknown = null) {
  return { auth: { getUser: async () => ({ data: { user }, error }) } };
}

const USER = {
  id: "11111111-1111-1111-1111-111111111111",
  email: "frank@example.com",
  user_metadata: { name: "Frank" },
};

beforeEach(() => {
  vi.mocked(createSupabaseServerClient).mockReset();
  vi.mocked(createSupabaseAdminClient).mockReset();
});

describe("getSession — contrato consumido pelas 14 rotas de API", () => {
  it("devolve userId, familyId, email e name quando ha familia", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      fakeServer(USER) as never
    );
    vi.mocked(createSupabaseAdminClient).mockReturnValue(
      fakeAdmin({ family_id: "fam-1" }) as never
    );

    const session = await getSession();

    expect(session).toEqual({
      userId: "11111111-1111-1111-1111-111111111111",
      familyId: "fam-1",
      email: "frank@example.com",
      name: "Frank",
    });
  });

  it("devolve familyId null quando o usuario nao tem familia", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      fakeServer(USER) as never
    );
    vi.mocked(createSupabaseAdminClient).mockReturnValue(
      fakeAdmin(null) as never
    );

    const session = await getSession();

    expect(session.familyId).toBeNull();
    expect(session.userId).toBe("11111111-1111-1111-1111-111111111111");
  });

  it("lanca erro 401 quando nao ha usuario autenticado", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      fakeServer(null) as never
    );
    vi.mocked(createSupabaseAdminClient).mockReturnValue(
      fakeAdmin(null) as never
    );

    await expect(getSession()).rejects.toMatchObject({ status: 401 });
  });
});

describe("getSessionWithFamily", () => {
  it("lanca erro 403 quando o usuario nao tem familia", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      fakeServer(USER) as never
    );
    vi.mocked(createSupabaseAdminClient).mockReturnValue(
      fakeAdmin(null) as never
    );

    await expect(getSessionWithFamily()).rejects.toMatchObject({ status: 403 });
  });

  it("devolve a sessao com familyId garantido quando ha familia", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      fakeServer(USER) as never
    );
    vi.mocked(createSupabaseAdminClient).mockReturnValue(
      fakeAdmin({ family_id: "fam-1" }) as never
    );

    const session = await getSessionWithFamily();

    expect(session.familyId).toBe("fam-1");
  });
});
