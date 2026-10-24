import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, CalendarClock, Loader2, Pencil, Plus, Sparkles, StickyNote, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CaseForm } from "@/components/CaseForm";
import { FilesPanel } from "@/components/FilesPanel";
import { analyzeCase } from "@/lib/ai.functions";
import { formatDate, formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/cases/$caseId")({
  head: () => ({ meta: [{ title: "القضية — حمورابي" }] }),
  component: CasePage,
});

function CasePage() {
  const { caseId } = Route.useParams();
  const qc = useQueryClient();
  const analyze = useServerFn(analyzeCase);
  const [edit, setEdit] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [hearing, setHearing] = useState({ hearing_date: "", note: "", outcome: "" });
  const [note, setNote] = useState("");

  const { data: c, isLoading } = useQuery({
    queryKey: ["case", caseId],
    queryFn: async () => (await supabase.from("cases").select("*, clients(id, full_name)").eq("id", caseId).maybeSingle()).data,
  });

  const { data: hearings = [] } = useQuery({
    queryKey: ["hearings", caseId],
    queryFn: async () => (await supabase.from("hearings").select("*").eq("case_id", caseId).order("hearing_date", { ascending: false })).data ?? [],
  });

  const { data: notes = [] } = useQuery({
    queryKey: ["case-notes", caseId],
    queryFn: async () => (await supabase.from("notes").select("*").eq("case_id", caseId).order("created_at", { ascending: false })).data ?? [],
  });

  async function runAnalysis() {
    setAnalyzing(true);
    try {
      await analyze({ data: { caseId } });
      qc.invalidateQueries({ queryKey: ["case", caseId] });
      toast.success("اكتمل التحليل القانوني");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setAnalyzing(false);
    }
  }

  async function addHearing(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("hearings").insert({
      case_id: caseId, hearing_date: new Date(hearing.hearing_date).toISOString(), note: hearing.note || null, outcome: hearing.outcome || null,
    });
    if (error) { toast.error(error.message); return; }
    setHearing({ hearing_date: "", note: "", outcome: "" });
    qc.invalidateQueries({ queryKey: ["hearings", caseId] });
    toast.success("أُضيفت الجلسة");
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    const { error } = await supabase.from("notes").insert({ case_id: caseId, client_id: c!.client_id, content: note.trim() });
    if (error) { toast.error(error.message); return; }
    setNote("");
    qc.invalidateQueries({ queryKey: ["case-notes", caseId] });
  }

  if (isLoading) return <div className="grid place-items-center py-24"><Loader2 className="size-8 animate-spin text-primary" /></div>;
  if (!c) return <div className="rounded-2xl border border-border p-10 text-center text-muted-foreground">القضية غير موجودة.</div>;

  const info: [string, string | null][] = [
    ["رقم الدعوى", c.case_number], ["المحكمة", c.court], ["نوع القضية", c.case_type],
    ["صفة الموكل", c.client_role], ["الخصم", c.opponent],
    ["الجلسة القادمة", c.next_session ? formatDateTime(c.next_session) : null],
  ];

  return (
    <div>
      <Link to="/clients/$clientId" params={{ clientId: c.client_id }} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowRight className="size-4" /> ملف الموكل: {(c as any).clients?.full_name}
      </Link>
      <PageHeader
        title={c.title}
        subtitle={`${c.status} · الموكل: ${(c as any).clients?.full_name ?? ""}`}
        actions={
          <>
            <Button variant="outline" onClick={() => setEdit(true)}><Pencil /> تعديل</Button>
            <Button variant="gold" onClick={runAnalysis} disabled={analyzing}>
              {analyzing ? <Loader2 className="animate-spin" /> : <Sparkles />} {c.ai_analysis ? "تحديث التحليل" : "تحليل القضية"}
            </Button>
          </>
        }
      />

      <div className="mb-8 grid gap-x-8 gap-y-2 rounded-2xl border border-border bg-card p-6 text-sm shadow-card sm:grid-cols-2 lg:grid-cols-3">
        {info.filter(([, v]) => v).map(([k, v]) => (
          <div key={k}><span className="text-muted-foreground">{k}: </span><span className="font-medium">{v}</span></div>
        ))}
        {c.description && <div className="sm:col-span-2 lg:col-span-3"><span className="text-muted-foreground">الوقائع: </span><span className="whitespace-pre-wrap">{c.description}</span></div>}
      </div>

      <Tabs defaultValue="analysis" dir="rtl">
        <TabsList className="mb-6 flex h-auto w-full flex-wrap justify-start gap-1 bg-secondary/60 p-1.5">
          <TabsTrigger value="analysis" className="gap-1.5"><Sparkles className="size-4" /> التحليل القانوني</TabsTrigger>
          <TabsTrigger value="hearings" className="gap-1.5"><CalendarClock className="size-4" /> الجلسات ({hearings.length})</TabsTrigger>
          <TabsTrigger value="docs" className="gap-1.5">مستندات القضية</TabsTrigger>
          <TabsTrigger value="notes" className="gap-1.5"><StickyNote className="size-4" /> ملاحظات ({notes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis">
          {c.ai_analysis ? (
            <div className="rounded-2xl border border-primary/30 bg-card p-6 shadow-card">
              <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1 text-primary"><Sparkles className="size-3.5" /> التحليل القانوني</span>
                {c.ai_analyzed_at && <span>آخر تحليل: {formatDateTime(c.ai_analyzed_at)}</span>}
              </div>
              <div className="prose prose-invert max-w-none whitespace-pre-wrap text-sm leading-8">{c.ai_analysis}</div>
              <p className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">هذا التحليل مساعد للمحامي ولا يغني عن رأيه المهني.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center">
              <Sparkles className="mx-auto mb-3 size-10 text-primary/60" />
              <p className="text-muted-foreground">اضغط «تحليل القضية» للحصول على مراجعة قانونية منظمة تشمل: التكييف القانوني، نقاط القوة والضعف، النتيجة المحتملة، طرق الطعن، وخطة عمل.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="hearings" className="space-y-4">
          <form onSubmit={addHearing} className="grid gap-3 rounded-2xl border border-border bg-card p-5 shadow-card sm:grid-cols-4">
            <div className="space-y-1.5"><label className="text-sm">تاريخ الجلسة</label><Input dir="ltr" type="datetime-local" required value={hearing.hearing_date} onChange={(e) => setHearing({ ...hearing, hearing_date: e.target.value })} /></div>
            <div className="space-y-1.5"><label className="text-sm">ملاحظة</label><Input value={hearing.note} onChange={(e) => setHearing({ ...hearing, note: e.target.value })} placeholder="ما جرى في الجلسة" /></div>
            <div className="space-y-1.5"><label className="text-sm">النتيجة</label><Input value={hearing.outcome} onChange={(e) => setHearing({ ...hearing, outcome: e.target.value })} placeholder="تأجيل، حكم..." /></div>
            <Button variant="gold" className="self-end"><Plus /> إضافة جلسة</Button>
          </form>
          {hearings.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">لا توجد جلسات مسجلة.</p>
          ) : (
            <div className="space-y-2">
              {hearings.map((h) => (
                <div key={h.id} className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-4 text-sm">
                  <div>
                    <div className="font-medium text-primary">{formatDateTime(h.hearing_date)}</div>
                    {h.note && <p className="mt-1">{h.note}</p>}
                    {h.outcome && <p className="mt-1 text-xs text-muted-foreground">النتيجة: {h.outcome}</p>}
                  </div>
                  <Button size="icon" variant="ghost" className="shrink-0 text-destructive" onClick={async () => { await supabase.from("hearings").delete().eq("id", h.id); qc.invalidateQueries({ queryKey: ["hearings", caseId] }); }}><Trash2 /></Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="docs">
          <FilesPanel clientId={c.client_id} caseId={caseId} section="case" title="كتب وقرارات القضية" hint="العريضة، القرارات، الأدلة، التبليغات — كل ما يخص هذه القضية" />
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <form onSubmit={addNote} className="flex gap-2">
            <Textarea rows={2} className="flex-1" placeholder="ملاحظة عن القضية..." value={note} onChange={(e) => setNote(e.target.value)} />
            <Button variant="gold" className="self-end">إضافة</Button>
          </form>
          {notes.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">لا توجد ملاحظات.</p>
          ) : (
            <div className="space-y-2">
              {notes.map((n) => (
                <div key={n.id} className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-4 text-sm">
                  <div><p className="whitespace-pre-wrap">{n.content}</p><div className="mt-1 text-xs text-muted-foreground">{formatDate(n.created_at)}</div></div>
                  <Button size="icon" variant="ghost" className="shrink-0 text-destructive" onClick={async () => { await supabase.from("notes").delete().eq("id", n.id); qc.invalidateQueries({ queryKey: ["case-notes", caseId] }); }}><Trash2 /></Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {edit && <CaseForm open={edit} onOpenChange={setEdit} clientId={c.client_id} initial={c} onSaved={() => qc.invalidateQueries({ queryKey: ["case", caseId] })} />}
    </div>
  );
}
