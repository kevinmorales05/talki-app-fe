import { createFileRoute } from "@tanstack/react-router";
import { Flame, Star, BookOpen, Plus, Baby, CheckCircle2, X } from "lucide-react";
import { useSavedPhrases } from "@/lib/talki";
import { useUser, type KidData } from "@/contexts/UserContext";
import { useState, type FormEvent } from "react";
import { KidsService } from "@/services/kids.service";

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

function calculateAge(birthday: string) {
  const diff = Date.now() - new Date(birthday).getTime();
  const ageDate = new Date(diff); 
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

function ProfilePage() {
  const { user, kids, activeKid, setActiveKid, updateKids } = useUser();
  const { phrases } = useSavedPhrases();
  
  const [showKidForm, setShowKidForm] = useState(false);
  const [kidData, setKidData] = useState({ name: "", lastname: "", birthday: "", specialNeed: "none" });
  const [isLoading, setIsLoading] = useState(false);
  const [viewKidModal, setViewKidModal] = useState<KidData | null>(null);

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

  return (
    <div className="mx-auto max-w-3xl px-5 py-6">
      {/* Profile Header */}
      <div className="flex items-center gap-4 rounded-3xl bg-deep-gradient p-6 text-on-brand">
        <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-brand-orange font-display text-4xl font-bold">
          {(user?.name ?? "T").charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-3xl capitalize">{user?.name} {user?.lastname}</h1>
          <p className="truncate opacity-90">{user?.email}</p>
        </div>
      </div>
      
      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-3xl bg-card p-5 shadow-soft">
            <div className={`grid h-12 w-12 place-items-center rounded-2xl ${s.tone} text-on-brand`}><s.icon className="h-6 w-6" /></div>
            <p className="mt-3 font-display text-3xl font-bold text-brand-deep">{s.value}</p>
            <p className="text-muted-foreground">{s.label}</p>
          </div>
        ))}
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
                  className={`flex flex-col gap-4 rounded-2xl border p-4 cursor-pointer transition hover:shadow-md ${isActive ? 'border-brand-blue bg-brand-blue/5' : 'border-border bg-background'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-blue/10 text-brand-blue">
                      <Baby className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-bold capitalize text-foreground flex items-center gap-2">
                        {kid.name} {kid.lastname}
                        {isActive && <CheckCircle2 className="h-4 w-4 text-brand-blue" />}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {calculateAge(kid.birthday)} years old
                      </p>
                    </div>
                  </div>
                  
                  {!isActive && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveKid(kid);
                      }}
                      className="mt-2 w-full rounded-full border border-brand-blue py-2 text-sm font-bold text-brand-blue transition hover:bg-brand-blue hover:text-white"
                    >
                      Set as Default
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Add Kid Form */}
        {showKidForm && (
          <form onSubmit={handleAddKid} className="mt-6 flex flex-col gap-4 rounded-2xl border border-border p-5 bg-background">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="kidName" className="mb-1 block text-sm font-medium text-muted-foreground">First Name</label>
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
                <label htmlFor="kidLastname" className="mb-1 block text-sm font-medium text-muted-foreground">Last Name</label>
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
    </div>
  );
}
