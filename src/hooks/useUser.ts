"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useUser() {
    const [session, setSession] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        let mounted = true;

        async function getProfile(userId: string) {
            const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
            if (mounted) setProfile(data);
        }

        supabase.auth.getSession().then(({ data: { session } }) => {
            if (mounted) {
                setSession(session);
                if (session?.user) getProfile(session.user.id);
                else setLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (mounted) {
                setSession(session);
                if (session?.user) getProfile(session.user.id);
                else {
                    setProfile(null);
                    setLoading(false);
                }
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // Set loading to false once profile is fetched if session exists
    useEffect(() => {
        if (session && profile !== null) {
            setLoading(false);
        }
    }, [session, profile]);

    return {
        session,
        user: session?.user ? { ...session.user, role: profile?.role } : null,
        loading
    };
}
