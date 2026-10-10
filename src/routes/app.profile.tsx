import { createFileRoute } from "@tanstack/react-router";
import { Flame, Star, BookOpen } from "lucide-react";
import { getUser, useSavedPhrases } from "@/lib/talki";

export const Route = createFileRoute("/app/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Talki" },
      { name: "description", content: "Your Talki profile and learning progress." },
      { property: "og:title", content: "Profile — Talki" },
      { property: "og:description", content: "Your Talki profile and learning progress." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const user = getUser();
  const { phrases } = useSavedPhrases();
  const stats = [
    { icon: Flame, label: "Day streak", value: 4, tone: "bg-brand-orange" },
    { icon: Star, label: "Stars earned", value: 23, tone: "bg-brand-yellow" },
    { icon: BookOpen, label: "Saved phrases", value: phrases.length, tone: "bg-brand-green" },
  ];
  return (
    <div className="mx-auto max-w-3xl px-5 py-6">
      <div className="flex items-center gap-4 rounded-3xl bg-deep-gradient p-6 text-on-brand">
        <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-brand-orange font-display text-4xl font-bold">
          {(user?.name ?? "T").charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-3xl capitalize">{user?.name}</h1>
          <p className="truncate opacity-90">{user?.email}</p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-3xl bg-card p-5 shadow-soft">
            <div className={`grid h-12 w-12 place-items-center rounded-2xl ${s.tone} text-on-brand`}><s.icon className="h-6 w-6" /></div>
            <p className="mt-3 font-display text-3xl font-bold text-brand-deep">{s.value}</p>
            <p className="text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
