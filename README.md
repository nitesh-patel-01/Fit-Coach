# Fit Coach 💪

AI-inspired personal trainer web app — **timer-guided workouts**, meal plans, progress tracking. No gym trainer needed.

Made by **Nitesh Patel** • 📞 7974823298 • ✉️ niteshpatel7479@gmail.com

---

## ✨ Features

- **🎯 Guided Timer Workouts** — countdown → active set timer → rest timer → repeat
- **🇮🇳 Indian English Voice Coach** — voice cues ("Get ready", "Focus on form", "10 seconds remaining")
- **🍱 Meal Plans** — veg + non-veg options, goal-based (cut / maintain / bulk)
- **💧 Water Tracker** — glass-by-glass logging
- **📊 Progress Dashboard** — weight, measurements, streak, XP, achievements
- **🌓 Dark / Light Themes**
- **🔒 100% Local** — all data stored in browser localStorage, zero backend required

---

## 📦 Quick Start (Local)

No build step, no npm install. Just serve the folder:

```bash
cd fitcoach-v2
python -m http.server 8000
```

Open http://localhost:8000

On Windows:
```cmd
cd fitcoach-v2
python -m http.server 8000
```

---

## 🚀 Deploy to Production

### Option 1 — **Vercel (easiest)**

```bash
cd fitcoach-v2
npx vercel
```

Follow prompts. That's it. Live URL in 30 seconds.

### Option 2 — **GitHub Pages**

1. Create a new GitHub repo, push this folder
2. Repo Settings → Pages → Source: `main` branch, `/root` folder
3. Save. URL: `https://<username>.github.io/<repo>/`

### Option 3 — **Netlify Drop**

1. Visit https://app.netlify.com/drop
2. Drag-and-drop the `fitcoach-v2` folder
3. Done — instant live URL

### Option 4 — **Any static host**

Any web host that serves static files works (Cloudflare Pages, Firebase Hosting, AWS S3, etc.). No server code needed.

---

## 🗂️ Project Structure

```
fitcoach-v2/
├── index.html              ← Entry point (welcome → onboarding → dashboard → workout)
├── styles.css              ← Complete dark/light theme, fully responsive
├── app.js                  ← Main orchestrator (~1100 lines)
├── manifest.json           ← PWA manifest (installable as app)
├── robots.txt              ← SEO — allow all crawlers
├── sitemap.xml             ← SEO — sitemap for Google Search Console
├── README.md
└── modules/
    ├── storage.js          ← localStorage wrapper
    ├── utils.js            ← BMI/BMR/TDEE calculators, helpers
    ├── voiceEngine.js      ← Indian English speech synthesis
    ├── onboarding.js       ← Welcome + profile setup form
    ├── workoutEngine.js    ← Exercise DB (4 × 3 sets), schedules
    ├── dietEngine.js       ← Food DB, meal plans, nutrition targets
    ├── progressEngine.js   ← Weight/measurements/streak/water logging
    ├── aiEngine.js         ← Workout history + adaptive recommendations
    ├── gamification.js     ← XP, levels, achievements
    └── exerciseAnimations.js ← Exercise images (paste ANY image URL)
```

---

## 🔑 Access

The app now opens with a **Welcome screen + Get Started button** — no code required. First-time users flow directly to the profile form; returning users skip straight to the dashboard.

---

## 🖼️ Swap Exercise Images — Any URL

The app now accepts **any direct image URL** for each exercise (Google Images, Freepik, Pexels, Unsplash, Imgur, your own CDN — anything).

1. Open `modules/exerciseAnimations.js`
2. Find the exercise key inside `MALE_IMAGES` or `FEMALE_IMAGES`
3. Replace its URL string with your new image URL
4. Save → reload browser

**URL tips:**
- Must be a DIRECT image link (ends in `.jpg` / `.png` / `.webp`)
- Google Images → right-click → "Copy image address"
- Freepik → use the CDN URL after downloading
- Cards auto-size to any aspect ratio — **images are always fully visible, never cropped**

---

## 🔍 SEO

Comes pre-wired for Google indexing:

- ✅ Rich meta title, description, keywords (Indian fitness niche)
- ✅ Open Graph tags (Facebook, WhatsApp, LinkedIn previews)
- ✅ Twitter card tags
- ✅ JSON-LD structured data (WebApplication, FAQPage, Organization)
- ✅ `robots.txt` + `sitemap.xml`
- ✅ PWA `manifest.json` (installable as Android/iOS app)
- ✅ Canonical URL
- ✅ Semantic `<h1>` / `<h2>` hierarchy with hidden SEO content
- ✅ `<noscript>` fallback for crawlers that don't run JS

**After deployment**, update `https://fitcoach.app/` in:
- `<link rel="canonical">` inside `index.html`
- `og:url` inside `index.html`
- `Sitemap:` inside `robots.txt`
- `<loc>` inside `sitemap.xml`

Then submit the sitemap to Google Search Console for indexing.

---

## 🎤 Voice Notes

The app uses the browser's built-in `speechSynthesis` API. It prefers, in order:
1. **en-IN** (Indian English) voice if installed
2. Voices with "India"/"Indian"/"Rishi"/"Veena"/"Neerja" in the name
3. **en-GB** (British) as fallback
4. Any English voice

**Tip:** On Windows, install Hindi/English voices via *Settings → Time & Language → Language → Add language (English (India))*. On Android Chrome, Google's Indian English voices are built-in.

---

## 🛠️ Tech Stack

- **Zero dependencies.** No npm, no build step, no bundler
- Pure vanilla HTML + CSS + ES6 modules
- LocalStorage for persistence
- Web Speech API for voice
- Works offline once loaded

---

## 📝 License

© 2026 MBG Card Pvt. Ltd. All rights reserved.
