import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Copy, FileSignature, Printer, Search } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CONTRACTS, fillTemplate, type ContractTemplate } from "@/lib/contracts";

export const Route = createFileRoute("/_authenticated/contracts")({
  head: () => ({ meta: [{ title: "العقود الجاهزة — حمورابي" }, { name: "description", content: "صيغ عقود جاهزة قابلة للتعبئة والطباعة." }] }),
  component: Contracts,
});

function Contracts() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("الكل");
  const [active, setActive] = useState<ContractTemplate | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});

  const cats = ["الكل", ...Array.from(new Set(CONTRACTS.map((c) => c.category)))];
  const list = CONTRACTS.filter((c) => (cat === "الكل" || c.category === cat) && (!q || c.title.includes(q)));
  const filled = useMemo(() => (active ? fillTemplate(active.body, values) : ""), [active, values]);

  function open(t: ContractTemplate) {
    setActive(t);
    setValues({ date: new Date().toISOString().slice(0, 10) });
  }

  function print() {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>${active!.title}</title>
      <style>body{font-family:'Amiri',serif;padding:48px;line-height:2.2;font-size:16px;white-space:pre-wrap;color:#000}@media print{body{padding:0}}</style></head>
      <body>${filled.replace(/</g, "&lt;")}</body></html>`);
    w.document.close();
    w.focus();
    w.print();
  }

  return (
    <div>
      <PageHeader title="العقود الجاهزة" subtitle={`${CONTRACTS.length} صيغة عقد — اختر العقد، عبّئ الحقول، واطبع`} />
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="h-11 pr-10" placeholder="ابحث عن عقد..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`rounded-full px-3.5 py-1.5 text-xs transition ${cat === c ? "bg-gold text-primary-foreground shadow-gold" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((t) => (
          <button key={t.id} onClick={() => open(t)} className="group rounded-2xl border border-border bg-card p-5 text-right shadow-card transition hover:border-primary/50">
            <FileSignature className="mb-3 size-6 text-primary" />
            <div className="font-semibold group-hover:text-primary">{t.title}</div>
            <div className="mt-1 text-xs text-muted-foreground">{t.category}</div>
          </button>
        ))}
      </div>

      <Dialog open={!!active} onOpenChange={(v) => !v && setActive(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader><DialogTitle>{active?.title}</DialogTitle></DialogHeader>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <div className="text-sm font-medium text-primary">حقول العقد</div>
              {active?.fields.map((f) => (
                <div key={f.key} className="space-y-1">
                  <Label className="text-xs">{f.label}</Label>
                  <Input value={values[f.key] ?? ""} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} />
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <Button variant="gold" className="flex-1" onClick={print}><Printer /> طباعة</Button>
                <Button variant="outline" onClick={() => { navigator.clipboard.writeText(filled); toast.success("تم نسخ نص العقد"); }}><Copy /> نسخ</Button>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-secondary/40 p-5">
              <div className="mb-2 text-sm font-medium text-primary">معاينة العقد</div>
              <div className="whitespace-pre-wrap text-sm leading-8">{filled}</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
