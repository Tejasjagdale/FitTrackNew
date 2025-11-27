# FitTrack - GitHub Integration Setup Guide

## Overview
FitTrack now supports GitHub as a cloud storage backend for your workout data. Your changes can be synced to your GitHub repository (`Tejasjagdale/github-db`), allowing you to:
- Backup your workout data to the cloud
- Access your data across multiple devices
- Track changes via GitHub's version history
- Collaborate or sync with other systems

## Setup Instructions

### Step 1: Create a GitHub Personal Access Token

1. Go to [GitHub Settings → Personal Access Tokens](https://github.com/settings/tokens)
2. Click **"Generate new token (classic)"**
3. Fill in the details:
   - **Token name**: `FitTrack` (or any name you prefer)
   - **Expiration**: Set as needed (90 days is recommended)
   - **Select scopes**: Check `repo` (Full control of private repositories)
4. Click **"Generate token"** at the bottom
5. **Copy the token** (you won't be able to see it again!)
   - It will look like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 2: Add Token to Environment Variables

1. Open the `.env` file in your project root
2. Replace the placeholder with your actual GitHub token:
   ```
   VITE_GITHUB_TOKEN=ghp_your_token_here
   VITE_GITHUB_OWNER=Tejasjagdale
   VITE_GITHUB_REPO=github-db
   VITE_GITHUB_FILE_PATH=workoutData.json
   ```
3. **Save the file** (the app will use this token when you rebuild/restart)
4. **Never commit this file** — it's already in `.gitignore`

### Step 3: Initialize GitHub Repository

First, you need to populate your GitHub repository with the initial workout data.

**Option A: Using GitHub Web Interface**
1. Go to [https://github.com/Tejasjagdale/github-db](https://github.com/Tejasjagdale/github-db)
2. Click on `workoutData.json`
3. Click the edit (pencil) icon
4. Paste the JSON content from below
5. Commit the changes

**Option B: Using the App**
1. Make sure your `.env` file is configured with your token (Step 2)
2. Go to **Variant** page
3. Click **"Sync to GitHub"**
4. This will push your current workout data to the repository

### Initial workoutData.json Content

Copy this JSON and paste it into your GitHub repository's `workoutData.json`:

```json
{
  "weeklyOrder": [
    "Arms Variant 1",
    "Chest Variant 1",
    "Arms Variant 2",
    "Chest Variant 2",
    "Arms Variant 3",
    "Chest Variant 3"
  ],
  "variants": [
    // ... (see the FitTrack app for the complete variant data)
  ]
}
```

## Using GitHub Integration

### Syncing to GitHub

1. Go to the **Variant** page
2. Make any edits to your exercises
3. Click **"Save Locally"** to save changes to your device
4. Click **"Sync to GitHub"** to push changes to your GitHub repository

### Fetching from GitHub

The app will automatically use the data from GitHub if:
- Your token is configured
- The `workoutData.json` exists in your repository

To refresh data from GitHub:
1. Reload the page (F5 or Cmd+R)
2. The app will fetch the latest data from GitHub

## Settings

### Environment Variables
Your GitHub token and repository configuration are stored in the `.env` file (not displayed in the UI):
- **VITE_GITHUB_TOKEN**: Your GitHub Personal Access Token
- **VITE_GITHUB_OWNER**: `Tejasjagdale`
- **VITE_GITHUB_REPO**: `github-db`
- **VITE_GITHUB_FILE_PATH**: `workoutData.json`

**Important**: `.env` is added to `.gitignore` and will never be committed to version control.

### Repository Configuration
- **Owner**: `Tejasjagdale`
- **Repository**: `github-db`
- **File Path**: `workoutData.json`

## Security Notes

✓ **Your token is stored only in `.env` file (not in the browser)**
- The `.env` file is never committed to Git (protected by `.gitignore`)
- It's only read by Vite during build time as environment variables
- It's never sent anywhere except to GitHub's official API
- It's not sent to any third-party servers

⚠ **Important**: 
- Don't share your `.env` file with anyone
- If you accidentally expose your token, regenerate it on GitHub
- The token has full access to your repositories
- Each device that runs the app needs its own `.env` file with the token

## Troubleshooting

### "Invalid token" Error
- Make sure you copied the full token correctly into `.env`
- Check that you created a token with `repo` scope
- Regenerate a new token and update your `.env` file
- Restart the dev server or rebuild the app for changes to take effect

### "Failed to update file" Error
- Ensure the file exists at `workoutData.json` in your repository
- Check your GitHub repository settings (make sure it's not archived)
- Try regenerating and updating your token in `.env`
- Restart the app

### "GitHub token not configured" Error
- Your `.env` file is missing the `VITE_GITHUB_TOKEN` variable
- Add your token to `.env` file
- Restart the dev server or rebuild the app
- The app will only show "Sync to GitHub" button if token is configured

### Data Not Syncing
- Verify your `.env` file has `VITE_GITHUB_TOKEN` set
- Restart the dev server or rebuild the app after changing `.env`
- Check your internet connection
- Look at the browser console (F12) for error messages

## Features

✓ **Local Save**: Save changes to your device (always available)
✓ **GitHub Sync**: Push your changes to GitHub repository
✓ **Backup**: Your data is backed up in GitHub
✓ **Version History**: See all changes via GitHub's commit history
✓ **Multi-Device**: Access your data across multiple devices

## Future Features (Roadmap)

- [ ] Auto-sync on save
- [ ] Scheduled syncing
- [ ] Merge conflicts resolution
- [ ] Pull latest data from GitHub
- [ ] GitHub commit history viewer

---

**Questions or Issues?** 
Check the browser console (F12) for detailed error messages, or review the setup steps above.
