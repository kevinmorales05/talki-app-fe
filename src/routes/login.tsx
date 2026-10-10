import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import logoAsset from "@/assets/talki-logo.png.asset.json";
const logo = logoAsset.url;
import bgDesktop from "@/assets/login-desktop.jpg";
import bgMobile from "@/assets/login-mobile.jpg";
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

  const go = () => {
    login("google.user@gmail.com");
    navigate({ to: "/app/chat" });
  };

  return (
    <div className="relative flex min-h-screen items-end justify-center px-5 py-10 md:items-center md:justify-start md:px-16">
      <picture className="absolute inset-0 -z-10">
        <source media="(min-width: 768px)" srcSet={bgDesktop} />
        <img src={bgMobile} alt="A mother teaching her child with Talki" className="h-full w-full object-cover" />
      </picture>
      <div className="absolute inset-0 -z-10 bg-brand-deep/25" />
      <div className="w-full max-w-md rounded-[2rem] bg-card/95 p-8 shadow-soft backdrop-blur">
        <Link to="/" className="flex flex-col items-center">
          <img src={logo} alt="Talki" width={1774} height={887} className="h-20 w-auto" />
          <h1 className="mt-2 text-3xl text-brand-deep">Welcome to Talki</h1>
        </Link>
        <p className="mt-1 text-center text-muted-foreground">Log in to continue</p>

        <button type="button" onClick={go}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-full border-2 border-border bg-card py-3.5 text-lg font-bold text-brand-deep shadow-pop transition hover:bg-muted active:translate-y-1">
          <span className="font-display text-xl text-brand-blue">G</span> Login with Google
        </button>
      </div>
    </div>
  );
}
