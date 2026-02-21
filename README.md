# 🌊 Color Flood — Kids Puzzle Game

A progressive color flood puzzle game for kids aged 5+. Built as a PWA, deployable free on GitHub Pages.

## Features
- 30 levels scaling from 4×4 grids (age 5) to 9×9 grids (age 10+)
- Multiple player profiles — each player's progress is saved separately
- Supabase persistent storage (with localStorage fallback if offline)
- Installable as a PWA on any phone
- No hints or help — kids figure it out themselves!

---

## 🚀 Quick Start (Local)

Just open `index.html` in a browser. No build step needed.

---

## 🗄️ Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase-schema.sql`
3. Copy `config.example.js` to `config.js`:
   ```bash
   cp config.example.js config.js
   ```
4. Edit `config.js` and paste in your Project URL and Anon Key (found in Supabase → Settings → API)
5. **Never commit `config.js`** — it's in `.gitignore`

---

## 🌐 Deploy to GitHub Pages

1. Create a new GitHub repo (public or private)
2. Push the project:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/color-flood.git
   git push -u origin main
   ```
3. Go to repo **Settings → Pages**
4. Set source to **Deploy from branch → main → / (root)**
5. Your game will be live at `https://YOUR_USERNAME.github.io/color-flood/`

### ⚠️ Important: Supabase Keys on GitHub Pages

Since `config.js` is in `.gitignore`, it won't be deployed. Options:

**Option A — Public anon key (recommended for this game)**  
The Supabase Anon Key is safe to expose in a public game since RLS policies control data access. Create a `config.js` file and commit it with just the anon key — it's designed to be public.

**Option B — Build step with environment variables**  
Use GitHub Actions to inject secrets at build time (more complex, needed for sensitive keys).

For a family puzzle game, Option A is perfectly fine.

---

## 🔄 Adding New Levels

Open `js/levels.js` and add entries to the `LEVELS` array:

```js
{ id: 31, gridSize: 10, colors: 6, maxMoves: 22, seed: 701 },
```

- `seed` — any number; same seed always generates the same grid
- `gridSize` — grid dimensions (4–12 recommended)  
- `colors` — number of colors used (3–6)
- `maxMoves` — move budget; tweak to control difficulty

No other code changes needed. Deploy and the new levels appear immediately.

---

## 🔄 Updating the Game (PWA Cache)

When you push updates, bump the cache version in `service-worker.js`:

```js
const CACHE_VERSION = 'flood-v2'; // increment this
```

Players will get the update on their next visit when online.

---

## 📁 Project Structure

```
flood-game/
├── index.html          # Main HTML, all screens
├── manifest.json       # PWA manifest
├── service-worker.js   # Offline caching
├── config.example.js   # Copy to config.js with your Supabase keys
├── config.js           # (gitignored) your actual keys
├── supabase-schema.sql # Run once in Supabase SQL editor
├── .gitignore
├── css/
│   └── style.css       # All styles
└── js/
    ├── levels.js        # Level definitions + grid generation
    ├── supabase-client.js # DB abstraction (Supabase + localStorage fallback)
    ├── profiles.js      # Profile management
    ├── game.js          # Canvas game engine
    └── app.js           # UI routing and event handling
```
