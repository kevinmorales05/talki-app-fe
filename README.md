# Talki: Your Voice, Amplified

Build a responsive web application called **Talki**. Talki is an inclusive, AI-powered educational and communication platform designed to help children with autism, Down syndrome, and speech/developmental needs using pictograms and conversational AI.

**Typography & Global Styles**
Import the following fonts from Google Fonts:
`@import url('[https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@400;600;700&display=swap](https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@400;600;700&display=swap)');`

Apply these global CSS rules:

```css
h1 {
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
}
h2, h3 {
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
}
body, p {
  font-family: 'Nunito', sans-serif;
  font-weight: 400;
}

```

**Brand Color Palette**
Define these as CSS variables or Tailwind theme colors to be used throughout the UI:

* **Primary Dark Blue (Azul profundo):** `#003990`
* **Primary Bright Blue (Azul brillante):** `#019AFD`
* **Success Green (Verde):** `#2ECB5E`
* **Accent Orange (Naranja):** `#FD9D00`
* **Accent Coral (Coral):** `#FC4B5F`
* **Accent Yellow (Amarillo):** `#FCBE00`

**Application Architecture & Views**

**1. Welcome / Hero Landing Page**
Design a warm, engaging, and highly visual landing page that explains the value of Talki.

* **Hero Section:** A welcoming headline (e.g., "Give Every Child a Voice with Talki") with an illustration of AI and pictograms. Include a prominent "Login / Get Started" button.
* **The Challenge (Statistics):** Include a section highlighting the need for this tool in the US. Use these statistics: "In the United States, 1 in 31 children is identified with autism, and 1 in 6 children has a developmental delay or disability. Talki is here to support them."
* **Features & Advantages Section:** Highlight how the app works:
* *AI-Powered Support:* Explain how AI adapts to each child's learning pace and answers parents' questions about autism and development.
* *Pictogram Communication:* Show how visual pictograms bridge communication gaps for children with Down syndrome and speech delays, reducing daily frustration.
* *Interactive Training:* Mention the Duolingo-style gamified learning that keeps kids engaged.



**2. Login Page**

* Create a simple, clean login screen.
* Include an email/password form and a "Login with Google" button.
* Mock the authentication state (assume Firebase auth is implemented) so that clicking "Login" immediately routes the user to the Dashboard.

**3. Dashboard Navigation (Responsive Design)**

* **Desktop:** Implement a fixed left sidebar menu. It should include links for: "Talki Chat", "Train", "Saved Phrases", "Profile", and a "Log Out" button at the bottom.
* **Mobile First Adaptation:** Hide the sidebar on mobile. Instead, implement a bottom tab navigation bar featuring icons for "Talki Chat", "Train", and "Saved Phrases". Place a User Avatar icon in the top right header area to access the "Profile" and "Log Out" options.

**4. Dashboard Core Features (Views)**

* **Talki Chat:** An AI chat interface tailored for parents and educators to ask questions about autism, speech therapy tips, and developmental advice. Style it like a modern messaging app using the brand's blue and white tones.
* **Train:** A gamified, Duolingo-style interface where kids practice forming phrases using pictograms. Include a progress bar, large visual cards (using the Coral, Yellow, and Green brand colors), and positive reinforcement UI elements.
* **Saved Phrases:** A grid or list view where users can see and replay their favorite or most frequently used pictogram sentences. Use clean cards with rounded corners.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3ae13b5b-b5f2-4c0a-824a-ec7e639dd69c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
