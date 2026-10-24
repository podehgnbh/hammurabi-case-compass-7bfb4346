import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Briefcase, CalendarClock, Loader2, Pencil, Phone, Plus, StickyNote, Trash2, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientForm, type ClientRow } from "@/components/ClientForm";
import { CaseForm, type CaseRow } from "@/components/CaseForm";
import { FilesPanel, signedUrl } from "@/components/FilesPanel";
import { formatDate, formatDateTime, money } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/clients/$clientId")({
  head: () => ({ meta: [{ title: "ملف الموكل — حمورابي" }] }),
  component: ClientFolder,
});

function ClientFolder() {
  const { clientId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [editClient, setEditClient] = useState(false);
  const [caseForm, setCaseForm] = useState<{ open: boolean; initial?: CaseRow }>({ open: false });
  const [fee, setFee] = useState({ kind: "payment", amount: "", note: "" });
  const [note, setNote] = useState("");

  const { data: client, isLoading } = useQuery({
    queryKey: ["client", clientId],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("*").eq("id", clientId).maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return { ...data, photo: data.photo_path ? await signedUrl(data.photo_path) : "" };
    },
  });

  const { data: cases = [] } = useQuery({
    queryKey: ["cases", clientId],
    queryFn: async () => (await supabase.from("cases").select("*").eq("client_id", clientId).order("created_at", { ascending: false })).data ?? [],
  });

  const { data: fees = [] } = useQuery({
    queryKey: ["fees", clientId],
    queryFn: async () => (await supabase.from("fees").select("*").eq("client_id", clientId).order("entry_date", { ascending: false })).data ?? [],
  });

  const { data: notes = [] } = useQuery({
    queryKey: ["notes", clientId],
    queryFn: async () => (await supabase.from("notes").select("*").eq("client_id", clientId).is("case_id", null).order("created_at", { ascending: false })).data ?? [],
  });

  const agreed = fees.filter((f) => f.kind === "agreement").reduce((a, f) => a + Number(f.amount), 0);
  const paid = fees.filter((f) => f.kind === "payment").reduce((a, f) => a + Number(f.amount), 0);

  async function addFee(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("fees").insert({ client_id: clientId, kind: fee.kind, amount: Number(fee.amount), note: fee.note || null });
    if (error) { toast.error(error.message); return; }
    setFee({ kind: "payment", amount: "", note: "" });
    qc.invalidateQueries({ queryKey: ["fees", clientId] });
    toast.success("تمت الإضافة");
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    const { error } = await supabase.from("notes").insert({ client_id: clientId, content: note.trim() });
    if (error) { toast.error(error.message); return; }
    setNote("");
    qc.invalidateQueries({ queryKey: ["notes", clientId] });
  }

  if (isLoading) return <div className="grid place-items-center py-24"><Loader2 className="size-8 animate-spin text-primary" /></div>;
  if (!client) return <div className="rounded-2xl border border-border p-10 text-center text-muted-foreground">الموكل غير موجود.</div>;

  const info: [string, string | null][] = [
    ["اسم الأم", client.mother_name], ["تاريخ الميلاد", client.birth_date ? formatDate(client.birth_date) : null],
    ["رقم البطاقة الوطنية", client.national_id], ["الهاتف", client.phone], ["البريد", client.email],
    ["المهنة", client.occupation], ["العنوان", client.address],
  ];

  return (
    <div>
      <Link to="/clients" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"><ArrowRight className="size-4" /> كل الموكلين</Link>
      <PageHeader
        title={client.full_name}
        subtitle={client.phone ? `هاتف: ${client.phone}` : undefined}
        actions={<Button variant="outline" onClick={() => setEditClient(true)}><Pencil /> تعديل البيانات</Button>}
      />

      <div className="mb-8 flex flex-wrap items-center gap-6 rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-2xl border-2 border-primary/40 bg-secondary font-display text-4xl text-primary">
          {client.photo ? <img src={client.photo} alt="" className="size-full object-cover" /> : client.full_name[0]}
        </div>
        <div className="grid flex-1 gap-x-8 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {info.filter(([, v]) => v).map(([k, v]) => (
            <div key={k}><span className="text-muted-foreground">{k}: </span><span className="font-medium">{v}</span></div>
          ))}
        </div>
      </div>

      <Tabs defaultValue="cases" dir="rtl">
        <TabsList className="mb-6 flex h-auto w-full flex-wrap justify-start gap-1 bg-secondary/60 p-1.5">
          <TabsTrigger value="cases" className="gap-1.5"><Briefcase className="size-4" /> القضايا ({cases.length})</TabsTrigger>
          <TabsTrigger value="fees" className="gap-1.5"><Wallet className="size-4" /> عقد الأتعاب والمالية</TabsTrigger>
          <TabsTrigger value="docs" className="gap-1.5"><Phone className="size-4" /> مستندات عامة</TabsTrigger>
          <TabsTrigger value="notes" className="gap-1.5"><StickyNote className="size-4" /> ملاحظات ({notes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="cases" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="gold" onClick={() => setCaseForm({ open: true })}><Plus /> قضية جديدة</Button>
          </div>
          {cases.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">لا توجد قضايا لهذا الموكل بعد.</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {cases.map((c) => (
                <div key={c.id} className="rounded-2xl border border-border bg-card p-5 shadow-card transition hover:border-primary/50">
                  <Link to="/cases/$caseId" params={{ caseId: c.id }} className="block">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="font-semibold">{c.title}</h3>
                      <span className="shrink-0 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs text-primary">{c.status}</span>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      {c.case_number && <div>رقم الدعوى: <span dir="ltr">{c.case_number}</span></div>}
                      {c.court && <div>{c.court}</div>}
                      {c.next_session && <div className="flex items-center gap-1 text-primary"><CalendarClock className="size-3.5" /> الجلسة القادمة: {formatDateTime(c.next_session)}</div>}
                    </div>
                  </Link>
                  <div className="mt-3 flex justify-end gap-1 border-t border-border pt-3">
                    <Button size="sm" variant="ghost" onClick={() => setCaseForm({ open: true, initial: c })}><Pencil /> تعديل</Button>
                    <Button
                      size="sm" variant="ghost" className="text-destructive"
                      onClick={async () => {
                        if (!confirm(`حذف قضية «${c.title}» وجلساتها وملاحظاتها؟`)) return;
                        const { error } = await supabase.from("cases").delete().eq("id", c.id);
                        if (error) { toast.error(error.message); return; }
                        qc.invalidateQueries({ queryKey: ["cases", clientId] });
                      }}
                    ><Trash2 /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="fees" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "الأتعاب المتفق عليها", v: money(agreed) },
              { label: "المستلم", v: money(paid) },
              { label: "المتبقي", v: money(agreed - paid) },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="text-sm text-muted-foreground">{s.label}</div>
                <div className="mt-2 font-display text-2xl">{s.v}</div>
              </div>
            ))}
          </div>
          <form onSubmit={addFee} className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="space-y-1.5">
              <label className="text-sm">النوع</label>
              <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={fee.kind} onChange={(e) => setFee({ ...fee, kind: e.target.value })}>
                <option value="agreement">اتفاق أتعاب</option>
                <option value="payment">دفعة مستلمة</option>
                <option value="expense">مصروف</option>
              </select>
            </div>
            <div className="space-y-1.5"><label className="text-sm">المبلغ (د.ع)</label><Input dir="ltr" type="number" min="0" required value={fee.amount} onChange={(e) => setFee({ ...fee, amount: e.target.value })} /></div>
            <div className="min-w-48 flex-1 space-y-1.5"><label className="text-sm">ملاحظة</label><Input value={fee.note} onChange={(e) => setFee({ ...fee, note: e.target.value })} /></div>
            <Button variant="gold">إضافة</Button>
          </form>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            {fees.length === 0 ? (
              <p className="p-8 text-center text-sm text-muted-foreground">لا توجد قيود مالية بعد.</p>
            ) : (
              <div className="divide-y divide-border">
                {fees.map((f) => (
                  <div key={f.id} className="flex items-center justify-between gap-3 p-4 text-sm">
                    <div>
                      <span className={f.kind === "payment" ? "text-success" : f.kind === "expense" ? "text-destructive" : "text-primary"}>
                        {f.kind === "agreement" ? "اتفاق أتعاب" : f.kind === "payment" ? "دفعة مستلمة" : "مصروف"}
                      </span>
                      {f.note && <span className="mr-2 text-muted-foreground">— {f.note}</span>}
                      <div className="text-xs text-muted-foreground">{formatDate(f.entry_date)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{money(Number(f.amount))}</span>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={async () => { await supabase.from("fees").delete().eq("id", f.id); qc.invalidateQueries({ queryKey: ["fees", clientId] }); }}><Trash2 /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <FilesPanel clientId={clientId} section="fees" title="عقد الأتعاب والوصولات" hint="ارفع هنا عقد الأتعاب الموقّع ووصولات القبض" />
        </TabsContent>

        <TabsContent value="docs">
          <FilesPanel clientId={clientId} section="general" title="مستندات الموكل العامة" hint="هويات، وكالات، وأي مستند لا يخص قضية محددة" />
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <form onSubmit={addNote} className="flex gap-2">
            <Textarea rows={2} className="flex-1" placeholder="ملاحظة سريعة عن الموكل..." value={note} onChange={(e) => setNote(e.target.value)} />
            <Button variant="gold" className="self-end">إضافة</Button>
          </form>
          {notes.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">لا توجد ملاحظات.</p>
          ) : (
            <div className="space-y-2">
              {notes.map((n) => (
                <div key={n.id} className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-4 text-sm">
                  <div><p className="whitespace-pre-wrap">{n.content}</p><div className="mt-1 text-xs text-muted-foreground">{formatDateTime(n.created_at)}</div></div>
                  <Button size="icon" variant="ghost" className="shrink-0 text-destructive" onClick={async () => { await supabase.from("notes").delete().eq("id", n.id); qc.invalidateQueries({ queryKey: ["notes", clientId] }); }}><Trash2 /></Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {editClient && <ClientForm open={editClient} onOpenChange={setEditClient} initial={client as ClientRow} onSaved={() => qc.invalidateQueries({ queryKey: ["client", clientId] })} />}
      {caseForm.open && (
        <CaseForm
          open={caseForm.open}
          onOpenChange={(v) => setCaseForm({ open: v })}
          clientId={clientId}
          initial={caseForm.initial}
          onSaved={(id) => { qc.invalidateQueries({ queryKey: ["cases", clientId] }); if (!caseForm.initial) navigate({ to: "/cases/$caseId", params: { caseId: id } }); }}
        />
      )}
    </div>
  );
}
