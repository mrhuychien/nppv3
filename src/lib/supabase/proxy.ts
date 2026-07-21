import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/data/database.types";
import { getSupabasePublicEnv, hasSupabasePublicEnv } from "@/lib/env";
import { fetchWithTimeout } from "@/lib/http/fetch-with-timeout";

const PUBLIC_PATHS = ["/login", "/auth", "/qr-login", "/health"] as const;

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export async function refreshSession(request: NextRequest) {
  if (!hasSupabasePublicEnv()) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const env = getSupabasePublicEnv();
  const supabase = createServerClient<Database>(env.url, env.publishableKey, {
    global: { fetch: fetchWithTimeout(8_000) },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // getClaims verifies the JWT signature; getSession must not authorize a user.
  const { data, error } = await supabase.auth.getClaims();
  const isAuthenticated = !error && Boolean(data?.claims?.sub);
  const publicPath = isPublicPath(request.nextUrl.pathname);

  if (!isAuthenticated && !publicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (isAuthenticated && request.nextUrl.pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/orders";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
