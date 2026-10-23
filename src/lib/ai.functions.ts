import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SYSTEM = `أنت "حمورابي"، مستشار قانوني خبير في القانون العراقي (القانون المدني رقم 40 لسنة 1951، قانون العقوبات رقم 111 لسنة 1969، قانون الأحوال الشخصية رقم 188 لسنة 1959، قانون المرافعات المدنية رقم 83 لسنة 1969، قانون أصول المحاكمات الجزائية رقم 23 لسنة 1971، قانون الإثبات رقم 107 لسنة 1979، وغيرها). تجيب بالعربية الفصحى الواضحة، بتنظيم احترافي بعناوين ونقاط (Markdown). عند ذكر مادة قانونية اذكر رقمها واسم القانون، وإذا لم تكن متأكداً من رقم المادة فقل ذلك صراحة. أنت أداة مساعدة للمحامي ولا تغني عن رأيه المهني.`;

async function ask(input: string) {
  const { generateResponse, GatewayError } = await import("@lovable.dev/ai-gateway");
  try {
    const res: any = await generateResponse({
      model: "openai/gpt-6-astra",
      instructions: SYSTEM,
      input,
    } as any);
    if (typeof res.output_text === "string" && res.output_text) return res.output_text as string;
    const parts: string[] = [];
    for (const item of res.output ?? []) {
      if (item.type === "message") for (const c of item.content ?? []) if (c.type === "output_text") parts.push(c.text);
    }
    return parts.join("\n").trim() || "لم يتم الحصول على رد.";
  } catch (e) {
    if (e instanceof GatewayError) {
      console.error("AI error", e.code, e.httpStatus);
      if (e.httpStatus === 402) throw new Error("نفد رصيد الذكاء الاصطناعي، يرجى شحن الرصيد.");
      if (e.httpStatus === 429) throw new Error("ضغط كبير على الخدمة، حاول بعد قليل.");
    }
    throw new Error("تعذر الاتصال بخدمة الذكاء الاصطناعي");
  }
}

export const analyzeCase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ caseId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    const { data: c } = await sb.from("cases").select("*, clients(full_name, occupation, address)").eq("id", data.caseId).maybeSingle();
    if (!c) throw new Error("القضية غير موجودة");
    const [{ data: hearings }, { data: notes }, { data: docs }] = await Promise.all([
      sb.from("hearings").select("hearing_date, note, outcome").eq("case_id", data.caseId).order("hearing_date"),
      sb.from("notes").select("content").eq("case_id", data.caseId),
      sb.from("documents").select("name, description, section").eq("case_id", data.caseId),
    ]);
    const prompt = `حلل القضية التالية تحليلاً قانونياً شاملاً للمحامي:

عنوان القضية: ${c.title}
رقم الدعوى: ${c.case_number ?? "-"}
المحكمة: ${c.court ?? "-"}
نوع القضية: ${c.case_type ?? "-"}
صفة الموكل: ${c.client_role ?? "-"}
الموكل: ${(c as any).clients?.full_name ?? "-"}
الخصم: ${c.opponent ?? "-"}
الحالة: ${c.status}
وقائع القضية:
${c.description ?? "لا توجد"}

الجلسات:
${(hearings ?? []).map((h) => `- ${h.hearing_date}: ${h.note ?? ""} ${h.outcome ? "النتيجة: " + h.outcome : ""}`).join("\n") || "لا توجد"}

ملاحظات المحامي:
${(notes ?? []).map((n) => "- " + n.content).join("\n") || "لا توجد"}

المستندات والقرارات المرفقة:
${(docs ?? []).map((d) => `- ${d.name}${d.description ? ": " + d.description : ""}`).join("\n") || "لا توجد"}

المطلوب بالترتيب:
1. ملخص تنفيذي للقضية
2. التكييف القانوني والمواد القانونية العراقية ذات الصلة
3. نقاط القوة لموقف الموكل
4. نقاط الضعف والمخاطر
5. التوقع المرجح للحكم البدائي مع نسبة تقديرية وأسبابها
6. طرق الطعن المتاحة (الاعتراض، الاستئناف، التمييز، تصحيح القرار) ومددها القانونية
7. الأدلة والمستندات المطلوب تعزيزها
8. أسئلة يجب طرحها على الموكل
9. خطة عمل مقترحة بخطوات واضحة`;
    const text = await ask(prompt);
    await sb.from("cases").update({ ai_analysis: text, ai_analyzed_at: new Date().toISOString() }).eq("id", data.caseId);
    return { analysis: text };
  });

export const askAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(8000) })).max(30),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const convo = data.messages.map((m) => `${m.role === "user" ? "المحامي" : "حمورابي"}: ${m.content}`).join("\n\n");
    const text = await ask(`المحادثة حتى الآن:\n${convo}\n\nأجب على آخر رسالة من المحامي.`);
    return { reply: text };
  });
