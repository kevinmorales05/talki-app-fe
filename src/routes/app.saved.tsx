import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Eye, Volume2, Trash2, Loader2 } from "lucide-react";
import { PictoViewer } from "@/components/PictoViewer";
import { speak, type Picto } from "@/lib/talki";
import { useUser } from "@/contexts/UserContext";
import { KidSwitcher } from "@/components/KidSwitcher";
import { SavedPhrasesService } from "@/services/saved-phrases.service";

export const Route = createFileRoute("/app/saved")({
  head: () => ({
    meta: [
      { title: "Saved Phrases — Talki" },
      { name: "description", content: "Replay favorite and frequently used pictogram sentences." },
      { property: "og:title", content: "Saved Phrases — Talki" },
      {
        property: "og:description",
        content: "Replay favorite and frequently used pictogram sentences.",
      },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const { user, activeKid } = useUser();
  const [phrases, setPhrases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<{ id: string; pictos: Picto[] } | null>(null);

  useEffect(() => {
    if (user && activeKid) {
      loadPhrases();
    }
  }, [user, activeKid]);

  const loadPhrases = async () => {
    setLoading(true);
    try {
      const data = await SavedPhrasesService.getSavedPhrases(user!._id, activeKid!._id);
      setPhrases(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toPictos = (phraseArr: any[]): Picto[] => {
    return phraseArr.map((p) => ({
      id: p.word,
      label: p.word,
      emoji: p.pictogram?.emoji || "💬",
      url: p.pictogram?.url,
    }));
  };

  return (
    <div className="mx-auto max-w-5xl px-5 py-6">
      {viewing && (
        <PictoViewer pictos={viewing.pictos} onClose={() => setViewing(null)} />
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-brand-deep">Saved Phrases</h1>
          <p className="mt-1 text-muted-foreground">Tap View to see a phrase full screen.</p>
        </div>
        <KidSwitcher />
      </div>
      {loading ? (
        <div className="mt-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
        </div>
      ) : phrases.length === 0 ? (
        <p className="mt-10 text-center text-muted-foreground">
          No phrases yet — save some from the Chat!
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {phrases.map((p) => {
            const pictos = toPictos(p.phrase);
            return (
              <div key={p._id} className="flex flex-col justify-between rounded-3xl bg-card p-5 shadow-soft">
                <div>
                  <div className="flex flex-wrap gap-2">
                    {pictos.map((pic, i) => (
                      <div key={i} className="flex flex-col items-center justify-center rounded-2xl bg-sky px-3 py-2 border-2 border-brand-yellow min-w-16">
                        {pic.url ? (
                          <img src={pic.url} alt={pic.label} className="h-10 w-10 object-contain" />
                        ) : (
                          <span className="text-3xl">{pic.emoji}</span>
                        )}
                        <span className="text-xs font-bold text-brand-deep mt-1 capitalize">{pic.label}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-lg font-bold capitalize text-brand-deep">
                    {pictos.map((pic) => pic.label).join(" ")}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 capitalize">{p.topic || "General"}</p>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => setViewing({ id: p._id, pictos })}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-blue py-2.5 font-bold text-on-brand"
                  >
                    <Eye className="h-4 w-4" /> View
                  </button>
                  <button
                    onClick={() => speak(pictos.map(pic => pic.label).join(" "))}
                    aria-label="Listen"
                    className="grid h-10 w-10 place-items-center rounded-full bg-brand-orange text-on-brand"
                  >
                    <Volume2 className="h-5 w-5" />
                  </button>
                  {/* Delete functionality to be implemented in API */}
                  <button
                    onClick={() => console.log("Delete to be implemented", p._id)}
                    aria-label="Delete"
                    className="grid h-10 w-10 place-items-center rounded-full bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
