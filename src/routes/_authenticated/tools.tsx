import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarClock, Calculator, Percent } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEADLINES } from "@/lib/laws";
import { formatDate, money } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/tools")({
  head: () => ({ meta: [{ title: "أدوات المحامي — حمورابي" }, { name: "description", content: "حاسبة مدد الطعن وحاسبة الأتعاب." }] }),
  component: Tools,
});

function Tools() {
  const [rulingDate, setRulingDate] = useState("");
  const [kind, setKind] = useState("appeal");
  const [amount, setAmount] = useState("");
  const [pct, setPct] = useState("10");

  const deadline = rulingDate
    ? (() => {
        const d = new Date(rulingDate);
        d.setDate(d.getDate() + (DEADLINES.find((x) => x.key === kind)?.days ?? 0));
        return d;
      })()
    : null;
  const daysLeft = deadline ? Math.ceil((deadline.getTime() - Date.now()) / 86400000) : null;

  return (
    <div>
      <PageHeader title="أدوات المحامي" subtitle="حاسبات سريعة تساعدك في عملك اليومي" />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="mb-1 flex items-center gap-2 text-xl"><CalendarClock className="size-5 text-primary" /> حاسبة مدد الطعن</h2>
          <p className="mb-5 text-xs text-muted-foreground">احسب آخر موعد للطعن من تاريخ التبليغ أو صدور الحكم — المدد تقريبية، راجع النص القانوني دائماً.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>تاريخ التبليغ / صدور الحكم</Label>
              <Input dir="ltr" type="date" value={rulingDate} onChange={(e) => setRulingDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>نوع الطعن</Label>
              <Select value={kind} onValueChange={setKind}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{DEADLINES.map((d) => <SelectItem key={d.key} value={d.key}>{d.label} ({d.days} يوم)</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          {deadline && (
            <div className="mt-5 rounded-xl border border-primary/30 bg-primary/8 p-4 text-center">
              <div className="text-sm text-muted-foreground">آخر موعد للطعن</div>
              <div className="mt-1 font-display text-2xl text-primary">{formatDate(deadline.toISOString())}</div>
              {daysLeft !== null && (
                <div className={`mt-1 text-sm ${daysLeft < 0 ? "text-destructive" : daysLeft <= 3 ? "text-primary" : "text-muted-foreground"}`}>
                  {daysLeft < 0 ? `انتهت المدة قبل ${Math.abs(daysLeft)} يوم` : daysLeft === 0 ? "اليوم هو آخر يوم!" : `متبقٍ ${daysLeft} يوم`}
                </div>
              )}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="mb-1 flex items-center gap-2 text-xl"><Calculator className="size-5 text-primary" /> حاسبة الأتعاب والنسب</h2>
          <p className="mb-5 text-xs text-muted-foreground">احسب نسبة من مبلغ الدعوى (أتعاب، رسوم، حصص).</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>المبلغ (د.ع)</Label>
              <Input dir="ltr" type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="10000000" />
            </div>
            <div className="space-y-1.5">
              <Label>النسبة %</Label>
              <div className="relative">
                <Input dir="ltr" type="number" min="0" max="100" step="0.5" value={pct} onChange={(e) => setPct(e.target.value)} />
                <Percent className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
          </div>
          {amount && pct && (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-primary/30 bg-primary/8 p-4 text-center">
                <div className="text-sm text-muted-foreground">قيمة النسبة</div>
                <div className="mt-1 font-display text-xl text-primary">{money((Number(amount) * Number(pct)) / 100)}</div>
              </div>
              <div className="rounded-xl border border-border bg-secondary/40 p-4 text-center">
                <div className="text-sm text-muted-foreground">المتبقي بعد النسبة</div>
                <div className="mt-1 font-display text-xl">{money(Number(amount) - (Number(amount) * Number(pct)) / 100)}</div>
              </div>
            </div>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            {[5, 10, 15, 20, 25].map((p) => (
              <Button key={p} size="sm" variant="outline" onClick={() => setPct(String(p))}>{p}%</Button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
