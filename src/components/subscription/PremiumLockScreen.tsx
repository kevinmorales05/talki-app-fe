import { useState } from "react";
import { Lock, Sparkles, CheckCircle2, MessageCircle, Star, ArrowRight } from "lucide-react";
import { StripePaymentModal } from "./StripePaymentModal";
import { SubscriptionsService, type SubscriptionPlan } from "@/services/subscriptions.service";
import { useUser } from "@/contexts/UserContext";

interface PremiumLockScreenProps {
  title: string;
  description: string;
  feature: "chat" | "train";
}

export function PremiumLockScreen({ title, description, feature }: PremiumLockScreenProps) {
  const { user, updateUser } = useUser();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenSubscribe = async () => {
    try {
      setIsLoading(true);
      const allPlans = plans.length > 0 ? plans : await SubscriptionsService.getSubscriptions();
      setPlans(allPlans);
      const premium = allPlans.find((p) => p.price > 0) || allPlans[0];
      setSelectedPlan(premium);
      setShowModal(true);
    } catch (err) {
      console.error("Failed to load plans", err);
    } finally {
      setIsLoading(false);
    }
  };

  const isChat = feature === "chat";

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
      <div className="mx-auto max-w-md rounded-3xl bg-card p-8 shadow-soft border border-border/60">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-orange/15 text-brand-orange">
          {isChat ? <MessageCircle className="h-8 w-8" /> : <Star className="h-8 w-8" />}
        </div>

        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand-orange/10 px-3 py-1 text-xs font-bold text-brand-orange">
          <Lock className="h-3.5 w-3.5" /> Premium Feature
        </div>

        <h2 className="mt-3 text-2xl font-bold text-brand-deep">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>

        <div className="mt-6 space-y-2.5 rounded-2xl bg-muted/40 p-4 text-left text-sm text-brand-deep">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-brand-green shrink-0" />
            <span>Unlimited AI conversations & speech therapy advice</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-brand-green shrink-0" />
            <span>Gamified pictogram training exercises</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-brand-green shrink-0" />
            <span>500 AI monthly tokens included</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-brand-green shrink-0" />
            <span>Multiple child profiles support</span>
          </div>
        </div>

        <button
          onClick={handleOpenSubscribe}
          disabled={isLoading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand-deep py-3.5 px-6 font-display text-lg font-bold text-white shadow-pop transition hover:bg-brand-deep/90 active:translate-y-0.5 disabled:opacity-50"
        >
          <Sparkles className="h-5 w-5 text-brand-yellow" />
          {isLoading ? "Loading..." : "Unlock Premium for $9.99/mo"}
          <ArrowRight className="h-4 w-4" />
        </button>

        <p className="mt-3 text-xs text-muted-foreground">
          Cancel anytime from your profile. Secure payment with Stripe.
        </p>
      </div>

      {user && selectedPlan && (
        <StripePaymentModal
          plan={selectedPlan}
          userId={user._id}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={(updatedUser) => {
            updateUser(updatedUser);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
