import { createFileRoute } from "@tanstack/react-router";
import {
  Flame,
  Star,
  BookOpen,
  Plus,
  Baby,
  CheckCircle2,
  X,
  CreditCard,
  Sparkles,
  Coins,
  AlertTriangle,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useSavedPhrases } from "@/lib/talki";
import { useUser, type KidData } from "@/contexts/UserContext";
import { useState, type FormEvent } from "react";
import { KidsService } from "@/services/kids.service";
import { SubscriptionsService, type SubscriptionPlan } from "@/services/subscriptions.service";
import { StripePaymentModal } from "@/components/subscription/StripePaymentModal";
import { toast } from "sonner";

export const Route = createFileRoute("/app/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Talki" },
      { name: "description", content: "Your Talki profile, subscription, and learning progress." },
      { property: "og:title", content: "Profile — Talki" },
      { property: "og:description", content: "Your Talki profile, subscription, and learning progress." },
    ],
  }),
  component: ProfilePage,
});

function calculateAge(birthday: string) {
  const diff = Date.now() - new Date(birthday).getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

function ProfilePage() {
  const { user, kids, activeKid, setActiveKid, updateKids, updateUser, isSubscribed } = useUser();
  const { phrases } = useSavedPhrases();

  const [showKidForm, setShowKidForm] = useState(false);
  const [kidData, setKidData] = useState({ name: "", lastname: "", birthday: "", specialNeed: "none" });
  const [isLoading, setIsLoading] = useState(false);
  const [viewKidModal, setViewKidModal] = useState<KidData | null>(null);

  // Subscription state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [premiumPlan, setPremiumPlan] = useState<SubscriptionPlan | null>(null);

  const stats = [
    { icon: Flame, label: "Day streak", value: 4, tone: "bg-brand-orange" },
    { icon: Star, label: "Stars earned", value: 23, tone: "bg-brand-yellow" },
    { icon: BookOpen, label: "Saved phrases", value: phrases.length, tone: "bg-brand-green" },
  ];

  const handleAddKid = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const formattedBirthday = new Date(kidData.birthday).toISOString();
      await KidsService.createKid({
        ...kidData,
        birthday: formattedBirthday,
        user_id: user._id,
      });

      const refreshedKids = await KidsService.getKidsByUserId(user._id);
      updateKids(refreshedKids);

      setShowKidForm(false);
      setKidData({ name: "", lastname: "", birthday: "", specialNeed: "none" });
    } catch (error) {
      console.error("Failed to add kid", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenUpgrade = async () => {
    try {
      setIsLoading(true);
      const plans = await SubscriptionsService.getSubscriptions();
      const premium = plans.find((p) => p.price > 0) || null;
      setPremiumPlan(premium);
      setShowUpgradeModal(true);
    } catch (err) {
      console.error("Failed to fetch subscription plans", err);
      toast.error("Could not load plans. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!user?._id) return;
    setIsCancelling(true);
    try {
      const updatedUser = await SubscriptionsService.cancelSubscription(user._id);
      updateUser(updatedUser);
      setShowCancelModal(false);
      toast.success("Subscription cancelled successfully. You are now on the Free plan.");
    } catch (err: any) {
      console.error("Failed to cancel subscription", err);
      toast.error(err.message || "Failed to cancel subscription.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-5 py-6">
      {/* Profile Header */}
      <div className="flex items-center gap-4 rounded-3xl bg-deep-gradient p-6 text-on-brand">
        <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-brand-orange font-display text-4xl font-bold">
          {(user?.name ?? "T").charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-3xl capitalize">
            {user?.name} {user?.lastname}
          </h1>
          <p className="truncate opacity-90">{user?.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-3xl bg-card p-5 shadow-soft">
            <div className={`grid h-12 w-12 place-items-center rounded-2xl ${s.tone} text-on-brand`}>
              <s.icon className="h-6 w-6" />
            </div>
            <p className="mt-3 font-display text-3xl font-bold text-brand-deep">{s.value}</p>
            <p className="text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Subscription Management Section */}
      <div className="mt-8 rounded-3xl bg-card p-6 shadow-soft border border-border/60">
        <div className="flex items-center justify-between border-b border-border/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-blue/10 text-brand-blue">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-brand-deep">Subscription & Membership</h2>
              <p className="text-xs text-muted-foreground">Manage your billing plan and AI tokens</p>
            </div>
          </div>

          <div>
            {isSubscribed ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-green/15 px-3 py-1 text-xs font-bold text-brand-green">
                <CheckCircle2 className="h-3.5 w-3.5" /> Premium Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
                Free Plan
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* Plan Details Card */}
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Current Plan
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <h3 className="font-display text-2xl font-bold text-brand-deep">
                {isSubscribed ? "Talki Premium" : "Talki Free"}
              </h3>
              <span className="text-sm font-semibold text-muted-foreground">
                {isSubscribed ? "$9.99 USD / mo" : "$0.00"}
              </span>
            </div>

            <p className="mt-2 text-xs text-muted-foreground">
              {isSubscribed
                ? "Full access to Talki Chat AI, interactive Talki Train games, voice-to-picto, and monthly therapy tokens."
                : "Basic access to saved phrases and pictogram directory. Talki Chat & Train are locked."}
            </p>

            <div className="mt-4 flex items-center gap-2 rounded-xl bg-card p-3 shadow-xs border border-border/60">
              <Coins className="h-5 w-5 text-brand-yellow" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">Available Tokens</p>
                <p className="font-display text-lg font-bold text-brand-deep">
                  {user?.tokensAvailable ?? (isSubscribed ? 500 : 0)}{" "}
                  <span className="text-xs font-normal text-muted-foreground">tokens</span>
                </p>
              </div>
            </div>
          </div>

          {/* Plan Actions & Benefits */}
          <div className="flex flex-col justify-between rounded-2xl border border-border/60 bg-muted/20 p-5">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Plan Features
              </span>
              <ul className="mt-2 space-y-2 text-xs text-brand-deep">
                <li className="flex items-center gap-2">
                  <CheckCircle2
                    className={`h-4 w-4 shrink-0 ${isSubscribed ? "text-brand-green" : "text-muted-foreground opacity-40"}`}
                  />
                  <span className={isSubscribed ? "font-medium" : "text-muted-foreground"}>
                    Talki Chat (AI Autism & Speech Assistant)
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2
                    className={`h-4 w-4 shrink-0 ${isSubscribed ? "text-brand-green" : "text-muted-foreground opacity-40"}`}
                  />
                  <span className={isSubscribed ? "font-medium" : "text-muted-foreground"}>
                    Talki Train (Gamified Pictogram Lessons)
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-green shrink-0" />
                  <span className="font-medium">Saved Phrases & Directory</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-3 border-t border-border/60">
              {isSubscribed ? (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground">Renews monthly</span>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="rounded-full border border-destructive/30 px-4 py-2 text-xs font-bold text-destructive transition hover:bg-destructive/10"
                  >
                    Cancel Subscription
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleOpenUpgrade}
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-deep py-2.5 text-sm font-bold text-white shadow-pop transition hover:bg-brand-deep/90 active:translate-y-0.5 disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4 text-brand-yellow" />
                  Upgrade to Premium ($9.99/mo)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* My Kids */}
      <div className="mt-8 rounded-3xl bg-card p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-brand-deep">My Kids</h2>
          {!showKidForm && (
            <button
              onClick={() => setShowKidForm(true)}
              className="flex items-center gap-2 rounded-full bg-brand-deep px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-deep/90"
            >
              <Plus className="h-4 w-4" /> Add Kid
            </button>
          )}
        </div>

        {kids.length > 0 && !showKidForm && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {kids.map((kid) => {
              const isActive = activeKid?._id === kid._id;

              return (
                <div
                  key={kid._id}
                  onClick={() => setViewKidModal(kid)}
                  className={`flex flex-col gap-4 rounded-2xl border p-4 cursor-pointer transition hover:shadow-md ${
                    isActive ? "border-brand-blue bg-brand-blue/5" : "border-border bg-background"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-blue/10 text-brand-blue">
                      <Baby className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-bold capitalize text-foreground flex items-center gap-2">
                        {kid.name} {kid.lastname}
                        {isActive && (
                          <span className="flex items-center gap-1 rounded-full bg-brand-blue/10 px-2 py-0.5 text-xs font-semibold text-brand-blue">
                            <CheckCircle2 className="h-3 w-3" /> Active
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">{calculateAge(kid.birthday)} years old</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showKidForm && (
          <form onSubmit={handleAddKid} className="mt-6 flex flex-col gap-4">
            <h3 className="text-lg font-bold text-brand-deep">Add a New Kid Profile</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="kidName" className="mb-1 block text-sm font-medium text-muted-foreground">
                  First Name
                </label>
                <input
                  id="kidName"
                  type="text"
                  required
                  value={kidData.name}
                  onChange={(e) => setKidData({ ...kidData, name: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 outline-none transition focus:border-brand-blue focus:ring-1 focus:ring-brand-blue text-foreground"
                />
              </div>
              <div>
                <label htmlFor="kidLastname" className="mb-1 block text-sm font-medium text-muted-foreground">
                  Last Name
                </label>
                <input
                  id="kidLastname"
                  type="text"
                  required
                  value={kidData.lastname}
                  onChange={(e) => setKidData({ ...kidData, lastname: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 outline-none transition focus:border-brand-blue focus:ring-1 focus:ring-brand-blue text-foreground"
                />
              </div>
              <div>
                <label htmlFor="birthday" className="mb-1 block text-sm font-medium text-muted-foreground">
                  Birthday
                </label>
                <input
                  id="birthday"
                  type="date"
                  required
                  value={kidData.birthday}
                  onChange={(e) => setKidData({ ...kidData, birthday: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 outline-none transition focus:border-brand-blue focus:ring-1 focus:ring-brand-blue text-foreground"
                />
              </div>
              <div>
                <label htmlFor="specialNeed" className="mb-1 block text-sm font-medium text-muted-foreground">
                  Special Need
                </label>
                <select
                  id="specialNeed"
                  required
                  value={kidData.specialNeed}
                  onChange={(e) => setKidData({ ...kidData, specialNeed: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 outline-none transition focus:border-brand-blue focus:ring-1 focus:ring-brand-blue text-foreground"
                >
                  <option value="none">None</option>
                  <option value="down_syndrome">Down Syndrome</option>
                  <option value="autism">Autism</option>
                  <option value="speech">Speech</option>
                </select>
              </div>
            </div>
            <div className="mt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowKidForm(false)}
                className="rounded-full border border-border px-6 py-2.5 text-sm font-bold text-foreground transition hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-full bg-brand-deep px-6 py-2.5 text-sm font-bold text-white shadow-pop transition hover:bg-brand-deep/90 disabled:opacity-50"
              >
                {isLoading ? "Saving..." : "Add Kid"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Kid Modal */}
      {viewKidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-xl border border-border relative">
            <button
              onClick={() => setViewKidModal(null)}
              className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center text-center mt-2">
              <div className="grid h-20 w-20 place-items-center rounded-full bg-brand-blue/10 text-brand-blue mb-4">
                <Baby className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold text-brand-deep capitalize">
                {viewKidModal.name} {viewKidModal.lastname}
              </h2>

              <div className="mt-6 w-full space-y-4">
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Age</span>
                  <span className="font-bold text-foreground">{calculateAge(viewKidModal.birthday)} years</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Birthday</span>
                  <span className="font-bold text-foreground">
                    {new Date(viewKidModal.birthday).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Special Need</span>
                  <span className="font-bold text-foreground capitalize">
                    {viewKidModal.specialNeed.replace("_", " ")}
                  </span>
                </div>
              </div>

              {activeKid?._id !== viewKidModal._id && (
                <button
                  onClick={() => {
                    setActiveKid(viewKidModal);
                    setViewKidModal(null);
                  }}
                  className="mt-8 w-full rounded-full bg-brand-blue py-3 font-bold text-white shadow-pop transition hover:bg-brand-blue/90"
                >
                  Set as Default Kid
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cancel Subscription Confirmation Dialog */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-card p-6 shadow-xl ring-1 ring-border/20">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="h-7 w-7" />
            </div>

            <div className="mt-4 text-center">
              <h3 className="text-xl font-bold text-brand-deep">Cancel Subscription?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Are you sure you want to cancel your Premium membership? You will immediately lose access to Talki Chat,
                interactive Talki Train lessons, and remaining AI tokens.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-destructive py-3 text-sm font-bold text-white transition hover:bg-destructive/90 active:translate-y-0.5 disabled:opacity-50"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Yes, Cancel Subscription"
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
                className="w-full rounded-full border border-border py-2.5 text-sm font-bold text-foreground hover:bg-muted"
              >
                Keep My Membership
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade to Premium Stripe Modal */}
      {user && premiumPlan && (
        <StripePaymentModal
          plan={premiumPlan}
          userId={user._id}
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          onSuccess={(updated) => {
            updateUser(updated);
            setShowUpgradeModal(false);
          }}
        />
      )}
    </div>
  );
}
