import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import mascot from "@/assets/talki-mascot.png";
import { login } from "@/lib/talki";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — Talki" },
      { name: "description", content: "Sign in to Talki to chat, train with pictograms and replay saved phrases." },
      { property: "og:title", content: "Log in — Talki" },
      { property: "og:description", content: "Sign in to Talki to chat, train with pictograms and replay saved phrases." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const go = (mail: string) => {
    login(mail || "parent@talki.app");
    navigate({ to: "/app/chat" });
  };
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    go(email);
  };

  return (
    <div className="grid min-h-screen place-items-center bg-hero px-5 py-10">
      <div className="w-full max-w-md rounded-[2rem] bg-card p-8 shadow-soft">
        <Link to="/" className="flex flex-col items-center">
          <img src={mascot} alt="Talki" width={72} height={72} className="h-18 w-18" />
          <h1 className="mt-2 text-3xl text-brand-deep">Welcome to Talki</h1>
        </Link>
        <p className="mt-1 text-center text-muted-foreground">Log in to continue</p>

        <form onSubmit={onSubmit} className="mt-7 space-y-4">
          <label className="block">
            <span className="text-sm font-bold text-brand-deep">Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
              className="mt-1 w-full rounded-2xl border-2 border-input bg-background px-4 py-3 outline-none focus:border-brand-blue" />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-brand-deep">Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
              className="mt-1 w-full rounded-2xl border-2 border-input bg-background px-4 py-3 outline-none focus:border-brand-blue" />
          </label>
          <button type="submit" className="w-full rounded-full bg-brand-blue py-3.5 text-lg font-bold text-on-brand shadow-pop transition active:translate-y-1">
            Login
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-sm text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
        </div>
        <button type="button" onClick={() => go("google.user@gmail.com")}
          className="flex w-full items-center justify-center gap-3 rounded-full border-2 border-border bg-card py-3 font-bold text-brand-deep transition hover:bg-muted">
          <span className="font-display text-xl text-brand-blue">G</span> Login with Google
        </button>
      </div>
    </div>
  );
}
