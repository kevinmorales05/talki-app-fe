import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
const logo = "/talki-logo.png";
import bgDesktop from "@/assets/login-desktop.jpg";
import bgMobile from "@/assets/login-mobile.jpg";

import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { UsersService } from "@/services/users.service";
import { KidsService } from "@/services/kids.service";
import { useUser, type KidData } from "@/contexts/UserContext";
import { PlanSelectionSection } from "@/components/subscription/PlanSelectionSection";
import { SubscriptionsService, type SubscriptionPlan } from "@/services/subscriptions.service";
import { toast } from "sonner";

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
  const { loginUser } = useUser();
  const [needsRegistration, setNeedsRegistration] = useState(false);
  const [needsKidRegistration, setNeedsKidRegistration] = useState(false);
  const [needsSubscription, setNeedsSubscription] = useState(false);
  const [createdUser, setCreatedUser] = useState<any>(null);
  const [registeredKids, setRegisteredKids] = useState<KidData[]>([]);
  const [firebaseToken, setFirebaseToken] = useState<string>("");

  const [formData, setFormData] = useState({ name: "", lastname: "", email: "", firebase_id: "" });
  const [kidData, setKidData] = useState({ name: "", lastname: "", birthday: "", specialNeed: "none" });
  const [isLoading, setIsLoading] = useState(false);

  const go = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const email = user.email || "google.user@gmail.com";
      const token = await user.getIdToken();

      setIsLoading(true);
      const existingUser = await UsersService.findByEmail(email);
      setIsLoading(false);

      if (existingUser) {
        const kids = await KidsService.getKidsByUserId(existingUser._id);
        
        if (kids.length === 0) {
          setCreatedUser(existingUser);
          setFirebaseToken(token);
          setNeedsKidRegistration(true);
        } else {
          loginUser(existingUser, kids, token);
          navigate({ to: existingUser.state ? "/app/chat" : "/app/saved" });
        }
      } else {
        const displayName = user.displayName || "";
        const parts = displayName.split(" ");
        const name = parts[0] || "";
        const lastname = parts.slice(1).join(" ") || "";

        setFormData({
          name,
          lastname,
          email,
          firebase_id: user.uid,
        });
        setFirebaseToken(token);
        setNeedsRegistration(true);
      }
    } catch (error) {
      console.error("Firebase Login Error", error);
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await UsersService.createUser(formData);
      setIsLoading(false);
      
      setCreatedUser(response);
      setNeedsRegistration(false);
      setNeedsKidRegistration(true);
    } catch (error) {
      console.error("Registration request failed", error);
      setIsLoading(false);
    }
  };

  const handleKidRegister = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formattedBirthday = new Date(kidData.birthday).toISOString();
      const kidResponse = await KidsService.createKid({
        ...kidData,
        birthday: formattedBirthday,
        user_id: createdUser._id,
      });
      setIsLoading(false);
      
      setRegisteredKids([kidResponse]);
      setNeedsKidRegistration(false);
      setNeedsSubscription(true);
    } catch (error) {
      console.error("Kid registration request failed", error);
      setIsLoading(false);
    }
  };

  const handleSelectFree = async (plan: SubscriptionPlan) => {
    setIsLoading(true);
    try {
      const updated = await SubscriptionsService.subscribeUser(createdUser._id, plan._id);
      loginUser(updated || createdUser, registeredKids, firebaseToken);
      toast.info("You're on the Free plan. Talki Chat & Train can be unlocked anytime!");
      navigate({ to: "/app/saved" });
    } catch (err) {
      console.error("Error setting free subscription", err);
      loginUser(createdUser, registeredKids, firebaseToken);
      navigate({ to: "/app/saved" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessPremium = (updatedUser: any) => {
    loginUser(updatedUser, registeredKids, firebaseToken);
    toast.success("Welcome to Talki Premium! All features are unlocked.");
    navigate({ to: "/app/chat" });
  };

  const handleSkipSubscription = async () => {
    setIsLoading(true);
    try {
      // Find free subscription plan
      const plans = await SubscriptionsService.getSubscriptions();
      const freePlan = plans.find((p) => p.price === 0);
      if (freePlan) {
        const updated = await SubscriptionsService.subscribeUser(createdUser._id, freePlan._id);
        loginUser(updated || createdUser, registeredKids, firebaseToken);
      } else {
        loginUser(createdUser, registeredKids, firebaseToken);
      }
    } catch (err) {
      loginUser(createdUser, registeredKids, firebaseToken);
    } finally {
      setIsLoading(false);
      navigate({ to: "/app/saved" });
    }
  };

  return (
    <div className="relative isolate flex min-h-screen items-end justify-center px-5 py-10 md:items-center md:justify-start md:px-16">
      <picture className="absolute inset-0 -z-10">
        <source media="(min-width: 768px)" srcSet={bgDesktop} />
        <img src={bgMobile} alt="A mother teaching her child with Talki" className="h-full w-full object-cover" />
      </picture>
      <div className="absolute inset-0 -z-10 bg-brand-deep/25" />
      <div
        className={`w-full rounded-[2rem] bg-card/95 p-8 shadow-soft backdrop-blur transition-all duration-300 ${
          needsSubscription ? "max-w-2xl" : "max-w-md"
        }`}
      >
        <Link to="/" className="flex flex-col items-center">
          <img src={logo} alt="Talki" width={1774} height={887} className="h-20 w-auto" />
          <h1 className="mt-2 text-3xl text-brand-deep">Welcome to Talki</h1>
        </Link>

        {/* 1. Google Login Screen */}
        {!needsRegistration && !needsKidRegistration && !needsSubscription && (
          <>
            <p className="mt-1 text-center text-muted-foreground">Log in to continue</p>
            <button
              type="button"
              onClick={go}
              disabled={isLoading}
              className="mt-8 flex w-full items-center justify-center gap-3 rounded-full border-2 border-border bg-card py-3.5 text-lg font-bold text-brand-deep shadow-pop transition hover:bg-muted active:translate-y-1 disabled:opacity-50"
            >
              <span className="font-display text-xl text-brand-blue">G</span> 
              {isLoading ? "Signing in..." : "Login with Google"}
            </button>
          </>
        )}

        {/* 2. Parent Info Registration Form */}
        {needsRegistration && !needsKidRegistration && !needsSubscription && (
          <form onSubmit={handleRegister} className="mt-6 flex flex-col gap-4">
            <p className="text-center text-sm font-medium text-brand-deep">
              Please complete your details to finish setting up your account.
            </p>
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-muted-foreground">First Name</label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 outline-none transition focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
              />
            </div>
            <div>
              <label htmlFor="lastname" className="mb-1 block text-sm font-medium text-muted-foreground">Last Name</label>
              <input
                id="lastname"
                type="text"
                required
                value={formData.lastname}
                onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 outline-none transition focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-muted-foreground">Email</label>
              <input
                id="email"
                type="email"
                disabled
                value={formData.email}
                className="w-full rounded-xl border border-border bg-muted px-4 py-2.5 text-muted-foreground outline-none cursor-not-allowed"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 w-full rounded-full bg-brand-deep py-3 font-bold text-white shadow-pop transition hover:bg-brand-deep/90 active:translate-y-1 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Next: Add Kid Profile"}
            </button>
          </form>
        )}

        {/* 3. Kid Profile Registration Form */}
        {needsKidRegistration && !needsSubscription && (
          <form onSubmit={handleKidRegister} className="mt-6 flex flex-col gap-4">
            <p className="text-center text-sm font-medium text-brand-deep">
              Let's add a kid profile!
            </p>
            <div>
              <label htmlFor="kidName" className="mb-1 block text-sm font-medium text-muted-foreground">First Name</label>
              <input
                id="kidName"
                type="text"
                required
                value={kidData.name}
                onChange={(e) => setKidData({ ...kidData, name: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 outline-none transition focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
              />
            </div>
            <div>
              <label htmlFor="kidLastname" className="mb-1 block text-sm font-medium text-muted-foreground">Last Name</label>
              <input
                id="kidLastname"
                type="text"
                required
                value={kidData.lastname}
                onChange={(e) => setKidData({ ...kidData, lastname: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 outline-none transition focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
              />
            </div>
            <div>
              <label htmlFor="birthday" className="mb-1 block text-sm font-medium text-muted-foreground">Birthday</label>
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
              <label htmlFor="specialNeed" className="mb-1 block text-sm font-medium text-muted-foreground">Special Need</label>
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
            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 w-full rounded-full bg-brand-deep py-3 font-bold text-white shadow-pop transition hover:bg-brand-deep/90 active:translate-y-1 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Next: Choose Plan"}
            </button>
          </form>
        )}

        {/* 4. NEW STEP: Subscription Selection Step */}
        {needsSubscription && createdUser && (
          <PlanSelectionSection
            userId={createdUser._id}
            onSelectFree={handleSelectFree}
            onSuccessPremium={handleSuccessPremium}
            onSkip={handleSkipSubscription}
            isSubmitting={isLoading}
          />
        )}
      </div>
    </div>
  );
}
