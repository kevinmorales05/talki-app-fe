import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

export function KidSwitcher() {
  const { activeKid, kids, setActiveKid } = useUser();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handle);
    return () => document.removeEventListener("click", handle);
  }, []);

  if (!activeKid) return null;

  if (kids.length <= 1) {
    return (
      <div className="flex items-center gap-2 rounded-full bg-brand-blue/10 px-3 py-1.5 text-brand-blue shrink-0">
        <span className="text-sm font-bold capitalize">{activeKid.name}</span>
      </div>
    );
  }

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full bg-brand-blue/10 px-3 py-1.5 text-brand-blue transition hover:bg-brand-blue/20"
      >
        <span className="text-sm font-bold capitalize">{activeKid.name}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-2xl border border-border bg-card shadow-soft z-50">
          {kids.map((kid) => (
            <button
              key={kid._id}
              onClick={() => {
                setActiveKid(kid);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-bold transition hover:bg-muted"
            >
              <span className="capitalize text-foreground">{kid.name}</span>
              {kid._id === activeKid._id && <Check className="h-4 w-4 text-brand-blue" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
