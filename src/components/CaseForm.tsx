import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const CASE_TYPES = ["مدني", "جزائي", "أحوال شخصية", "تجاري", "عمل", "عقاري", "إيجارات", "شركات", "جنسية وأحوال مدنية", "أخرى"];
export const CASE_STATUSES = ["قيد المرافعة", "محكومة بدائياً", "مؤجلة", "مغلقة"];
export const CLIENT_ROLES = ["مدعي", "مدعى عليه", "مشتكي", "متهم", "مستأنف", "مستأنف عليه", "مميز", "مميز عليه"];

export type CaseRow = {
  id?: string; title: string; case_number?: string | null; court?: string | null; case_type?: string | null;
  client_role?: string | null; opponent?: string | null; status?: string; next_session?: string | null; description?: string | null;
};

export function CaseForm({ open, onOpenChange, clientId, initial, onSaved }: {
  open: boolean; onOpenChange: (v: boolean) => void; clientId: string; initial?: CaseRow; onSaved: (id: string) => void;
}) {
  const [f, setF] = useState<CaseRow>(initial ?? { title: "", status: "قيد المرافعة" });
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        title: f.title, case_number: f.case_number || null, court: f.court || null, case_type: f.case_type || null,
        client_role: f.client_role || null, opponent: f.opponent || null, status: f.status ?? "قيد المرافعة",
        next_session: f.next_session ? new Date(f.next_session).toISOString() : null, description: f.description || null,
      };
      if (f.id) {
        const { error } = await supabase.from("cases").update(payload).eq("id", f.id);
        if (error) throw error;
        onSaved(f.id);
      } else {
        const { data, error } = await supabase.from("cases").insert({ ...payload, client_id: clientId }).select("id").single();
        if (error) throw error;
        onSaved(data.id);
      }
      toast.success("تم حفظ القضية");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  const sel = (key: keyof CaseRow, list: string[], label: string) => (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select value={(f[key] as string) ?? ""} onValueChange={(v) => setF({ ...f, [key]: v })}>
        <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
        <SelectContent>{list.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>{f.id ? "تعديل القضية" : "قضية جديدة"}</DialogTitle></DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <div className="space-y-1.5">
            <Label>عنوان القضية</Label>
            <Input required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="مثال: دعوى إخلاء عقار" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>رقم الدعوى</Label><Input dir="ltr" value={f.case_number ?? ""} onChange={(e) => setF({ ...f, case_number: e.target.value })} placeholder="1234/2026" /></div>
            <div className="space-y-1.5"><Label>المحكمة</Label><Input value={f.court ?? ""} onChange={(e) => setF({ ...f, court: e.target.value })} placeholder="محكمة بداءة الكرخ" /></div>
            {sel("case_type", CASE_TYPES, "نوع القضية")}
            {sel("client_role", CLIENT_ROLES, "صفة الموكل")}
            {sel("status", CASE_STATUSES, "حالة القضية")}
            <div className="space-y-1.5"><Label>الجلسة القادمة</Label><Input type="datetime-local" dir="ltr" value={f.next_session ? f.next_session.slice(0, 16) : ""} onChange={(e) => setF({ ...f, next_session: e.target.value })} /></div>
          </div>
          <div className="space-y-1.5"><Label>الخصم</Label><Input value={f.opponent ?? ""} onChange={(e) => setF({ ...f, opponent: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>وقائع القضية</Label><Textarea rows={5} value={f.description ?? ""} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="اكتب وقائع القضية بالتفصيل — تُستخدم في التحليل الذكي" /></div>
          <Button variant="gold" className="h-11 w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />} حفظ</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
