import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  LayoutDashboard, Users, FileSignature, BookOpen, Sparkles, Calculator, ShieldCheck, LogOut, Menu, X, Scale,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/lib/auth";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "الرئيسية", icon: LayoutDashboard },
  { to: "/clients", label: "الموكلون", icon: Users },
  { to: "/contracts", label: "العقود الجاهزة", icon: FileSignature },
  { to: "/laws", label: "المكتبة القانونية", icon: BookOpen },
  { to: "/assistant", label: "المساعد الذكي", icon: Sparkles },
  { to: "/tools", label: "أدوات المحامي", icon: Calculator },
] as const;

export function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid size-10 place-items-center rounded-xl bg-gold shadow-gold">
        <Scale className="size-5 text-primary-foreground" />
      </div>
      <div className="leading-tight">
        <div className="font-display text-xl text-gold">حمورابي</div>
        <div className="text-[10px] tracking-wide text-muted-foreground">منصة المحامي العراقي</div>
      </div>
    </div>
  );
}

export function AppShell() {
  const { me } = useMe();
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const qc = useQueryClient();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const items = me?.isAdmin ? [...NAV, { to: "/admin", label: "لوحة الإدارة", icon: ShieldCheck } as const] : NAV;

  const nav = (
    <nav className="flex flex-1 flex-col gap-1">
      {items.map((it) => {
        const active = path === it.to || path.startsWith(it.to + "/");
        return (
          <Link
            key={it.to}
            to={it.to}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-all",
              active
                ? "bg-sidebar-accent text-sidebar-primary shadow-card"
                : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
            )}
          >
            <it.icon className="size-4.5" />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="mt-4 rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3">
      <div className="truncate text-sm font-medium">{me?.full_name || "..."}</div>
      <div className="truncate text-xs text-muted-foreground" dir="ltr">@{me?.username}</div>
      <button onClick={signOut} className="mt-3 flex items-center gap-2 text-xs text-destructive hover:underline">
        <LogOut className="size-3.5" /> تسجيل الخروج
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 right-0 z-30 hidden w-64 flex-col border-l border-sidebar-border bg-sidebar p-4 lg:flex">
        <div className="mb-8 px-1 pt-2"><Brand /></div>
        {nav}
        {footer}
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/85 px-4 py-3 backdrop-blur lg:hidden">
        <Brand />
        <button onClick={() => setOpen(true)} className="rounded-lg border border-border p-2" aria-label="القائمة">
          <Menu className="size-5" />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex w-72 flex-col bg-sidebar p-4 animate-in slide-in-from-right">
            <div className="mb-6 flex items-center justify-between">
              <Brand />
              <button onClick={() => setOpen(false)} aria-label="إغلاق"><X className="size-5" /></button>
            </div>
            {nav}
            {footer}
          </div>
        </div>
      )}

      <main className="lg:pr-64">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string | undefined; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl text-foreground sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
