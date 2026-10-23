import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Search, FolderOpen, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClientForm } from "@/components/ClientForm";
import { signedUrl } from "@/components/FilesPanel";

export const Route = createFileRoute("/_authenticated/clients/")({
  head: () => ({ meta: [{ title: "الموكلون — حمورابي" }, { name: "description", content: "ملفات الموكلين." }] }),
  component: Clients,
});

function Clients() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const { data = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data } = await supabase.from("clients").select("*, cases(id)").order("created_at", { ascending: false });
      return Promise.all((data ?? []).map(async (c) => ({ ...c, photo: c.photo_path ? await signedUrl(c.photo_path) : "" })));
    },
  });
  const list = data.filter((c) => !q || c.full_name.includes(q) || c.phone?.includes(q) || c.national_id?.includes(q));

  return (
    <div>
      <PageHeader title="الموكلون" subtitle={`${data.length} موكل — لكل موكل مجلد خاص`} actions={<Button variant="gold" onClick={() => setOpen(true)}><Plus /> موكل جديد</Button>} />
      <div className="relative mb-6 max-w-md">
        <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="h-11 pr-10" placeholder="ابحث بالاسم أو الهاتف أو رقم الهوية" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          <FolderOpen className="mx-auto mb-3 size-10 text-primary/60" /> لا يوجد موكلون بعد
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((c: any) => (
            <Link key={c.id} to="/clients/$clientId" params={{ clientId: c.id }} className="group rounded-2xl border border-border bg-card p-5 shadow-card transition hover:border-primary/50">
              <div className="flex items-center gap-4">
                <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-primary/40 bg-secondary font-display text-xl text-primary">
                  {c.photo ? <img src={c.photo} alt="" className="size-full object-cover" /> : c.full_name[0]}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-semibold group-hover:text-primary">{c.full_name}</div>
                  {c.phone && <div className="flex items-center gap-1 text-xs text-muted-foreground" dir="ltr"><Phone className="size-3" />{c.phone}</div>}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                <span>{c.cases?.length ?? 0} قضية</span>
                <span className="flex items-center gap-1 text-primary"><FolderOpen className="size-3.5" /> فتح المجلد</span>
              </div>
            </Link>
          ))}
        </div>
      )}
      {open && <ClientForm open={open} onOpenChange={setOpen} onSaved={(id) => navigate({ to: "/clients/$clientId", params: { clientId: id } })} />}
    </div>
  );
}
