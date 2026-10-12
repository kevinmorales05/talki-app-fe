import { useCallback, useEffect, useState } from "react";

export type Picto = { id: string; emoji: string; label: string; url?: string };

export const PICTOS: Record<string, Picto> = {
  i: { id: "i", emoji: "🙋", label: "I" },
  want: { id: "want", emoji: "🤲", label: "want" },
  water: { id: "water", emoji: "🥤", label: "water" },
  apple: { id: "apple", emoji: "🍎", label: "apple" },
  play: { id: "play", emoji: "🧸", label: "play" },
  am: { id: "am", emoji: "👉", label: "am" },
  happy: { id: "happy", emoji: "😊", label: "happy" },
  sad: { id: "sad", emoji: "😢", label: "sad" },
  go: { id: "go", emoji: "🚶", label: "go" },
  home: { id: "home", emoji: "🏠", label: "home" },
  love: { id: "love", emoji: "❤️", label: "love" },
  mom: { id: "mom", emoji: "👩", label: "mom" },
  eat: { id: "eat", emoji: "🍽️", label: "eat" },
  help: { id: "help", emoji: "🆘", label: "help" },
  please: { id: "please", emoji: "🙏", label: "please" },
};

export const LESSONS: { target: string[]; options: string[] }[] = [
  { target: ["i", "want", "water"], options: ["water", "i", "play", "want"] },
  { target: ["i", "am", "happy"], options: ["sad", "happy", "i", "am"] },
  { target: ["i", "love", "mom"], options: ["mom", "home", "love", "i"] },
  { target: ["i", "want", "eat"], options: ["eat", "want", "go", "i"] },
  { target: ["help", "please"], options: ["please", "apple", "help"] },
];

export function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !text.trim()) return;
  
  console.log(`[TTS] Attempting to speak: "${text}"`);
  const synth = window.speechSynthesis;
  
  // DO NOT call synth.cancel() here! 
  // In Chrome, calling cancel() immediately before speak() causes the NEW utterance to be canceled instantly, 
  // which triggers the onerror event!
  
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 0.85;
  
  const voices = synth.getVoices();
  const voice = voices.find((v) => v.lang.startsWith("en-US")) || voices.find((v) => v.lang.startsWith("en"));
  if (voice) {
    u.voice = voice;
  }
  
  u.onstart = () => console.log(`[TTS] Started speaking: "${text}"`);
  u.onerror = (e) => console.error(`[TTS] Error on "${text}":`, e.error || e);
  u.onend = () => console.log(`[TTS] Finished speaking: "${text}"`);

  synth.speak(u);
}

export const toPicto = (id: string): Picto => PICTOS[id] ?? { id, emoji: "💬", label: id };

export const phraseText = (ids: string[]) => ids.map((id) => PICTOS[id]?.label ?? id).join(" ");

/* ---------- mock auth ---------- */
const AUTH_KEY = "talki-auth";
export type MockUser = { name: string; email: string };
export function getUser(): MockUser | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY) ?? "null");
  } catch {
    return null;
  }
}
export function login(email: string) {
  const name = email.split("@")[0] || "Friend";
  localStorage.setItem(AUTH_KEY, JSON.stringify({ name, email }));
}
export function logout() {
  localStorage.removeItem(AUTH_KEY);
}

/* ---------- saved phrases ---------- */
export type SavedPhrase = { id: string; pictos: string[]; favorite: boolean; uses: number };
const SAVED_KEY = "talki-saved";
const DEFAULT_SAVED: SavedPhrase[] = [
  { id: "s1", pictos: ["i", "want", "water"], favorite: true, uses: 12 },
  { id: "s2", pictos: ["i", "am", "happy"], favorite: false, uses: 8 },
  { id: "s3", pictos: ["help", "please"], favorite: true, uses: 5 },
  { id: "s4", pictos: ["i", "want", "play"], favorite: false, uses: 3 },
  { id: "s5", pictos: ["go", "home"], favorite: false, uses: 2 },
];

function readSaved(): SavedPhrase[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_SAVED;
  } catch {
    return DEFAULT_SAVED;
  }
}

export function useSavedPhrases() {
  const [phrases, setPhrases] = useState<SavedPhrase[]>([]);
  useEffect(() => setPhrases(readSaved()), []);
  const update = useCallback((fn: (p: SavedPhrase[]) => SavedPhrase[]) => {
    setPhrases((prev) => {
      const next = fn(prev.length ? prev : readSaved());
      localStorage.setItem(SAVED_KEY, JSON.stringify(next));
      return next;
    });
  }, []);
  return {
    phrases,
    add: (pictos: string[]) =>
      update((p) =>
        p.some((x) => x.pictos.join() === pictos.join())
          ? p
          : [{ id: crypto.randomUUID(), pictos, favorite: false, uses: 0 }, ...p],
      ),
    toggleFavorite: (id: string) =>
      update((p) => p.map((x) => (x.id === id ? { ...x, favorite: !x.favorite } : x))),
    play: (id: string) =>
      update((p) =>
        p.map((x) => {
          if (x.id !== id) return x;
          speak(phraseText(x.pictos));
          return { ...x, uses: x.uses + 1 };
        }),
      ),
    remove: (id: string) => update((p) => p.filter((x) => x.id !== id)),
  };
}
