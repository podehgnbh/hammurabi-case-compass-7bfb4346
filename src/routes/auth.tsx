import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Lock, User } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { usernameToEmail } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brand } from "@/components/AppShell";
import { needsSetup } from "@/lib/admin.functions";

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({ u: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "تسجيل الدخول — حمورابي" },
      { name: "description", content: "سجّل دخولك إلى منصة حمورابي باسم المستخدم وكلمة المرور." },
      { property: "og:title", content: "تسجيل الدخول — حمورابي" },
      { property: "og:description", content: "دخول المحامين إلى منصة حمورابي." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { u } = Route.useSearch();
  const navigate = useNavigate();
  const [username, setUsername] = useState(u ?? "");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [setup, setSetup] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/dashboard", replace: true });
    });
    needsSetup().then((r) => setSetup(r.needsSetup)).catch(() => {});
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: usernameToEmail(username), password });
    setBusy(false);
    if (error) {
      toast.error(/banned/i.test(error.message) ? "تم إيقاف هذا الحساب، راجع إدارة المنصة" : "اسم المستخدم أو كلمة المرور غير صحيحة");
      return;
    }
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <div className="grid min-h-screen place-items-center bg-hero px-4 pattern-babylon">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><Brand /></div>
        <form onSubmit={submit} className="rounded-3xl border border-border bg-card/90 p-8 shadow-card backdrop-blur">
          <h1 className="text-2xl">أهلاً بك مجدداً</h1>
          <p className="mt-1 text-sm text-muted-foreground">أدخل بيانات حسابك للدخول إلى مكتبك</p>
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="u">اسم المستخدم</Label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="u" dir="ltr" className="h-11 pr-10 text-left" value={username} onChange={(e) => setUsername(e.target.value)} required autoComplete="username" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="p">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="p" type="password" dir="ltr" className="h-11 pr-10 text-left" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
              </div>
            </div>
          </div>
          <Button type="submit" variant="gold" className="mt-6 h-11 w-full" disabled={busy}>
            {busy && <Loader2 className="animate-spin" />} دخول
          </Button>
          {setup && (
            <p className="mt-5 text-center text-xs text-muted-foreground">
              أول مرة؟ <Link to="/setup" className="text-primary hover:underline">إنشاء حساب المدير</Link>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
