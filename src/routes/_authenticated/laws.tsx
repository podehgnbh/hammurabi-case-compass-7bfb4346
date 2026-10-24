import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { BookOpen, ChevronDown, Loader2, Plus, Scale, Search, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LAWS } from "@/lib/laws";

export const Route = createFileRoute("/_authenticated/laws")({
  head: () => ({ meta: [{ title: "المكتبة القانونية — حمورابي" }, { name: "description", content: "القوانين العراقية وموادها." }] }),
  component: Laws,
});

function Laws() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("الكل");
  const [openLaw, setOpenLaw] = useState<string | null>(null);
  const [addFor, setAddFor] = useState<string | null>(null);
  const [art, setArt] = useState({ article_number: "", content: "" });

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["law-articles"],
    queryFn: async () => (await supabase.from("law_articles").select("*").order("article_number")).data ?? [],
  });

  const cats = ["الكل", ...Array.from(new Set(LAWS.map((l) => l.category)))];
  const list = LAWS.filter((l) => (cat === "الكل" || l.category === cat) && (!q || l.name.includes(q) || l.number.includes(q)));
  const artsOf = (key: string) => articles.filter((a) => a.law_key === key);

  async function addArticle(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("law_articles").insert({ law_key: addFor!, article_number: art.article_number, content: art.content });
    if (error) { toast.error(error.message); return; }
    setArt({ article_number: "", content: "" });
    setAddFor(null);
    qc.invalidateQueries({ queryKey: ["law-articles"] });
    toast.success("أُضيفت المادة");
  }

  return (
    <div>
      <PageHeader title="المكتبة القانونية" subtitle="القوانين العراقية الأساسية — يمكنك إضافة مواد كل قانون" />
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="h-11 pr-10" placeholder="ابحث عن قانون..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`rounded-full px-3.5 py-1.5 text-xs transition ${cat === c ? "bg-gold text-primary-foreground shadow-gold" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <Loader2 className="mx-auto size-8 animate-spin text-primary" />}

      <div className="space-y-3">
        {list.map((l) => {
          const arts = artsOf(l.key);
          const open = openLaw === l.key;
          return (
            <div key={l.key} className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
              <button onClick={() => setOpenLaw(open ? null : l.key)} className="flex w-full items-center gap-4 p-5 text-right transition hover:bg-secondary/40">
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-gold/15"><Scale className="size-5 text-primary" /></div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{l.name} <span className="text-sm font-normal text-primary">{l.number}</span></div>
                  <div className="mt-0.5 truncate text-xs text-muted-foreground">{l.summary}</div>
                </div>
                <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">{arts.length} مادة</span>
                <ChevronDown className={`size-4 shrink-0 text-muted-foreground transition ${open ? "rotate-180" : ""}`} />
              </button>
              {open && (
                <div className="border-t border-border p-5">
                  <div className="mb-4 flex justify-end">
                    <Button size="sm" variant="gold" onClick={() => setAddFor(l.key)}><Plus /> إضافة مادة</Button>
                  </div>
                  {arts.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                      لم تُضف مواد بعد — أضف مواد هذا القانون لتظهر هنا.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {arts.map((a) => (
                        <div key={a.id} className="flex items-start gap-3 rounded-xl border border-border bg-secondary/40 p-4">
                          <BookOpen className="mt-1 size-4 shrink-0 text-primary" />
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 text-sm font-semibold text-primary">المادة ({a.article_number})</div>
                            <p className="whitespace-pre-wrap text-sm leading-7">{a.content}</p>
                          </div>
                          <Button size="icon" variant="ghost" className="shrink-0 text-destructive" onClick={async () => { await supabase.from("law_articles").delete().eq("id", a.id); qc.invalidateQueries({ queryKey: ["law-articles"] }); }}><Trash2 /></Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Dialog open={!!addFor} onOpenChange={(v) => !v && setAddFor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>إضافة مادة — {LAWS.find((l) => l.key === addFor)?.name}</DialogTitle></DialogHeader>
          <form onSubmit={addArticle} className="space-y-4">
            <div className="space-y-1.5"><Label>رقم المادة</Label><Input dir="ltr" required value={art.article_number} onChange={(e) => setArt({ ...art, article_number: e.target.value })} placeholder="132" /></div>
            <div className="space-y-1.5"><Label>نص المادة</Label><Textarea rows={6} required value={art.content} onChange={(e) => setArt({ ...art, content: e.target.value })} /></div>
            <Button variant="gold" className="w-full">حفظ المادة</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
