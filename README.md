# CreatorSpark AI ⚡🎬

> **"Your Ideas. Our AI. Viral Possibilities."**

A bright, fun, modern AI-powered creative assistant designed for YouTubers, video editors, and the next generation of content creators. Built with **Google Gemini 3.8 Flash**, **React 19**, **Express**, and **Tailwind CSS**.

---

## 🌟 Overview

Content creation shouldn't feel like staring at a blank screen or fighting complex tools. **CreatorSpark AI** transforms simple video ideas into viral YouTube blueprints in seconds. Whether you're producing long-form video essays, high-octane challenge videos, or 60-second YouTube Shorts, CreatorSpark AI delivers everything you need to boost your Click-Through Rate (CTR) and audience retention.

---

## 🚀 Core Features

### 1. 10 Catchy, High-CTR YouTube Titles
- **Psychological Hook Angles:** Titles generated across diverse behavioral triggers:
  - *Curiosity Gap* (uncovered mysteries & secrets)
  - *Extreme Stakes & Challenges* (high consequence & physical trials)
  - *Transformation Stories* (before vs after, 30-day journeys)
  - *Price Contrast* ($1 vs $1,000,000 value disparity)
  - *FOMO & Protective Warnings* ("Don't do X until you watch this")
  - *Ultimate Authority / Guides* (comprehensive 2026 roadmaps)
  - *Spectacle & World Records* (MrBeast-tier ambition)
- **Virality & CTR Indicators:** Real-time estimated CTR ranges (e.g. `16.2% - Very High`).
- **Mobile Preview Length Meter:** Live character counter with visual indicator flagging titles exceeding YouTube's 65-character mobile truncation threshold.
- **CTR Psychology Breakdown:** Explains why viewers are compelled to click on each headline.
- **Actions:** One-click copy with toast feedback, save to bookmarks, or send directly to the Thumbnail Studio.

### 2. 3 Thumbnail Text Ideas & Live Mockup Studio
- **1-to-4 Words High-Impact Rule:** Tested short phrases that stay readable even at 80px mobile thumbnail size (e.g., `"IT BROKE."`, `"HOUR 72."`, `"DON'T DO THIS"`).
- **Interactive 16:9 YouTube Feed Simulator:** Preview thumbnails in a realistic YouTube card layout with:
  - Channel avatar & name
  - Simulated views & upload timestamp (`1.4M views • 2 hours ago`)
  - Video length badge (`12:48`)
  - Bold thumbnail typography with contrast drop shadows
- **Vibe & Color Switcher:** Test 4 high-contrast color palettes:
  - 🟡 *Electric Neon Yellow*
  - 🔴 *Urgent Red*
  - 🔵 *Cyber Acid Cyan*
  - 🟣 *Midnight Ultraviolet*
- **Visual Setup Recommendations:** Actionable tips for creator expressions, lighting setups, split-screens, and props.
- **AI Art Prompt Exporter:** One-click copy to paste directly into Midjourney, DALL-E, Photoshop, or Canva.
- **In-Place Live Editor:** Customize the overlay text directly on the thumbnail canvas in real time.

### 3. Bonus Creator Kit: Retention Hooks, Description & SEO
- **3 Opening Retention Scripts (0:00 - 0:10):**
  - *Pattern Interrupt Hook:* Sudden motion or startling sound to shatter scroll trance.
  - *High-Stakes Countdown Hook:* Establish immediate ticking clock anxiety.
  - *Bold Question & Proof Hook:* Challenge popular myths with instant visual proof.
- **Ready-to-Paste YouTube Description:**
  - Keyword-rich algorithmic synopsis.
  - Formatted chapter timestamps (`0:00`, `1:15`, `4:30`, etc.).
  - Audience comment engagement question.
  - Call to action & subscription links.
- **Viral Hashtags & SEO Keywords Cloud:** High-traffic tags (`#Shorts`, `#Trending`, topic tags) with individual click-to-copy or "Copy All" buttons.

### 4. Unique Feature: Creator Evolution — Then vs Now vs Future (1996 ➔ 2026 ➔ 2056)
An interactive 30-year journey contrasting the history and future of content creation:
- **📼 30 Years Ago (1996):**
  - Retro CRT scanline aesthetics.
  - VHS-C / Hi8 analog shoulder camcorders.
  - Dual-deck linear VCR tape splicing with no digital undo.
  - Distribution limited to mailing cassettes to public-access cable stations or local library boards.
  - Strict broadcast gatekeepers; reaching 500 viewers was a massive achievement.
- **⚡ Today (2026):**
  - 4K HDR pocket smartphones.
  - CreatorSpark AI instantaneous title & thumbnail generation.
  - Automated silence trimming, subtitle generation, and cloud sync.
  - Open algorithmic distribution reaching millions globally in hours without gatekeepers.
- **🚀 30 Years Ahead (2056):**
  - Cyberpunk neural grid styling.
  - Direct brain-computer creative interfaces (BCI).
  - Thought-to-video real-time quantum synthesis.
  - Personalized branching 16K holographic streams where audiences step inside the world.
