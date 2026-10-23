import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users, Briefcase, CalendarClock, Wallet, ChevronLeft, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useMe } from "@/lib/auth";
import { formatDateTime, money } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "الرئيسية — حمورابي" }, { name: "description", content: "ملخص مكتب المحاماة." }] }),
  component: Dashboard,
});

function Dashboard() {
  const { me } = useMe();
  const { data } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const now = new Date().toISOString();
      const [clients, cases, upcoming, fees, recent] = await Promise.all([
        supabase.from("clients").select("id", { count: "exact", head: true }),
        supabase.from("cases").select("id", { count: "exact", head: true }).neq("status", "مغلقة"),
        supabase.from("cases").select("id, title, court, next_session, clients(full_name)").gte("next_session", now).order("next_session").limit(6),
        supabase.from("fees").select("kind, amount"),
        supabase.from("cases").select("id, title, status, created_at, clients(full_name)").order("created_at", { ascending: false }).limit(5),
      ]);
      const agreed = (fees.data ?? []).filter((f) => f.kind === "agreement").reduce((a, f) => a + Number(f.amount), 0);
      const paid = (fees.data ?? []).filter((f) => f.kind === "payment").reduce((a, f) => a + Number(f.amount), 0);
      return { clients: clients.count ?? 0, cases: cases.count ?? 0, upcoming: upcoming.data ?? [], recent: recent.data ?? [], due: agreed - paid, paid };
    },
  });

  return (
    <div>
      <PageHeader
        title={`مرحباً، ${me?.full_name?.split(" ")[0] ?? ""}`}
        subtitle="هذا ملخص مكتبك اليوم"
        actions={<Button asChild variant="gold"><Link to="/clients"><Plus /> موكل جديد</Link></Button>}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Users, label: "الموكلون", v: data?.clients ?? 0 },
          { icon: Briefcase, label: "قضايا فعّالة", v: data?.cases ?? 0 },
          { icon: CalendarClock, label: "جلسات قادمة", v: data?.upcoming.length ?? 0 },
          { icon: Wallet, label: "أتعاب مستحقة", v: money(data?.due ?? 0) },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon className="size-5 text-primary" />
            </div>
            <div className="mt-3 font-display text-3xl">{s.v}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="mb-4 text-xl">الجلسات القادمة</h2>
          {!data?.upcoming.length ? (
            <p className="text-sm text-muted-foreground">لا توجد جلسات قادمة.</p>
          ) : (
            <ul className="space-y-2">
              {data.upcoming.map((c: any) => (
                <li key={c.id}>
                  <Link to="/cases/$caseId" params={{ caseId: c.id }} className="flex items-center justify-between rounded-xl bg-secondary/60 p-3 hover:bg-accent">
                    <div>
                      <div className="font-medium">{c.title}</div>
                      <div className="text-xs text-muted-foreground">{c.clients?.full_name} · {c.court}</div>
                    </div>
                    <div className="text-left text-xs text-primary">{formatDateTime(c.next_session)}</div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="mb-4 text-xl">أحدث القضايا</h2>
          {!data?.recent.length ? (
            <p className="text-sm text-muted-foreground">ابدأ بإضافة موكل ثم افتح له قضية.</p>
          ) : (
            <ul className="space-y-2">
              {data.recent.map((c: any) => (
                <li key={c.id}>
                  <Link to="/cases/$caseId" params={{ caseId: c.id }} className="flex items-center justify-between rounded-xl bg-secondary/60 p-3 hover:bg-accent">
                    <div>
                      <div className="font-medium">{c.title}</div>
                      <div className="text-xs text-muted-foreground">{c.clients?.full_name} · {c.status}</div>
                    </div>
                    <ChevronLeft className="size-4 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
