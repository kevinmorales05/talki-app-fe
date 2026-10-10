import { createFileRoute, Link } from "@tanstack/react-router";
import { Brain, MessageSquareHeart, Trophy, ArrowRight } from "lucide-react";
import hero from "@/assets/hero.jpg";
import mascot from "@/assets/talki-mascot.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Talki — Give Every Child a Voice" },
      { name: "description", content: "Pictograms and conversational AI that help children with autism, Down syndrome and speech delays communicate and learn." },
      { property: "og:title", content: "Talki — Give Every Child a Voice" },
      { property: "og:description", content: "Pictograms and conversational AI that help children with autism, Down syndrome and speech delays communicate and learn." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Brain,
    title: "AI-Powered Support",
    text: "Talki adapts to each child's learning pace and answers parents' questions about autism, speech and development — any time of day.",
    tone: "bg-brand-blue",
  },
  {
    icon: MessageSquareHeart,
    title: "Pictogram Communication",
    text: "Clear visual pictograms bridge communication gaps for children with Down syndrome and speech delays, reducing daily frustration.",
    tone: "bg-brand-coral",
  },
  {
    icon: Trophy,
    title: "Interactive Training",
    text: "Duolingo-style lessons with stars, streaks and cheers keep kids engaged while they build real phrases.",
    tone: "bg-brand-green",
  },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link to="/" className="flex items-center gap-2">
          <img src={mascot} alt="" width={40} height={40} className="h-10 w-10" />
          <span className="font-display text-2xl font-bold text-brand-deep">Talki</span>
        </Link>
        <Link to="/login" className="rounded-full bg-brand-deep px-5 py-2 font-bold text-on-brand transition hover:opacity-90">
          Login
        </Link>
      </header>

      <section className="bg-hero">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 md:grid-cols-2 md:py-20">
          <div>
            <span className="inline-block rounded-full bg-brand-yellow/25 px-4 py-1 text-sm font-bold text-brand-deep">
              Pictograms + AI, made with love
            </span>
            <h1 className="mt-5 text-4xl leading-tight text-brand-deep sm:text-5xl md:text-6xl">
              Give Every Child a <span className="text-brand-blue">Voice</span> with Talki
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              An inclusive platform where children build phrases with pictograms and parents get caring, expert-informed guidance from AI.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-7 py-4 text-lg font-bold text-on-brand shadow-soft transition hover:-translate-y-0.5"
              >
                Login / Get Started <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
          <img src={hero} alt="A child and a friendly robot surrounded by pictogram cards" width={1280} height={1024} className="w-full rounded-[2rem] shadow-soft" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-center text-3xl text-brand-deep md:text-4xl">The challenge</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl bg-brand-orange p-8 text-on-brand shadow-soft">
            <p className="font-display text-6xl font-bold">1 in 31</p>
            <p className="mt-3 text-lg">children in the United States is identified with autism.</p>
          </div>
          <div className="rounded-3xl bg-brand-coral p-8 text-on-brand shadow-soft">
            <p className="font-display text-6xl font-bold">1 in 6</p>
            <p className="mt-3 text-lg">children has a developmental delay or disability.</p>
          </div>
        </div>
        <p className="mx-auto mt-8 max-w-2xl text-center text-xl font-semibold text-brand-deep">
          Talki is here to support them.
        </p>
      </section>

      <section className="bg-sky py-16">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-center text-3xl text-brand-deep md:text-4xl">How Talki helps</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-3xl bg-card p-7 shadow-soft">
                <div className={`grid h-14 w-14 place-items-center rounded-2xl ${f.tone} text-on-brand`}>
                  <f.icon className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-xl text-brand-deep">{f.title}</h3>
                <p className="mt-2 text-muted-foreground">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="rounded-[2rem] bg-deep-gradient px-8 py-12 text-center text-on-brand">
          <h2 className="text-3xl md:text-4xl">Ready to start talking?</h2>
          <p className="mx-auto mt-3 max-w-xl opacity-90">Join families and educators using Talki every day.</p>
          <Link to="/login" className="mt-7 inline-block rounded-full bg-brand-yellow px-8 py-4 text-lg font-bold text-brand-deep">
            Get Started — it's free
          </Link>
        </div>
      </section>

      <footer className="py-8 text-center text-sm text-muted-foreground">© 2026 Talki. Every voice matters.</footer>
    </div>
  );
}
