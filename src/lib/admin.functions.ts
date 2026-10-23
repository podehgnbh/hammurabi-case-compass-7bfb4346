import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const DOMAIN = "hammurabi.app";
const norm = (u: string) => u.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");

async function assertAdmin(supabase: any, userId: string) {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (!data) throw new Error("غير مصرح");
}

/** Public: true when no admin exists yet (first-run setup). */
export const needsSetup = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { count } = await supabaseAdmin
    .from("user_roles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");
  return { needsSetup: (count ?? 0) === 0 };
});

/** Public, but only works once: creates the very first admin account. */
export const setupAdmin = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({ full_name: z.string().min(2).max(120), username: z.string().min(3).max(40), password: z.string().min(6).max(100) })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) > 0) throw new Error("تم إعداد حساب المدير مسبقاً");
    const username = norm(data.username);
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: `${username}@${DOMAIN}`,
      password: data.password,
      email_confirm: true,
    });
    if (error || !created.user) throw new Error(error?.message ?? "فشل الإنشاء");
    await supabaseAdmin.from("profiles").insert({ id: created.user.id, full_name: data.full_name, username });
    await supabaseAdmin.from("user_roles").insert({ user_id: created.user.id, role: "admin" });
    return { ok: true, username };
  });

export const listLawyers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: roles } = await supabaseAdmin.from("user_roles").select("user_id").eq("role", "lawyer");
    const ids = (roles ?? []).map((r) => r.user_id);
    if (!ids.length) return { lawyers: [], stats: { clients: 0, cases: 0 } };
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, username, active, created_at")
      .in("id", ids)
      .order("created_at", { ascending: false });
    const [{ count: clients }, { count: cases }] = await Promise.all([
      supabaseAdmin.from("clients").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("cases").select("id", { count: "exact", head: true }),
    ]);
    return { lawyers: profiles ?? [], stats: { clients: clients ?? 0, cases: cases ?? 0 } };
  });

export const createLawyer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({ full_name: z.string().min(2).max(120), username: z.string().min(3).max(40), password: z.string().min(6).max(100) })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const username = norm(data.username);
    if (username.length < 3) throw new Error("اسم المستخدم يجب أن يكون بالأحرف الإنجليزية أو الأرقام");
    const { data: exists } = await supabaseAdmin.from("profiles").select("id").eq("username", username).maybeSingle();
    if (exists) throw new Error("اسم المستخدم مستخدم مسبقاً");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: `${username}@${DOMAIN}`,
      password: data.password,
      email_confirm: true,
    });
    if (error || !created.user) throw new Error(error?.message ?? "فشل إنشاء الحساب");
    await supabaseAdmin.from("profiles").insert({ id: created.user.id, full_name: data.full_name, username });
    await supabaseAdmin.from("user_roles").insert({ user_id: created.user.id, role: "lawyer" });
    return { full_name: data.full_name, username, password: data.password };
  });

export const setLawyerActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), active: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.auth.admin.updateUserById(data.id, { ban_duration: data.active ? "none" : "876000h" });
    await supabaseAdmin.from("profiles").update({ active: data.active }).eq("id", data.id);
    return { ok: true };
  });

export const resetLawyerPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), password: z.string().min(6).max(100) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.id, { password: data.password });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteLawyer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.auth.admin.deleteUser(data.id);
    return { ok: true };
  });
