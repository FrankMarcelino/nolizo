import { clerkMiddleware } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;

  // Rotas publicas — as rotas de API cuidam da propria autenticacao via getSession()
  if (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/")
  ) {
    return NextResponse.next();
  }

  const { userId, getToken } = await auth();

  if (!userId) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // O onboarding e onde a familia e criada — nao checar familia aqui
  if (pathname.startsWith("/onboarding")) {
    return NextResponse.next();
  }

  // Token do Clerk repassado ao Supabase: as politicas de RLS leem auth.jwt()->>'sub'
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { accessToken: async () => (await getToken()) ?? null }
  );

  // Filtrar por user_id explicitamente. Confiar so no RLS quebraria quando a
  // familia tiver mais de um membro: maybeSingle() lanca erro com 2+ linhas.
  const { data: member, error } = await supabase
    .from("family_members")
    .select("id")
    .eq("user_id", userId)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    console.error("middleware: falha ao consultar family_members", error);
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (!member) {
    const url = request.nextUrl.clone();
    url.pathname = "/onboarding";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