- **Interactive Modes:**
  - *Era Experience Slider:* Deep dive into each era's workflows, gear costs, and production times.
  - *Side-by-Side Matrix:* Compare Camera, Editing, Distribution, Monetization, and the Role of AI in one comprehensive table.
  - *Topic Reimagined Simulator:* Dynamically compares how your specific video topic would be produced and received in 1996 vs 2026 vs 2056.

### 5. Saved Sparks Drawer & Markdown Exporter
- Bookmark your favorite titles while brainstorming.
- Stored persistently in browser `localStorage`.
- One-click copy all bookmarked titles.
- Download a structured Markdown file (`.md`) formatted for your production script.

### 6. Creator UX & Confetti Celebrations
- Built with high-energy creator aesthetic: vibrant YouTube reds, electric amber, cyan neon accents, and smooth glassmorphism.
- Cheerful confetti bursts on every successful generation.
- Keyboard shortcut support: press <kbd>⌘+Enter</kbd> or <kbd>Ctrl+Enter</kbd> to generate instantly.

---

## 🛠️ Architecture & Tech Stack

```
CreatorSpark AI
├── Frontend (Client)
│   ├── React 19 (Functional components, hooks)
│   ├── TypeScript (Strict types for titles, thumbnails, hooks, eras)
│   ├── Tailwind CSS v4 (@import "tailwindcss"; custom CRT & cyber grid utilities)
│   ├── Lucide React (Clean, modern iconography)
│   ├── Motion (Smooth UI transitions)
│   └── Canvas Confetti (Celebration effects)
│
└── Backend (Server)
    ├── Express 4 (Full-stack API & dev server proxy)
    ├── @google/genai (Official Google Gen AI TypeScript SDK)
    ├── Gemini 3.8 Flash (Server-side structured JSON generation with responseSchema)
    └── Smart Creator Engine Fallback (Instant, resilient offline generation)
```

---

## 📋 Environment Variables

Defined in `.env.example`:

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Required for Gemini 3.8 Flash API calls. Injected automatically by AI Studio at runtime from user secrets. |
| `APP_URL` | The URL where the app is hosted (injected automatically in production). |
| `PORT` | Local server port (defaults to `3000`). |

> **Note:** The Gemini API key is kept strictly on the server-side (`server.ts`) and is **never** exposed to client browser bundles.

---

## 💻 Getting Started Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file in the project root:
```env
GEMINI_API_KEY="your-gemini-api-key"
PORT=3000
```

### 3. Run Development Server
```bash
npm run dev
```
The server will start on `http://localhost:3000` with Express handling API routes and Vite serving the frontend.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🔌 API Reference

### `POST /api/generate`
Generates a complete creative bundle for a given YouTube video topic.

**Request Body:**
```json
{
  "topic": "Surviving 100 Hours in a Bunker",
  "style": "viral",
  "format": "video",
  "tone": "energetic"
}
```

**Response Payload:**
```json
{
  "topic": "Surviving 100 Hours in a Bunker",
  "titles": [
    {
      "title": "I Survived 100 Hours in an Underground Bunker (It Flooded)",
      "style": "High Stakes",
      "estimatedCtr": "Very High (17.5%)",
      "characterCount": 61,
      "whyItWorks": "Extreme survival situation combined with sudden crisis payoff."
    }
  ],
  "thumbnails": [
    {
      "text": "IT FLOODED.",
      "visualHook": "Shoulder-deep in murky water holding a flashlight with panicked face.",
      "badgeStyle": "URGENT_RED",
      "targetEmotion": "Urgent Shock & Danger",
      "previewBg": "from-rose-600 via-red-600 to-amber-900"
    }
  ],
  "hooks": [
    {
      "style": "Pattern Interrupt Hook (0:00 - 0:05)",
      "description": "Startle the viewer before explaining the premise.",
      "script": "Right now, four tons of reinforced steel are locked above my head..."
    }
  ],
  "hashtags": ["#BunkerSurvival", "#100Hours", "#YouTubeCreators", "#Shorts"],
  "seoKeywords": ["bunker challenge", "surviving underground", "100 hours experiment"],
  "description": "Full formatted YouTube description with timestamps and call to action...",
  "timeMachine": {
    "year1996": { "era": "30 Years Ago (1996)", ... },
    "year2026": { "era": "Today (2026)", ... },
    "year2056": { "era": "30 Years Ahead (2056)", ... }
  }
}
```

### `GET /api/health`
Health check endpoint reporting API status and whether Gemini is configured.

---

## 🎨 Design Constitution

- **Anti-Boring Playground:** Designed to feel like a high-energy creator studio rather than a sterile form.
- **Zero-Pill Discipline:** Rich, descriptive cards with meaningful visual hierarchies, badges, and CTR meters.
- **Tactile Feedback:** Instant copy indicators, confetti celebrations, interactive hover states, and smooth animated tabs.
- **Mobile-First Responsiveness:** Fully tested across mobile phones, tablets, and wide desktop displays.

---

## 📄 License

Apache-2.0 License. Designed for creators worldwide.
