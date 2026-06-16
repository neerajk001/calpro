import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/settings";

  // Pre-create the redirect response so we can set cookies on it
  const response = NextResponse.redirect(`${origin}${next}`);

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll().map(({ name, value }) => ({ name, value }));
          },
          setAll(cookiesToSet) {
            console.log("auth/callback setAll called with:", cookiesToSet.map(c => ({ name: c.name, options: c.options })));
            cookiesToSet.forEach(({ name, value, options }) => {
              const adjustedOptions = {
                ...options,
                secure: process.env.NODE_ENV === "production" ? options.secure : false,
              };
              response.cookies.set(name, value, adjustedOptions);
            });
          },
        },
      }
    );

    console.log("Exchanging code for session...");
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      console.log("Code exchange successful, redirecting to", next);
      return response;
    }
    console.error("Supabase code exchange error:", error);
  } else {
    console.log("No code parameter found in callback URL");
  }

  return NextResponse.redirect(`${origin}/settings?auth_error=true`);
}
