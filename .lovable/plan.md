# Talki — Build Plan

## Visual direction
Warm, playful, child-friendly. Fredoka headlines, Nunito body. Brand palette: deep blue #003990, bright blue #019AFD, green #2ECB5E, orange #FD9D00, coral #FC4B5F, yellow #FCBE00. Rounded shapes, soft shadows, big touch targets, white/light-blue backgrounds.

## Pages
1. **Welcome (/)** — Hero ("Give Every Child a Voice with Talki") with a generated AI + pictogram illustration and a "Login / Get Started" button; Challenge section with the 1 in 31 / 1 in 6 statistics as big stat cards; Features section (AI-Powered Support, Pictogram Communication, Interactive Training); closing call to action and footer.
2. **Login (/login)** — Email/password form plus "Login with Google". Both act as a pretend sign-in (stored in the browser) and go straight to the dashboard. Firebase can be plugged in later.
3. **Dashboard area** (only reachable after pretend sign-in)
   - Desktop: fixed left sidebar — Talki Chat, Train, Saved Phrases, Profile, Log Out at the bottom.
   - Mobile: sidebar hidden; bottom tab bar (Chat, Train, Saved) and an avatar in the top-right header with a menu for Profile and Log Out.
   - **Talki Chat (/app/chat)** — messaging-style chat for parents/educators in blue and white, with suggested starter questions. Answers come from real AI, streamed live, with a caring, non-medical-advice tone. One conversation, cleared on refresh.
   - **Train (/app/train)** — Duolingo-style lessons: progress bar, a prompt ("Build: I want water"), large pictogram cards in coral/yellow/green, a sentence strip to build the phrase, check button, celebration feedback (stars, confetti, cheerful messages), and read-aloud using the browser's voice.
   - **Saved Phrases (/app/saved)** — grid of rounded cards showing pictogram sentences with a play button (reads aloud), favorite toggle and use count. Phrases completed in Train can be saved here (kept in the browser).
   - **Profile (/app/profile)** — child name, avatar, simple stats (streak, phrases learned).

## Technical details
- TanStack routes: `index`, `login`, `app` layout (sidebar/tab bar + Outlet, guarded by mock auth in localStorage), `app.chat`, `app.train`, `app.saved`, `app.profile`, each with its own head() metadata.
- Fonts via `<link>` in `__root.tsx`; brand colors as oklch tokens in `src/styles.css` with h1/h2/h3/body rules as requested.
- Pictograms: emoji-based cards in a local data file (no external pictogram library).
- AI chat: Lovable Cloud + Lovable AI Gateway, server route streaming with the default model, AI Elements chat components, graceful messages for rate-limit/credit errors.
- Text-to-speech via the browser's built-in speech synthesis.
