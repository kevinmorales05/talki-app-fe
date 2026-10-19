import { useState, useEffect } from "react";
import { Check, Sparkles, Shield, ArrowRight, Loader2, Star } from "lucide-react";
import { SubscriptionsService, type SubscriptionPlan } from "@/services/subscriptions.service";
import { StripePaymentModal } from "./StripePaymentModal";

interface PlanSelectionSectionProps {
  userId: string;
  onSelectFree: (plan: SubscriptionPlan) => void;
  onSuccessPremium: (user: any) => void;
  onSkip?: () => void;
  isSubmitting?: boolean;
}

export function PlanSelectionSection({
  userId,
  onSelectFree,
  onSuccessPremium,
  onSkip,
  isSubmitting = false,
}: PlanSelectionSectionProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<SubscriptionPlan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    SubscriptionsService.getSubscriptions()
      .then((data) => setPlans(data))
      .catch((err) => console.error("Failed to load plans", err))
      .finally(() => setLoading(false));
  }, []);

  const freePlan = plans.find((p) => p.price === 0) || {
    _id: "free",
    name: "Free",
    description: "Basic access to Talki with saved phrases",
    price: 0,
    currency: "USD",
    tokensIncluded: 0,
    features: [
      "Access to Saved Phrases",
      "Basic Pictogram Directory",
      "1 Child Profile",
    ],
  };

  const premiumPlan = plans.find((p) => p.price > 0) || {
    _id: "premium",
    name: "Premium",
    description: "Full access to Talki Chat, Train games, AI speech therapy, and monthly tokens",
    price: 9.99,
    currency: "USD",
    tokensIncluded: 500,
    features: [
      "Unlimited Talki Chat AI",
      "Interactive Talki Train Games",
      "Voice & Speech Analysis",
      "500 AI Monthly Tokens",
      "Multiple Child Profiles",
    ],
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
        <p className="mt-3 text-sm">Loading available plans...</p>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-brand-deep">Choose Your Talki Plan</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Select Free to explore, or unlock full AI power with Premium.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Free Plan Card */}
        <div className="relative flex flex-col justify-between rounded-3xl border border-border bg-card p-5 shadow-xs transition hover:border-brand-blue/40">
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
                Freemium
              </span>
            </div>

            <h3 className="mt-3 text-xl font-bold text-brand-deep">{freePlan.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{freePlan.description}</p>

            <div className="my-4">
              <span className="font-display text-3xl font-bold text-brand-deep">$0</span>
              <span className="text-xs text-muted-foreground"> / forever</span>
            </div>

            <ul className="space-y-2 text-xs text-brand-deep">
              {freePlan.features.map((feat) => (
                <li key={feat} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-brand-green shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
              <li className="flex items-center gap-2 text-muted-foreground opacity-60">
                <span className="ml-6 text-[11px]">✕ Talki Chat & Train locked</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => onSelectFree(freePlan)}
            disabled={isSubmitting}
            className="mt-6 w-full rounded-full border border-border bg-muted/60 py-2.5 text-sm font-bold text-brand-deep transition hover:bg-muted active:translate-y-0.5 disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Continue with Free"}
          </button>
        </div>

        {/* Premium Plan Card */}
        <div className="relative flex flex-col justify-between rounded-3xl border-2 border-brand-orange bg-card p-5 shadow-soft transition hover:shadow-md">
          <div className="absolute -top-3 right-4 rounded-full bg-brand-orange px-3 py-0.5 text-xs font-bold text-white shadow-xs">
            ★ Recommended
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-brand-orange" />
              <span className="rounded-full bg-brand-orange/15 px-3 py-1 text-xs font-bold text-brand-orange">
                All Access
              </span>
            </div>

            <h3 className="mt-3 text-xl font-bold text-brand-deep">{premiumPlan.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{premiumPlan.description}</p>

            <div className="my-4">
              <span className="font-display text-3xl font-bold text-brand-deep">
                ${premiumPlan.price}
              </span>
              <span className="text-xs text-muted-foreground"> USD / month</span>
            </div>

            <ul className="space-y-2 text-xs text-brand-deep">
              {premiumPlan.features.map((feat) => (
                <li key={feat} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-brand-orange shrink-0" />
                  <span className="font-medium">{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedPlanForPayment(premiumPlan);
              setIsModalOpen(true);
            }}
            disabled={isSubmitting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand-deep py-2.5 text-sm font-bold text-white shadow-pop transition hover:bg-brand-deep/90 active:translate-y-0.5 disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4 text-brand-yellow" />
            Subscribe for $9.99/mo
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {onSkip && (
        <div className="text-center">
          <button
            type="button"
            onClick={onSkip}
            className="text-xs font-semibold text-muted-foreground hover:text-brand-deep underline underline-offset-4"
          >
            Skip for now (enter with limited access)
          </button>
        </div>
      )}

      {selectedPlanForPayment && (
        <StripePaymentModal
          plan={selectedPlanForPayment}
          userId={userId}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={(user) => {
            setIsModalOpen(false);
            onSuccessPremium(user);
          }}
        />
      )}
    </div>
  );
}
