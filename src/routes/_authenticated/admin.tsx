import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, KeyRound, Loader2, Trash2, UserPlus, Users, Briefcase, FolderOpen, Wand2 } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { createLawyer, deleteLawyer, listLawyers, resetLawyerPassword, setLawyerActive } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "لوحة الإدارة — حمورابي" }, { name: "description", content: "إدارة حسابات المحامين." }] }),
  component: Admin,
});

function randomPass() {
  const c = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  return Array.from(crypto.getRandomValues(new Uint32Array(10)), (n) => c[n % c.length]).join("");
}

function Admin() {
  const qc = useQueryClient();
  const list = useServerFn(listLawyers);
  const create = useServerFn(createLawyer);
  const toggle = useServerFn(setLawyerActive);
  const reset = useServerFn(resetLawyerPassword);
  const del = useServerFn(deleteLawyer);
  const { data, isLoading, error } = useQuery({ queryKey: ["lawyers"], queryFn: () => list() });
  const [f, setF] = useState({ full_name: "", username: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ full_name: string; username: string; password: string } | null>(null);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const link = (u: string) => `${origin}/auth?u=${encodeURIComponent(u)}`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await create({ data: f });
      setResult(r);
      setF({ full_name: "", username: "", password: "" });
      qc.invalidateQueries({ queryKey: ["lawyers"] });
      toast.success("تم توليد حساب المحامي");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("تم النسخ");
  }

  if (error) return <div className="rounded-2xl border border-destructive/40 p-6 text-destructive">هذه الصفحة للمدير فقط.</div>;

  const card = result
    ? `حمورابي — بيانات الدخول\nالاسم: ${result.full_name}\nاسم المستخدم: ${result.username}\nكلمة المرور: ${result.password}\nرابط الدخول: ${link(result.username)}`
    : "";

  return (
    <div>
      <PageHeader title="لوحة الإدارة" subtitle="توليد حسابات المحامين والتحكم بها" />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          { icon: Users, label: "المحامون", v: data?.lawyers.length ?? 0 },
          { icon: FolderOpen, label: "الموكلون", v: data?.stats.clients ?? 0 },
          { icon: Briefcase, label: "القضايا", v: data?.stats.cases ?? 0 },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <s.icon className="size-5 text-primary" />
            <div className="mt-3 font-display text-3xl">{s.v}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card lg:col-span-2">
          <h2 className="flex items-center gap-2 text-xl"><UserPlus className="size-5 text-primary" /> محامٍ جديد</h2>
          <div className="space-y-2"><Label>الاسم الكامل للمحامي</Label><Input value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} required /></div>
          <div className="space-y-2"><Label>اسم المستخدم (إنجليزي)</Label><Input dir="ltr" value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} required placeholder="ahmed.ali" /></div>
          <div className="space-y-2">
            <Label>كلمة المرور</Label>
            <div className="flex gap-2">
              <Input dir="ltr" value={f.password} minLength={6} onChange={(e) => setF({ ...f, password: e.target.value })} required />
              <Button type="button" variant="outline" size="icon" onClick={() => setF({ ...f, password: randomPass() })} title="كلمة مرور عشوائية"><Wand2 /></Button>
            </div>
          </div>
          <Button variant="gold" className="h-11 w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />} توليد</Button>

          {result && (
            <div className="rounded-xl border border-primary/40 bg-primary/8 p-4 text-sm">
              <div className="mb-2 font-semibold text-primary">تم توليد الحساب</div>
              <div className="space-y-1">
                <div>الاسم: {result.full_name}</div>
                <div>اسم المستخدم: <span dir="ltr">{result.username}</span></div>
                <div>كلمة المرور: <span dir="ltr">{result.password}</span></div>
                <div className="break-all text-xs text-muted-foreground" dir="ltr">{link(result.username)}</div>
              </div>
              <Button type="button" size="sm" variant="outline" className="mt-3 w-full" onClick={() => copy(card)}><Copy /> نسخ البيانات والرابط</Button>
            </div>
          )}
        </form>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card lg:col-span-3">
          <h2 className="mb-4 text-xl">قائمة المحامين</h2>
          {isLoading ? (
            <Loader2 className="animate-spin text-primary" />
          ) : !data?.lawyers.length ? (
            <p className="text-sm text-muted-foreground">لا يوجد محامون بعد.</p>
          ) : (
            <div className="divide-y divide-border">
              {data.lawyers.map((l) => (
                <div key={l.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div className="font-medium">{l.full_name}</div>
                    <div className="text-xs text-muted-foreground" dir="ltr">@{l.username}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={l.active ? "text-xs text-success" : "text-xs text-destructive"}>{l.active ? "مفعّل" : "موقوف"}</span>
                    <Switch
                      checked={l.active}
                      onCheckedChange={async (v) => {
                        await toggle({ data: { id: l.id, active: v } });
                        qc.invalidateQueries({ queryKey: ["lawyers"] });
                        toast.success(v ? "تم تفعيل الحساب" : "تم إيقاف الحساب");
                      }}
                    />
                    <Button size="icon" variant="ghost" title="نسخ رابط الدخول" onClick={() => copy(link(l.username))}><Copy /></Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      title="كلمة مرور جديدة"
                      onClick={async () => {
                        const p = prompt("كلمة المرور الجديدة", randomPass());
                        if (!p) return;
                        await reset({ data: { id: l.id, password: p } });
                        copy(`اسم المستخدم: ${l.username}\nكلمة المرور: ${p}\n${link(l.username)}`);
                      }}
                    ><KeyRound /></Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      onClick={async () => {
                        if (!confirm(`حذف حساب ${l.full_name} نهائياً؟`)) return;
                        await del({ data: { id: l.id } });
                        qc.invalidateQueries({ queryKey: ["lawyers"] });
                      }}
                    ><Trash2 /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
