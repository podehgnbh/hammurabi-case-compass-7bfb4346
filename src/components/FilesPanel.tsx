import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { FileText, ImageIcon, Loader2, Music, Trash2, Upload, File as FileIcon, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { fileSize, formatDate } from "@/lib/format";

export const BUCKET = "client-files";

export async function signedUrl(path: string) {
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
  return data?.signedUrl ?? "";
}

function iconFor(mime?: string | null) {
  if (mime?.startsWith("image/")) return ImageIcon;
  if (mime?.startsWith("audio/")) return Music;
  if (mime === "application/pdf") return FileText;
  return FileIcon;
}

export function FilesPanel({
  clientId, caseId, section, title, hint,
}: { clientId: string; caseId?: string; section: string; title: string; hint?: string }) {
  const qc = useQueryClient();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const key = ["docs", clientId, caseId ?? null, section];

  const { data: docs = [] } = useQuery({
    queryKey: key,
    queryFn: async () => {
      let q = supabase.from("documents").select("*").eq("client_id", clientId).eq("section", section).order("created_at", { ascending: false });
      q = caseId ? q.eq("case_id", caseId) : q.is("case_id", null);
      const { data } = await q;
      const withUrls = await Promise.all(
        (data ?? []).map(async (d) => ({ ...d, url: d.mime?.startsWith("image/") || d.mime?.startsWith("audio/") ? await signedUrl(d.path) : "" })),
      );
      return withUrls;
    },
  });

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() ?? "bin";
        const path = `${u.user!.id}/${clientId}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
        if (error) throw error;
        await supabase.from("documents").insert({
          client_id: clientId, case_id: caseId ?? null, section, name: file.name, path, mime: file.type, size: file.size,
        });
      }
      toast.success("تم رفع الملفات");
      qc.invalidateQueries({ queryKey: key });
    } catch (e: any) {
      toast.error("فشل الرفع: " + e.message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  async function remove(d: { id: string; path: string }) {
    if (!confirm("حذف الملف؟")) return;
    await supabase.storage.from(BUCKET).remove([d.path]);
    await supabase.from("documents").delete().eq("id", d.id);
    qc.invalidateQueries({ queryKey: key });
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg">{title}</h3>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        <input ref={input} type="file" multiple hidden accept="image/*,application/pdf,audio/*,.doc,.docx,.xls,.xlsx,.txt" onChange={(e) => upload(e.target.files)} />
        <Button variant="outline" onClick={() => input.current?.click()} disabled={busy}>
          {busy ? <Loader2 className="animate-spin" /> : <Upload />} رفع ملفات
        </Button>
      </div>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); upload(e.dataTransfer.files); }}
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
      >
        {docs.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            اسحب الملفات هنا أو اضغط «رفع ملفات» — صور، PDF، تسجيلات صوتية...
          </div>
        )}
        {docs.map((d: any) => {
          const Icon = iconFor(d.mime);
          return (
            <div key={d.id} className="overflow-hidden rounded-xl border border-border bg-secondary/40">
              {d.mime?.startsWith("image/") && d.url && <img src={d.url} alt={d.name} loading="lazy" className="h-36 w-full object-cover" />}
              <div className="p-3">
                <div className="flex items-start gap-2">
                  <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium" title={d.name}>{d.name}</div>
                    <div className="text-[11px] text-muted-foreground">{formatDate(d.created_at)} · {fileSize(d.size)}</div>
                  </div>
                </div>
                {d.mime?.startsWith("audio/") && d.url && <audio controls src={d.url} className="mt-2 w-full" />}
                <div className="mt-2 flex justify-end gap-1">
                  <Button size="sm" variant="ghost" onClick={async () => window.open(await signedUrl(d.path), "_blank")}><ExternalLink /> فتح</Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(d)}><Trash2 /></Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
