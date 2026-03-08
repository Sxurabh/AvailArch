import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    const { searchParams, origin, hash } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/';

    // Handle code-based flow (default Supabase flow)
    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            return NextResponse.redirect(`${origin}${next}`);
        } else {
            console.error("Auth callback error:", error);
        }
    }

    // Handle hash-based token flow (for magic links with tokens in hash)
    if (hash) {
        const hashParams = new URLSearchParams(hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
            // Create response with redirect
            const response = NextResponse.redirect(`${origin}${next}`);

            // Set Supabase auth cookies directly
            response.cookies.set('sb-access-token', accessToken, {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 3600,
            });

            response.cookies.set('sb-refresh-token', refreshToken, {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 30 * 24 * 3600,
            });

            return response;
        }
    }

    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
