import { useEffect, useRef } from "react";
import { X, Volume2, Bookmark, BookmarkCheck } from "lucide-react";
import { speak, type Picto } from "@/lib/talki";

export function PictoViewer({
  pictos,
  saved,
  onSave,
  onClose,
}: {
  pictos: Picto[];
  saved?: boolean;
  onSave?: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const el = ref.current;
    el?.requestFullscreen?.()
      .then(() => (screen.orientation as unknown as { lock?: (o: string) => Promise<void> }).lock?.("landscape"))
      .catch(() => {});
    const onFs = () => !document.fullscreenElement && closeRef.current();
    document.addEventListener("fullscreenchange", onFs);
    return () => {
      document.removeEventListener("fullscreenchange", onFs);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, []);
  const btn = "absolute grid h-14 w-14 place-items-center rounded-full text-on-brand shadow-pop";
  return (
    <div ref={ref} className="fixed inset-0 z-50 bg-background">
      {/* Rotate to landscape on portrait screens when the browser can't lock orientation */}
      <div className="absolute left-1/2 top-1/2 h-[100vh] w-[100vw] -translate-x-1/2 -translate-y-1/2 portrait:h-[100vw] portrait:w-[100vh] portrait:rotate-90">
        <div className="flex h-full w-full items-center justify-center gap-4 overflow-x-auto px-20">
          {pictos.map((pc, i) => (
            <button
              key={i}
              onClick={() => speak(pc.label)}
              className="flex shrink-0 flex-col items-center rounded-3xl border-4 border-brand-yellow bg-card p-4"
            >
              <span className="text-6xl sm:text-7xl">{pc.emoji}</span>
              <span className="mt-2 font-display text-lg font-semibold text-brand-deep">{pc.label}</span>
            </button>
          ))}
        </div>
        <button onClick={onClose} aria-label="Exit" className={`${btn} right-4 top-4 bg-brand-deep`}>
          <X className="h-7 w-7" />
        </button>
        <button
          onClick={() => speak(pictos.map((p) => p.label).join(" "))}
          aria-label="Listen"
          className={`${btn} bottom-4 left-4 bg-brand-orange`}
        >
          <Volume2 className="h-7 w-7" />
        </button>
        {onSave && <button onClick={onSave} aria-label={saved ? "Saved" : "Save"} className={`${btn} bottom-4 right-4 bg-brand-green`}>
          {saved ? <BookmarkCheck className="h-7 w-7" /> : <Bookmark className="h-7 w-7" />}
        </button>}
      </div>
    </div>
  );
}
