import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { Bot, Loader2, Send, Trash2, User } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { askAssistant } from "@/lib/ai.functions";

export const Route = createFileRoute("/_authenticated/assistant")({
  head: () => ({ meta: [{ title: "المساعد القانوني — حمورابي" }, { name: "description", content: "مساعد قانوني للمحامي العراقي." }] }),
  component: Assistant,
});

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "ما هي مدة الاستئناف في الدعاوى المدنية العراقية؟",
  "اشرح لي شروط صحة العقد في القانون المدني العراقي",
  "ما الفرق بين البطلان المطلق والنسبي؟",
  "ما هي أسباب التخلية في قانون إيجار العقار؟",
];

function Assistant() {
  const ask = useServerFn(askAssistant);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    const next: Msg[] = [...msgs, { role: "user", content }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    try {
      const r = await ask({ data: { messages: next.slice(-20) } });
      setMsgs([...next, { role: "assistant", content: r.reply }]);
    } catch (e: any) {
      setMsgs([...next, { role: "assistant", content: "⚠️ " + e.message }]);
    } finally {
      setBusy(false);
      setTimeout(() => bottom.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col">
      <PageHeader
        title="المساعد القانوني"
        subtitle="استفسر عن القانون العراقي — معلومات مساعدة لا تغني عن رأيك المهني"
        actions={msgs.length > 0 && <Button variant="outline" onClick={() => setMsgs([])}><Trash2 /> محادثة جديدة</Button>}
      />

      <div className="flex-1 space-y-4">
        {msgs.length === 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => send(s)} className="rounded-2xl border border-border bg-card p-4 text-right text-sm shadow-card transition hover:border-primary/50 hover:text-primary">
                {s}
              </button>
            ))}
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`grid size-9 shrink-0 place-items-center rounded-full ${m.role === "user" ? "bg-secondary" : "bg-gold shadow-gold"}`}>
              {m.role === "user" ? <User className="size-4" /> : <Bot className="size-4 text-primary-foreground" />}
            </div>
            <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl p-4 text-sm leading-7 ${m.role === "user" ? "bg-secondary" : "border border-primary/25 bg-card shadow-card"}`}>
              {m.content}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex gap-3">
            <div className="grid size-9 place-items-center rounded-full bg-gold shadow-gold"><Bot className="size-4 text-primary-foreground" /></div>
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> حمورابي يفكر...</div>
          </div>
        )}
        <div ref={bottom} />
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        className="sticky bottom-4 mt-6 flex items-end gap-2 rounded-2xl border border-border bg-card p-3 shadow-card"
      >
        <Textarea
          rows={1}
          className="max-h-40 min-h-10 flex-1 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
          placeholder="اكتب سؤالك القانوني هنا..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
        />
        <Button variant="gold" size="icon" className="size-10 shrink-0" disabled={busy || !input.trim()}><Send /></Button>
      </form>
    </div>
  );
}
