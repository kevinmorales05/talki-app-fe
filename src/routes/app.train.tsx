import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Volume2, X, Heart, Star, PartyPopper } from "lucide-react";
import { LESSONS, PICTOS, phraseText, speak, useSavedPhrases } from "@/lib/talki";

export const Route = createFileRoute("/app/train")({
  head: () => ({
    meta: [
      { title: "Train — Build phrases with pictograms | Talki" },
      { name: "description", content: "Gamified pictogram lessons that help kids form phrases." },
      { property: "og:title", content: "Train with Talki" },
      { property: "og:description", content: "Gamified pictogram lessons that help kids form phrases." },
    ],
  }),
  component: TrainPage,
});

const TONES = ["bg-brand-coral", "bg-brand-yellow", "bg-brand-green", "bg-brand-blue"];
const CHEERS = ["Amazing! 🎉", "You did it! ⭐", "Super star! 🌟", "Great job! 💪"];

function TrainPage() {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  const [result, setResult] = useState<null | "right" | "wrong">(null);
  const [stars, setStars] = useState(0);
  const [hearts, setHearts] = useState(5);
  const { add } = useSavedPhrases();
  const done = idx >= LESSONS.length;
  const lesson = LESSONS[Math.min(idx, LESSONS.length - 1)];
  const progress = (idx / LESSONS.length) * 100;

  const pick = (i: number) => {
    if (result || picked.includes(i)) return;
    setPicked([...picked, i]);
    speak(PICTOS[lesson.options[i]].label);
  };
  const check = () => {
    const built = picked.map((i) => lesson.options[i]);
    const ok = built.join() === lesson.target.join();
    setResult(ok ? "right" : "wrong");
    if (ok) {
      setStars((s) => s + 1);
      speak(phraseText(lesson.target));
    } else setHearts((h) => Math.max(0, h - 1));
  };
  const next = () => {
    if (result === "right") setIdx(idx + 1);
    setPicked([]);
    setResult(null);
  };

  if (done)
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-16 text-center">
        <div className="grid h-28 w-28 animate-pop place-items-center rounded-full bg-brand-yellow text-on-brand">
          <PartyPopper className="h-14 w-14" />
        </div>
        <h1 className="mt-6 text-4xl text-brand-deep">Lesson complete!</h1>
        <p className="mt-2 text-lg text-muted-foreground">You earned {stars} stars today. Keep it up!</p>
        <button onClick={() => { setIdx(0); setStars(0); setHearts(5); }}
          className="mt-8 rounded-full bg-brand-green px-8 py-4 text-lg font-bold text-on-brand shadow-pop active:translate-y-1">
          Play again
        </button>
      </div>
    );

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-8.5rem)] max-w-2xl flex-col px-5 py-6 md:min-h-screen">
      <div className="flex items-center gap-4">
        <div className="h-4 flex-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-brand-green transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <span className="flex items-center gap-1 font-bold text-brand-coral"><Heart className="h-5 w-5 fill-current" />{hearts}</span>
        <span className="flex items-center gap-1 font-bold text-brand-orange"><Star className="h-5 w-5 fill-current" />{stars}</span>
      </div>

      <h1 className="mt-8 text-2xl text-brand-deep sm:text-3xl">Build the phrase</h1>
      <button onClick={() => speak(phraseText(lesson.target))} className="mt-3 flex items-center gap-3 self-start rounded-2xl bg-sky px-4 py-3 text-lg font-bold text-brand-deep">
        <Volume2 className="h-6 w-6 text-brand-blue" /> “{phraseText(lesson.target)}”
      </button>

      <div className="mt-6 flex min-h-28 flex-wrap items-center gap-3 rounded-3xl border-2 border-dashed border-brand-blue/40 bg-card p-4">
        {picked.length === 0 && <p className="text-muted-foreground">Tap the cards below in order…</p>}
        {picked.map((i) => (
          <button key={i} onClick={() => !result && setPicked(picked.filter((x) => x !== i))}
            className="flex animate-pop items-center gap-2 rounded-2xl bg-brand-deep px-4 py-2 text-lg font-bold text-on-brand">
            <span className="text-2xl">{PICTOS[lesson.options[i]].emoji}</span>{PICTOS[lesson.options[i]].label}
            {!result && <X className="h-4 w-4 opacity-70" />}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {lesson.options.map((id, i) => {
          const p = PICTOS[id];
          const used = picked.includes(i);
          return (
            <button key={i} onClick={() => pick(i)} disabled={used}
              className={`flex aspect-square flex-col items-center justify-center gap-2 rounded-3xl ${TONES[i % 4]} text-on-brand shadow-pop transition active:translate-y-1 disabled:opacity-30`}>
              <span className="text-6xl">{p.emoji}</span>
              <span className="text-xl font-bold">{p.label}</span>
            </button>
          );
        })}
      </div>

      <div className="relative mt-auto pt-8">
        {result === "right" && <Confetti />}
        {result ? (
          <div className={`rounded-3xl p-5 ${result === "right" ? "bg-brand-green" : "bg-brand-coral"} animate-pop text-on-brand`}>
            <p className="font-display text-2xl font-bold">
              {result === "right" ? CHEERS[idx % CHEERS.length] : "Almost! Let's try again 💙"}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={next} className="rounded-full bg-card px-6 py-3 font-bold text-brand-deep">
                {result === "right" ? "Continue" : "Try again"}
              </button>
              {result === "right" && (
                <button onClick={() => add(lesson.target)} className="rounded-full border-2 border-on-brand px-6 py-3 font-bold">
                  Save phrase
                </button>
              )}
            </div>
          </div>
        ) : (
          <button onClick={check} disabled={picked.length === 0}
            className="w-full rounded-full bg-brand-green py-4 text-xl font-bold text-on-brand shadow-pop transition active:translate-y-1 disabled:opacity-40">
            Check
          </button>
        )}
      </div>
    </div>
  );
}

function Confetti() {
  const colors = ["bg-brand-coral", "bg-brand-yellow", "bg-brand-green", "bg-brand-blue", "bg-brand-orange"];
  return (
    <div className="pointer-events-none absolute inset-x-0 -top-40 h-0">
      {Array.from({ length: 24 }).map((_, i) => (
        <span key={i} className={`absolute h-3 w-2 rounded-sm ${colors[i % 5]} animate-confetti`}
          style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 6) * 0.08}s` }} />
      ))}
    </div>
  );
}
