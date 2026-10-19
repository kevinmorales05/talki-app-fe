import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { X, Lock, CheckCircle2, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { SubscriptionsService, type SubscriptionPlan } from "@/services/subscriptions.service";
import { toast } from "sonner";

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

interface CheckoutFormProps {
  plan: SubscriptionPlan;
  userId: string;
  onSuccess: (user: any) => void;
  onCancel: () => void;
}

function CheckoutForm({ plan, userId, onSuccess, onCancel }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message ?? "An error occurred with your payment.");
        setIsProcessing(false);
        return;
      }

      if (paymentIntent && (paymentIntent.status === "succeeded" || paymentIntent.status === "processing")) {
        const updatedUser = await SubscriptionsService.subscribeUser(
          userId,
          plan._id,
          paymentIntent.id
        );
        toast.success("Welcome to Talki Premium! Your subscription is active.");
        onSuccess(updatedUser);
      } else {
        // Fallback subscription call if status is non-terminal
        const updatedUser = await SubscriptionsService.subscribeUser(userId, plan._id);
        toast.success("Subscription activated!");
        onSuccess(updatedUser);
      }
    } catch (err: any) {
      console.error("Subscription payment error:", err);
      setErrorMessage(err.message || "Failed to complete subscription.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="rounded-2xl border border-border/80 bg-muted/40 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-orange" />
            <span className="font-bold text-brand-deep">{plan.name} Membership</span>
          </div>
          <span className="font-display text-xl font-bold text-brand-deep">
            ${plan.price} <span className="text-xs font-normal text-muted-foreground">/ month</span>
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{plan.description}</p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-xs">
        <PaymentElement />
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-deep py-2.5 px-6 font-display text-base font-bold text-white shadow-pop transition hover:bg-brand-deep/90 active:translate-y-0.5 disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              Pay ${plan.price} & Activate
            </>
          )}
        </button>
      </div>
    </form>
  );
}

interface StripePaymentModalProps {
  plan: SubscriptionPlan | null;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedUser: any) => void;
}

export function StripePaymentModal({
  plan,
  userId,
  isOpen,
  onClose,
  onSuccess,
}: StripePaymentModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingSecret, setLoadingSecret] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && plan && plan.price > 0 && userId) {
      setLoadingSecret(true);
      setInitError(null);
      SubscriptionsService.createPaymentIntent(userId, plan._id)
        .then((res) => {
          if (res.clientSecret) {
            setClientSecret(res.clientSecret);
          } else {
            setInitError("Could not initialize Stripe payment session.");
          }
        })
        .catch((err) => {
          console.error("Failed to create payment intent", err);
          setInitError(err.message || "Failed to initialize payment.");
        })
        .finally(() => setLoadingSecret(false));
    } else {
      setClientSecret(null);
    }
  }, [isOpen, plan, userId]);

  if (!isOpen || !plan) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-card p-6 shadow-xl ring-1 ring-border/20 md:p-8">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-muted-foreground hover:bg-muted"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-brand-orange/10 text-brand-orange">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-brand-deep">Upgrade to Talki Premium</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Get unlimited access to AI Chat, interactive games, and speech exercises.
          </p>
        </div>

        {loadingSecret ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
            <p className="mt-3 text-sm">Preparing secure checkout...</p>
          </div>
        ) : initError ? (
          <div className="py-6 text-center">
            <p className="text-sm text-destructive">{initError}</p>
            <button
              onClick={onClose}
              className="mt-4 rounded-full bg-muted px-4 py-2 text-sm font-bold"
            >
              Close
            </button>
          </div>
        ) : clientSecret && stripePromise ? (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: "stripe",
                variables: {
                  colorPrimary: "#1E3A8A",
                  borderRadius: "12px",
                  fontFamily: "Nunito, sans-serif",
                },
              },
            }}
          >
            <CheckoutForm
              plan={plan}
              userId={userId}
              onSuccess={(user) => {
                onSuccess(user);
                onClose();
              }}
              onCancel={onClose}
            />
          </Elements>
        ) : (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Unable to load Stripe checkout. Please verify your Stripe configuration.
          </div>
        )}
      </div>
    </div>
  );
}
