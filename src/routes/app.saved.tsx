import { createFileRoute } from "@tanstack/react-router";
import { Play, Heart, Trash2 } from "lucide-react";
import { PICTOS, phraseText, useSavedPhrases } from "@/lib/talki";

export const Route = createFileRoute("/app/saved")({
  head: () => ({
    meta: [
      { title: "Saved Phrases — Talki" },
      { name: "description", content: "Replay favorite and frequently used pictogram sentences." },
      { property: "og:title", content: "Saved Phrases — Talki" },
      { property: "og:description", content: "Replay favorite and frequently used pictogram sentences." },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const { phrases, play, toggleFavorite, remove } = useSavedPhrases();
  const sorted = [...phrases].sort((a, b) => Number(b.favorite) - Number(a.favorite) || b.uses - a.uses);

  return (
    <div className="mx-auto max-w-5xl px-5 py-6">
      <h1 className="text-3xl text-brand-deep">Saved Phrases</h1>
      <p className="mt-1 text-muted-foreground">Tap play to hear a phrase out loud.</p>
      {sorted.length === 0 && <p className="mt-10 text-center text-muted-foreground">No phrases yet — save some from Train!</p>}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((p) => (
          <div key={p.id} className="flex flex-col rounded-3xl bg-card p-5 shadow-soft">
            <div className="flex flex-wrap gap-2">
              {p.pictos.map((id, i) => (
                <div key={i} className="flex flex-col items-center rounded-2xl bg-sky px-3 py-2">
                  <span className="text-3xl">{PICTOS[id]?.emoji}</span>
                  <span className="text-xs font-bold text-brand-deep">{PICTOS[id]?.label}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-lg font-bold capitalize text-brand-deep">{phraseText(p.pictos)}</p>
            <p className="text-sm text-muted-foreground">Used {p.uses} times</p>
            <div className="mt-4 flex items-center gap-2">
              <button onClick={() => play(p.id)} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-blue py-2.5 font-bold text-on-brand">
                <Play className="h-4 w-4 fill-current" /> Play
              </button>
              <button onClick={() => toggleFavorite(p.id)} aria-label="Favorite"
                className={`grid h-10 w-10 place-items-center rounded-full ${p.favorite ? "bg-brand-coral text-on-brand" : "bg-muted text-muted-foreground"}`}>
                <Heart className={`h-5 w-5 ${p.favorite ? "fill-current" : ""}`} />
              </button>
              <button onClick={() => remove(p.id)} aria-label="Delete" className="grid h-10 w-10 place-items-center rounded-full bg-muted text-muted-foreground">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
