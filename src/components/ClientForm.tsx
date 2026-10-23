import { useState } from "react";
import { toast } from "sonner";
import { Camera, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BUCKET } from "@/components/FilesPanel";

export type ClientRow = {
  id?: string; full_name: string; mother_name?: string | null; birth_date?: string | null; national_id?: string | null;
  phone?: string | null; email?: string | null; address?: string | null; occupation?: string | null; notes?: string | null; photo_path?: string | null;
};

const FIELDS: { key: keyof ClientRow; label: string; type?: string; ltr?: boolean }[] = [
  { key: "full_name", label: "الاسم الرباعي واللقب" },
  { key: "mother_name", label: "اسم الأم" },
  { key: "birth_date", label: "تاريخ الميلاد", type: "date" },
  { key: "national_id", label: "رقم البطاقة الوطنية", ltr: true },
  { key: "phone", label: "رقم الهاتف", ltr: true },
  { key: "email", label: "البريد الإلكتروني", ltr: true },
  { key: "occupation", label: "المهنة" },
  { key: "address", label: "عنوان السكن" },
];

export function ClientForm({ open, onOpenChange, initial, onSaved }: {
  open: boolean; onOpenChange: (v: boolean) => void; initial?: ClientRow; onSaved: (id: string) => void;
}) {
  const [f, setF] = useState<ClientRow>(initial ?? { full_name: "" });
  const [photo, setPhoto] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      let photo_path = f.photo_path ?? null;
      if (photo) {
        photo_path = `${u.user!.id}/photos/${crypto.randomUUID()}.${photo.name.split(".").pop()}`;
        const { error } = await supabase.storage.from(BUCKET).upload(photo_path, photo, { contentType: photo.type });
        if (error) throw error;
      }
      const payload = {
        full_name: f.full_name, mother_name: f.mother_name || null, birth_date: f.birth_date || null, national_id: f.national_id || null,
        phone: f.phone || null, email: f.email || null, address: f.address || null, occupation: f.occupation || null, notes: f.notes || null, photo_path,
      };
      if (f.id) {
        const { error } = await supabase.from("clients").update(payload).eq("id", f.id);
        if (error) throw error;
        onSaved(f.id);
      } else {
        const { data, error } = await supabase.from("clients").insert(payload).select("id").single();
        if (error) throw error;
        onSaved(data.id);
      }
      toast.success("تم الحفظ");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>{f.id ? "تعديل بيانات الموكل" : "موكل جديد"}</DialogTitle></DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-border p-4 hover:bg-secondary/40">
            <div className="grid size-16 place-items-center overflow-hidden rounded-full bg-secondary">
              {photo ? <img src={URL.createObjectURL(photo)} alt="" className="size-full object-cover" /> : <Camera className="size-6 text-muted-foreground" />}
            </div>
            <div className="text-sm"><div>صورة الموكل</div><div className="text-xs text-muted-foreground">اضغط لاختيار صورة</div></div>
            <input type="file" accept="image/*" hidden onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            {FIELDS.map((fl) => (
              <div key={fl.key} className="space-y-1.5">
                <Label>{fl.label}</Label>
                <Input
                  type={fl.type ?? "text"} dir={fl.ltr ? "ltr" : undefined} required={fl.key === "full_name"}
                  value={(f[fl.key] as string) ?? ""} onChange={(e) => setF({ ...f, [fl.key]: e.target.value })}
                />
              </div>
            ))}
          </div>
          <div className="space-y-1.5"><Label>ملاحظات</Label><Textarea rows={3} value={f.notes ?? ""} onChange={(e) => setF({ ...f, notes: e.target.value })} /></div>
          <Button variant="gold" className="h-11 w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />} حفظ</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
