import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { MessageCircle, Star, Bookmark, User, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
const logo = "/talki-logo.png";
const logoWhite = "/talki-logo-white.png";
import { useUser } from "@/contexts/UserContext";

export const Route = createFileRoute("/app")({
  ssr: false,
  beforeLoad: () => {
    try {
      const stored = sessionStorage.getItem("talki-user-session");
      if (!stored) throw redirect({ to: "/login" });
    } catch {
      throw redirect({ to: "/login" });
    }
  },
  component: AppLayout,
});

const NAV = [
  { to: "/app/chat", label: "Talki Chat", icon: MessageCircle },
  { to: "/app/train", label: "Train", icon: Star },
  { to: "/app/saved", label: "Saved Phrases", icon: Bookmark },
] as const;

function AppLayout() {
  const navigate = useNavigate();
  const { user, logoutUser } = useUser();
  const [menu, setMenu] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setMenu(false);
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, []);
  
  const doLogout = () => {
    logoutUser();
    navigate({ to: "/login", replace: true });
  };
  const initial = (user?.name ?? "T").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-sidebar p-5 text-sidebar-foreground md:flex">
        <Link to="/" className="mb-8 flex items-center px-2 py-2">
          <img src={logoWhite} alt="Talki" width={1028} height={565} className="h-14 w-auto" />
        </Link>
        <nav className="flex flex-1 flex-col gap-1.5">
          {[...NAV, { to: "/app/profile", label: "Profile", icon: User } as const].map((n) => (
            <Link key={n.to} to={n.to}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 font-bold transition hover:bg-sidebar-accent"
              activeProps={{ className: "bg-sidebar-primary text-sidebar-primary-foreground" }}>
              <n.icon className="h-5 w-5" /> {n.label}
            </Link>
          ))}
        </nav>
        <button onClick={doLogout} className="flex items-center gap-3 rounded-2xl px-4 py-3 font-bold transition hover:bg-sidebar-accent">
          <LogOut className="h-5 w-5" /> Log Out
        </button>
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-30 grid grid-cols-[minmax(0,1fr)_auto] items-center border-b bg-card/95 px-4 py-3 backdrop-blur md:hidden">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <img src={logo} alt="Talki" width={1774} height={887} className="h-9 w-auto shrink-0" />
        </Link>
        <div ref={ref} className="relative">
          <button onClick={() => setMenu((m) => !m)} aria-label="Account menu"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-orange font-display text-lg font-bold text-on-brand">
            {initial}
          </button>
          {menu && (
            <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-2xl border bg-popover shadow-soft">
              <Link to="/app/profile" onClick={() => setMenu(false)} className="flex items-center gap-2 px-4 py-3 font-semibold hover:bg-muted">
                <User className="h-4 w-4" /> Profile
              </Link>
              <button onClick={doLogout} className="flex w-full items-center gap-2 px-4 py-3 font-semibold text-destructive hover:bg-muted">
                <LogOut className="h-4 w-4" /> Log Out
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="pb-24 md:pb-0 md:pl-64">
        <Outlet />
      </main>

      {/* Mobile bottom tabs */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t bg-card md:hidden">
        {[NAV[1], NAV[0], NAV[2]].map((n) => (
          <Link key={n.to} to={n.to} className="flex flex-col items-center gap-1 py-2.5 text-xs font-bold text-muted-foreground"
            activeProps={{ className: "text-brand-blue" }}>
            <n.icon className="h-6 w-6" />
            {n.label.replace("Talki ", "").replace(" Phrases", "")}
          </Link>
        ))}
      </nav>
    </div>
  );
}
