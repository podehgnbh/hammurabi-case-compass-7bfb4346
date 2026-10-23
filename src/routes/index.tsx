import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, Sparkles, FileSignature, BookOpen, FolderLock, CalendarClock } from "lucide-react";
import hero from "@/assets/hero-stele.jpg";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "حمورابي — المنصة الأقوى لإدارة مكاتب المحاماة في العراق" },
      { name: "description", content: "أدر موكليك وقضاياك وعقودك في مكان واحد، مع تحليل قانوني بالذكاء الاصطناعي ومكتبة للقوانين العراقية." },
      { property: "og:title", content: "حمورابي — منصة المحامي العراقي" },
      { property: "og:description", content: "ملفات الموكلين، القضايا، العقود الجاهزة، والتحليل الذكي للقضايا." },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: Users, title: "ملف لكل موكل", text: "بيانات كاملة وصورة ومجلد منظم بأقسام القضايا والأتعاب والمستندات." },
  { icon: Sparkles, title: "تحليل بالذكاء الاصطناعي", text: "تحليل شامل للقضية: نقاط القوة والضعف، المواد القانونية، وتوقع الحكم." },
  { icon: FileSignature, title: "عقود جاهزة", text: "أتعاب، زواج، بيع، إيجار، وكالات وغيرها تُملأ وتُطبع بثوانٍ." },
  { icon: BookOpen, title: "المكتبة القانونية", text: "القوانين العراقية الأساسية مع البحث في المواد." },
  { icon: FolderLock, title: "أرشيف آمن", text: "ارفع الصور وملفات PDF والتسجيلات الصوتية بخصوصية تامة." },
  { icon: CalendarClock, title: "الجلسات والمدد", text: "تتبع مواعيد الجلسات وحاسبة مدد الطعن القانونية." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-hero">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <Brand />
        <Button asChild variant="gold"><Link to="/auth">تسجيل الدخول</Link></Button>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-6 lg:grid-cols-2 lg:pt-14">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
            <Sparkles className="size-3.5" /> مدعوم بالذكاء الاصطناعي
          </span>
          <h1 className="mt-5 text-4xl leading-[1.25] sm:text-6xl">
            مكتبك القانوني
            <br />
            <span className="text-gold">بقوة حمورابي</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
            المنصة المتكاملة للمحامي العراقي: موكلون، قضايا، عقود، مستندات، وتحليل قانوني ذكي — كل ذلك في مكان واحد آمن.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="gold" size="lg"><Link to="/auth">الدخول إلى المنصة</Link></Button>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute -inset-6 rounded-[2rem] bg-primary/20 blur-3xl" />
          <img src={hero} width={1024} height={1280} alt="مسلة حمورابي" className="relative rounded-[2rem] border border-primary/25 shadow-gold" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card/70 p-6 shadow-card backdrop-blur">
              <div className="grid size-11 place-items-center rounded-xl bg-primary/12 text-primary"><f.icon className="size-5" /></div>
              <h3 className="mt-4 text-lg">{f.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">© حمورابي — جميع الحقوق محفوظة</footer>
    </div>
  );
}
