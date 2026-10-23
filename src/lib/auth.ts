import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const USER_DOMAIN = "hammurabi.app";

export function normalizeUsername(u: string) {
  return u.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
}

export function usernameToEmail(u: string) {
  return `${normalizeUsername(u)}@${USER_DOMAIN}`;
}

export type Me = {
  id: string;
  full_name: string;
  username: string;
  isAdmin: boolean;
};

export function useMe() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) {
        if (alive) setLoading(false);
        return;
      }
      const [{ data: profile }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("full_name, username").eq("id", user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id),
      ]);
      if (!alive) return;
      setMe({
        id: user.id,
        full_name: profile?.full_name ?? "",
        username: profile?.username ?? "",
        isAdmin: !!roles?.some((r) => r.role === "admin"),
      });
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);
  return { me, loading };
}
