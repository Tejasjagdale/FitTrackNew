# FitTrack - Getting Started Guide

## 🚀 Quick Start

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure GitHub Integration (Optional but Recommended)

If you want to sync your workout data to GitHub:

1. **Create a GitHub Personal Access Token**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Name it "FitTrack"
   - Select scope: `repo` (Full control of repositories)
   - Click "Generate token" and copy it

2. **Add Token to `.env` File**
   - Open the `.env` file in your project root
   - Replace `your_github_personal_access_token_here` with your actual token:
   ```
   VITE_GITHUB_TOKEN=ghp_your_actual_token_here
   VITE_GITHUB_OWNER=Tejasjagdale
   VITE_GITHUB_REPO=github-db
   VITE_GITHUB_FILE_PATH=workoutData.json
   ```
   - **Save the file** (the app will load this when you start the dev server)
   - ⚠️ **NEVER commit `.env` file** — it's in `.gitignore`

3. **Restart Dev Server**
   - Stop the server (if running)
   - Run `npm run dev` again
   - The GitHub token will now be loaded

### Step 3: Start the Development Server
```bash
npm run dev
```

The app will open at `http://localhost:5173/`

---

## 📱 Using FitTrack

### Today's Workout
- Click **"Today's Workout"** to start your daily routine
- Features:
  - ⏱️ Built-in timer for rest periods
  - ⏹️ Start, next, rest, finish buttons
  - ↩️ Undo button to go back a step
  - Tracks completed variants for the week

### Edit Variants
- Click **"Variant"** to edit workout exercises
- Features:
  - ✏️ Edit exercise names, sets, reps, rest times
  - 🎯 Add new exercises
  - 🛠️ Edit equipment per set
  - 💾 Save locally or sync to GitHub

### Theme Toggle
- Click the 🌙 (moon) or ☀️ (sun) icon in the top-right to toggle dark/light mode

---

## 🔄 Syncing to GitHub

Once GitHub token is configured:

1. Go to **Variant** page
2. Make any edits to your exercises
3. Click **"Save Locally"** (saves to your device)
4. Click **"Sync to GitHub"** (pushes to your GitHub repo)
5. Check browser console (F12) for any errors

### Multi-Device Sync
- Each device needs its own `.env` file with the token
- Changes sync to GitHub, so all devices can pull latest data
- No browser sync needed — all data goes through GitHub

---

## 📦 Build for Production

```bash
npm run build
```

The optimized build will be in the `dist/` folder.

To preview the production build:
```bash
npm run preview
```

---

## 🐛 Troubleshooting

### GitHub "Sync to GitHub" button doesn't appear
- Check `.env` file has `VITE_GITHUB_TOKEN=ghp_...` (not the placeholder)
- Restart dev server after editing `.env`
- Check browser console (F12) for errors

### "GitHub token not configured" error
- `.env` file is missing or empty
- Make sure `VITE_GITHUB_TOKEN` is set to your actual token
- Restart dev server

### Sync fails with "Invalid token"
- Your token may be incorrect or expired
- Generate a new token at https://github.com/settings/tokens
- Update `.env` with new token
- Restart dev server

### Data not appearing from GitHub
- Make sure `workoutData.json` exists in your GitHub repo
- Verify token has `repo` scope permissions
- Check repository isn't archived

---

## 📁 Project Structure

```
fitTrack/
├── src/
│   ├── components/       # React components (EditVariantCard, Layout, etc.)
│   ├── data/            # Data layer (workoutUtils, githubService)
│   ├── pages/           # Page components (Home, Variant, TodayWorkout)
│   ├── App.tsx          # Main app with routing
│   ├── main.tsx         # Entry point
│   ├── theme.ts         # MUI theme configuration
│   └── ThemeModeProvider.tsx  # Theme context provider
├── .env                 # Environment variables (gitignored)
├── .env.example         # Example env file (tracked in git)
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
├── package.json         # Dependencies and scripts
└── index.html          # HTML entry point
```

---

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run TypeScript type checking |

---

## 🔒 Security

✅ **Your GitHub token is secure:**
- Stored in `.env` file (local only, never committed)
- Never stored in browser
- Only sent to GitHub's official API
- Each device has its own token

⚠️ **Keep your token safe:**
- Don't share `.env` file
- Don't commit `.env` to Git
- If exposed, regenerate it on GitHub

---

## 📚 More Documentation

- **[GITHUB_INTEGRATION_SETUP.md](./GITHUB_INTEGRATION_SETUP.md)** - Detailed GitHub setup guide
- **[REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md)** - Technical refactoring details
- **[README.md](./README.md)** - Original project README

---

## ❓ Questions?

Check the browser console (F12) for detailed error messages, and refer to the setup guides above.

Happy tracking! 💪
