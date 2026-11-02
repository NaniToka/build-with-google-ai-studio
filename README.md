# CyberSurge: Neon Endless Runner ⚡🏃‍♂️🚇

> A high-octane 3D endless runner inspired by **Subway Surfers** and **Temple Run**, built with **Three.js**, **React 19**, and **Web Audio API**.

---

## 🎮 Gameplay & Mechanics

- **3-Lane Track Navigation:** Seamlessly switch between Left, Center, and Right lanes with responsive exponential damping kinematics and banking tilt.
- **Leap & Vault:** Jump over electric barricades and low obstacles with coyote time (120ms), jump buffering, and landing squash-and-stretch.
- **Slide & Roll:** Slide under high-voltage laser barriers and heavy girders with halved hitbox height.
- **MagLev Subway Train Surfing:** Moving and stationary MagLev trains barrel down the tracks. Switch lanes to evade them, or leap onto train roofs and surf along the elevated cars to grab exclusive coin lines!
- **Chasing Security Drone ("The Enforcer"):** A quadcopter drone with forward searchlights and flashing emergency siren trails closely behind. If you clip an obstacle or stumble, the drone surges forward right on your heels!
- **Collectibles & Power-Ups:**
  - 🪙 **Cyber Coins:** Collect coins to multiply your final run score.
  - 🧲 **Coin Magnet (10s):** Attracts all coins across all 3 lanes with a magnetic torus field.
  - 🛡️ **Energy Shield (15s):** Absorbs 1 fatal obstacle crash, saving your run.
  - 🚀 **Rocket Boost (6s):** Surges speed forward on an illuminated hoverboard, smashing effortlessly through any barrier in your path!
  - ⭐ **2X Multiplier (12s):** Doubles all distance points and coin values.

---

## 🕹️ Controls

### Keyboard (Desktop)
| Action | Key Bindings |
|---|---|
| **Switch Lane Left** | `A` or `ArrowLeft` |
| **Switch Lane Right** | `D` or `ArrowRight` |
| **Jump / Vault** | `W`, `ArrowUp`, or `Space` |
| **Slide / Roll** | `S` or `ArrowDown` |
| **Pause / Resume** | `Esc` or `P` |
| **Start / Restart** | `Space` or `Enter` |

### Touch / Mobile
- **Swipe Left / Right:** Switch lanes
- **Swipe Up:** Jump
- **Swipe Down:** Slide / Roll
- **On-Screen Arcade Buttons:** Discrete thumb buttons for mobile and tablet play

---

## 🏗️ Technical Architecture & Three.js Craft

- **Three.js PBR Rendering:**
  - `RoomEnvironment` with `PMREMGenerator` for realistic PBR environment reflections.
  - Software WebGL detection (`isSoftwareGl`) optimizing pixel ratio, antialiasing, and shadows.
  - Warm directional sun/moonlight paired with cool sky/ground `HemisphereLight` and matching `FogExp2` horizon fade-off.
- **3–12 Part Procedural Composite Models:**
  - **Cyber Runner:** Rigged 12-part hierarchy (torso armor, backpack jet nozzles, helmet with cyber visor, limbs with running stride animation, shoes with glowing cyan soles, toggleable shield dome and hoverboard).
  - **MagLev Train:** Aerodynamic bullet nose, hazard bumper, rooftop running deck, passenger windows, and magnetic levitation ground glow.
  - **Obstacles:** High laser gates, low roadblocks with warning lights, and signal columns.
- **Procedural Web Audio System:**
  - Zero external `.mp3` dependencies.
  - Synthesized in real time via Web Audio API: jump whooshes, slide rumble sweeps, pentatonic coin chimes, major triad power-up chords, and explosive crash impacts.
- **Zero-Occlusion Game Shell UI:**
  - Full-viewport shell (`Title Screen` ➔ `Playing` ➔ `Pause / Game Over`).
  - Perimeter HUD keeping >85% of the 3D playfield completely unobstructed.
  - No `backdrop-filter` over the active WebGL canvas to preserve 60 FPS performance.

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
