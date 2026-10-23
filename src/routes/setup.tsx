import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { needsSetup, setupAdmin } from "@/lib/admin.functions";
import { usernameToEmail } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brand } from "@/components/AppShell";

export const Route = createFileRoute("/setup")({
  head: () => ({
    meta: [
      { title: "إعداد المدير — حمورابي" },
      { name: "description", content: "إنشاء حساب المدير الأول لمنصة حمورابي." },
      { property: "og:title", content: "إعداد المدير — حمورابي" },
      { property: "og:description", content: "الإعداد الأولي لمنصة حمورابي." },
    ],
  }),
  component: Setup,
});

function Setup() {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [f, setF] = useState({ full_name: "", username: "", password: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    needsSetup().then((r) => setAllowed(r.needsSetup));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await setupAdmin({ data: f });
      await supabase.auth.signInWithPassword({ email: usernameToEmail(r.username), password: f.password });
      toast.success("تم إنشاء حساب المدير");
      navigate({ to: "/admin", replace: true });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-hero px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><Brand /></div>
        {allowed === false ? (
          <div className="rounded-3xl border border-border bg-card p-8 text-center">تم إعداد المنصة مسبقاً.</div>
        ) : (
          <form onSubmit={submit} className="space-y-4 rounded-3xl border border-border bg-card p-8 shadow-card">
            <h1 className="text-2xl">إنشاء حساب المدير</h1>
            <p className="text-sm text-muted-foreground">هذه الخطوة تتم مرة واحدة فقط.</p>
            <div className="space-y-2"><Label>الاسم الكامل</Label><Input value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} required /></div>
            <div className="space-y-2"><Label>اسم المستخدم (بالإنجليزية)</Label><Input dir="ltr" value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} required /></div>
            <div className="space-y-2"><Label>كلمة المرور</Label><Input dir="ltr" type="password" minLength={6} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required /></div>
            <Button variant="gold" className="h-11 w-full" disabled={busy || allowed === null}>{busy && <Loader2 className="animate-spin" />} إنشاء</Button>
          </form>
        )}
      </div>
    </div>
  );
}
