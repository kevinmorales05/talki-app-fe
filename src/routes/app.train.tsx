import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Volume2, X, Heart, Star, PartyPopper, Search, Loader2, Shuffle } from "lucide-react";
import { phraseText, speak, useSavedPhrases, type Picto } from "@/lib/talki";
import { useUser } from "@/contexts/UserContext";
import { KidSwitcher } from "@/components/KidSwitcher";
import { GamesService, type Topic } from "@/services/games.service";
import { SavedPhrasesService } from "@/services/saved-phrases.service";
import { toast } from "sonner";

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

type ViewState = "SELECT_TOPIC" | "LOADING_GAMES" | "PLAYING";

interface DynamicLesson {
  target: Picto[];
  options: Picto[];
}

function TrainPage() {
  const { user, activeKid } = useUser();
  const [viewState, setViewState] = useState<ViewState>("SELECT_TOPIC");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [currentTopic, setCurrentTopic] = useState<string>("random");
  const [search, setSearch] = useState("");
  const [lessons, setLessons] = useState<DynamicLesson[]>([]);
  
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  const [result, setResult] = useState<null | "right" | "wrong">(null);
  const [stars, setStars] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [mistakes, setMistakes] = useState(0);
  const [savedIds, setSavedIds] = useState<number[]>([]);

  useEffect(() => {
    GamesService.getTopics().then(setTopics).catch(console.error);
  }, []);

  const handleSelectTopic = async (topicName?: string) => {
    setViewState("LOADING_GAMES");
    setCurrentTopic(topicName || "random");
    try {
      const data = await GamesService.generatePracticeGames(topicName);
      
      const dynamicLessons = data.practiceGames.map((game: any) => {
        const target: Picto[] = game.phrase.sort((a: any, b: any) => a.order - b.order).map((p: any) => ({
          id: crypto.randomUUID(),
          label: p.word,
          emoji: p.pictogram?.emoji || "💬",
          url: p.pictogram?.url,
        }));

        // Shallow copy and shuffle to create options
        const options = [...target].sort(() => Math.random() - 0.5);

        return { target, options };
      });

      setLessons(dynamicLessons);
      setIdx(0);
      setStars(0);
      setHearts(5);
      setMistakes(0);
      setSavedIds([]);
      setViewState("PLAYING");
    } catch (e) {
      console.error(e);
      setViewState("SELECT_TOPIC");
    }
  };

  const savePhraseToBackend = async () => {
    if (!user || !activeKid || done) return;
    try {
      const mappedPhrase = lesson.target.map((p, index) => ({
        word: p.label,
        order: index,
        tags: [],
        categories: [],
        pictogram: {
          id: -1,
          url: p.url || null,
          emoji: p.emoji,
        }
      }));

      await SavedPhrasesService.savePhrase({
        user_id: user._id,
        kid_id: activeKid._id,
        phrase: mappedPhrase,
        topic: currentTopic,
        examples: [],
      });
      setSavedIds((s) => [...s, idx]);
      toast.success("Phrase saved successfully!");
    } catch (e) {
      console.error("Failed to save phrase:", e);
      toast.error("Failed to save phrase. Please try again.");
    }
  };

  if (viewState === "SELECT_TOPIC") {
    const filtered = topics.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));
    return (
      <div className="mx-auto flex min-h-[calc(100dvh-8.5rem)] max-w-4xl flex-col px-5 py-6 md:min-h-screen">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display text-brand-deep">Choose a Topic</h1>
            <p className="text-muted-foreground mt-1">Select a category to practice forming phrases</p>
          </div>
          <KidSwitcher />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border-2 border-brand-blue/30 bg-card py-3 pl-10 pr-4 outline-none focus:border-brand-blue"
            />
          </div>
          <button
            onClick={() => handleSelectTopic()}
            className="flex items-center justify-center gap-2 rounded-2xl bg-brand-orange px-6 py-3 font-bold text-on-brand shadow-pop transition active:translate-y-1"
          >
            <Shuffle className="h-5 w-5" /> Random Topic
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 pb-20">
          {filtered.map(t => (
            <button
              key={t.id}
              onClick={() => handleSelectTopic(t.name)}
              className="flex flex-col items-center gap-3 rounded-3xl bg-card p-6 shadow-soft transition hover:-translate-y-1 active:translate-y-0"
            >
              <span className="text-5xl">{t.emoji}</span>
              <span className="text-center font-semibold text-brand-deep">{t.name}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-10">No topics found matching "{search}"</p>
          )}
        </div>
      </div>
    );
  }

  if (viewState === "LOADING_GAMES") {
    return (
      <div className="flex min-h-[calc(100dvh-8.5rem)] flex-col items-center justify-center p-5 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-brand-blue mb-4" />
        <h2 className="text-2xl font-bold text-brand-deep">Generating Practice Games...</h2>
        <p className="text-muted-foreground mt-2">Talki is building a custom lesson for {activeKid?.name || "you"}</p>
      </div>
    );
  }

  const done = idx >= lessons.length;
  const lesson = lessons[Math.min(idx, lessons.length - 1)]!;
  const progress = (idx / lessons.length) * 100;
  const isSaved = savedIds.includes(idx);

  const pick = (i: number) => {
    if (result || picked.includes(i)) return;
    setPicked([...picked, i]);
    speak(lesson.options[i]!.label);
  };
  const check = () => {
    const built = picked.map((i) => lesson.options[i]!.id);
    const targetIds = lesson.target.map(t => t.id);
    const ok = built.join() === targetIds.join();
    setResult(ok ? "right" : "wrong");
    if (ok) {
      setStars((s) => s + 1);
      speak(lesson.target.map(p => p.label).join(" "));
    } else {
      setHearts((h) => Math.max(0, h - 1));
      setMistakes((m) => m + 1);
    }
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
        
        <div className="mt-10 flex gap-12 bg-card rounded-3xl p-8 shadow-soft border-2 border-brand-blue/10">
           <div className="flex flex-col items-center gap-2">
             <div className="text-5xl font-display text-brand-green">{lessons.length}</div>
             <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Correct</div>
           </div>
           <div className="w-0.5 bg-border rounded-full"></div>
           <div className="flex flex-col items-center gap-2">
             <div className="text-5xl font-display text-brand-coral">{mistakes}</div>
             <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Mistakes</div>
           </div>
        </div>

        <button onClick={() => setViewState("SELECT_TOPIC")}
          className="mt-12 rounded-full bg-brand-green px-10 py-4 text-xl font-bold text-on-brand shadow-pop active:translate-y-1">
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

      <div className="mt-8 flex items-center justify-between">
        <h1 className="text-2xl text-brand-deep sm:text-3xl">Build the phrase</h1>
        <KidSwitcher />
      </div>
      <button onClick={() => speak(lesson.target.map(p => p.label).join(" "))} className="mt-3 flex items-center gap-3 self-start rounded-2xl bg-sky px-4 py-3 text-lg font-bold text-brand-deep">
        <Volume2 className="h-6 w-6 text-brand-blue" /> “{lesson.target.map(p => p.label).join(" ")}”
      </button>

      <div className="mt-6 flex min-h-28 flex-wrap items-center gap-3 rounded-3xl border-2 border-dashed border-brand-blue/40 bg-card p-4">
        {picked.length === 0 && <p className="text-muted-foreground">Tap the cards below in order…</p>}
        {picked.map((i) => (
          <button key={i} onClick={() => {
              speak(lesson.options[i]!.label);
              if (!result) setPicked(picked.filter((x) => x !== i));
            }}
            className="flex animate-pop items-center gap-2 rounded-2xl bg-brand-deep px-4 py-2 text-lg font-bold text-on-brand">
            {lesson.options[i]!.url ? (
               <img src={lesson.options[i]!.url!} alt={lesson.options[i]!.label} className="h-6 w-6 object-contain" />
            ) : (
               <span className="text-2xl">{lesson.options[i]!.emoji}</span>
            )}
            {lesson.options[i]!.label}
            {!result && <X className="h-4 w-4 opacity-70" />}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {lesson.options.map((p, i) => {
          const used = picked.includes(i);
          return (
            <button key={i} onClick={() => pick(i)} disabled={used}
              className={`flex aspect-square flex-col items-center justify-center gap-2 rounded-3xl ${TONES[i % 4]} text-on-brand shadow-pop transition active:translate-y-1 disabled:opacity-30`}>
              {p.url ? (
                 <img src={p.url} alt={p.label} className="h-16 w-16 object-contain mix-blend-multiply" />
              ) : (
                 <span className="text-6xl">{p.emoji}</span>
              )}
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
                <button 
                  onClick={savePhraseToBackend} 
                  disabled={isSaved}
                  className="rounded-full border-2 border-on-brand px-6 py-3 font-bold disabled:opacity-50"
                >
                  {isSaved ? "Saved!" : "Save phrase"}
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
