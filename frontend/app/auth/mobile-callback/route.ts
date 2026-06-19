import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return new NextResponse(
      `<!DOCTYPE html><html><body><script>window.location.href="capapp://auth-callback?error=no_code";</script></body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll().map(({ name, value }) => ({ name, value }));
        },
        setAll() {},
      },
    }
  );

  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data?.session) {
      return new NextResponse(
        `<!DOCTYPE html><html><body><script>window.location.href="capapp://auth-callback?error=auth_failed";</script></body></html>`,
        { headers: { "Content-Type": "text/html" } }
      );
    }

    const { access_token, refresh_token } = data.session;

    return new NextResponse(
      `<!DOCTYPE html><html><body><script>window.location.href="capapp://auth-callback#access_token=${encodeURIComponent(access_token)}&refresh_token=${encodeURIComponent(refresh_token)}";</script></body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  } catch {
    return new NextResponse(
      `<!DOCTYPE html><html><body><script>window.location.href="capapp://auth-callback?error=exchange_failed";</script></body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }
}
