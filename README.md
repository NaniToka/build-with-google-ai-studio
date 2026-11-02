# Motu's Run: Subway & Temple Dash 🥟🏃‍♂️🚇

> A high-speed, realistic 3D endless runner featuring **Motu** (from the famous *Motu Patlu* series), with **Easy**, **Medium**, and hardcore **Hard** difficulty modes! Built with **Three.js**, **React 19**, and procedural **Web Audio API**.

---

## 🌟 What's New in this Level

### 1. Realistic 3D Procedural Character: Motu (Motu Patlu)
- **Signature Clothing:** Motu's iconic red sleeveless kurta/vest with gold buttons, bright yellow undershirt, and loose royal blue salwar pants.
- **Classic Details:** Fleshy potbelly with bouncy jiggle physics while sprinting, curled handlebar moustache, round bulbous nose, bald scalp, and classic topknot hair tuft (*choti*).
- **Traditional Footwear:** Curved Indian *mojari* shoes with upturned pointed toes.
- **Motu's Hot Crispy Samosas:** Collect golden crispy samosas on the track for explosive Samosa Turbo Boosts with crunchy sound effects!
- **Inspector Chingum's Pursuit:** Inspector Chingum's police quadcopter drone with flashing red and blue sirens trails closely behind Motu!

---

### 2. Difficulty Selection Modes

Choose your level directly from the Title Screen:

| Level | Name | Starting Speed | Max Speed | Obstacle Cadence | Moving Trains | Coyote Jump Buffer | Score Multiplier |
|---|---|---|---|---|---|---|---|
| 🟢 **EASY** | *Furfuri Walk* | **18 m/s** | 28 m/s | Relaxed (34–46m) | None (0%) | 180ms | **1.0x** |
| 🟡 **MEDIUM** | *Market Dash* | **25 m/s** | 42 m/s | Balanced (22–32m) | 35% chance (8 m/s) | 120ms | **1.5x** |
| 🔴 **HARD** | *Chingum Pursuit* | **34 m/s** | **56 m/s** | Rapid-fire (14–22m) | **65% chance (14 m/s!)** | 60ms | **3.0x REWARD** |

#### Why Hard Mode is Intense & Realistic:
- **Instant High Speed:** Starts at a blistering 34 m/s (122 km/h) and ramps up to 56 m/s (200+ km/h).
- **Dynamic Speed Warp FOV:** The camera field-of-view expands dynamically from 62° to 76°, creating realistic optical speed distortion.
- **Physical High-Speed Rumble:** Realistic micro-vibrations and camera shake simulate raw velocity.
- **Aggressive Oncoming Trains:** 65% of MagLev trains barrel towards Motu at 14 m/s, requiring split-second reflex lane shifts or leaps onto train roofs!
- **3.0X Score Multiplier:** Massive rewards for skilled players who survive the challenge.

---

## 🕹️ Controls

### Keyboard (Desktop)
| Action | Key Bindings |
|---|---|
| **Switch Lane Left** | `A` or `ArrowLeft` |
| **Switch Lane Right** | `D` or `ArrowRight` |
| **Jump / Leap** | `W`, `ArrowUp`, or `Space` |
| **Slide / Roll Under Lasers** | `S` or `ArrowDown` |
| **Pause / Resume** | `Esc` or `P` |
| **Start / Restart** | `Space` or `Enter` |

### Touch (Mobile & Tablet)
- **Swipe Left / Right:** Change lanes
- **Swipe Up:** Jump
- **Swipe Down:** Slide / Roll
- **On-Screen Arcade Buttons:** One-thumb mobile controls

---

## ⚡ Power-Ups & Collectibles

- 🥟 **Crispy Samosa:** Motu's favorite food! Gives instant Samosa Turbo Boost and 200 points.
- 🪙 **Gold Coins:** Pick up coins along tracks and train roofs to rack up high scores.
- 🧲 **Coin Magnet (10s):** Attracts all coins across all 3 lanes.
- 🛡️ **Energy Shield (15s):** Absorbs 1 crash impact.
- ⭐ **2X Multiplier (12s):** Doubles all points and coin values.

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Build for production
npm run build
```
Open [http://localhost:3000](http://localhost:3000) to play!
