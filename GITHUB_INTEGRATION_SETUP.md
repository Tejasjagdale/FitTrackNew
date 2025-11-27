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

### Step 2: Add Token to FitTrack App

1. Open FitTrack in your browser
2. Click the **menu icon** (⋮) in the top-right corner
3. Select **"Settings"**
4. Click **"Set GitHub Token"**
5. Paste your GitHub Personal Access Token
6. Click **"Save Token"**

You should see: ✓ GitHub token is configured

### Step 3: Initialize GitHub Repository

First, you need to populate your GitHub repository with the initial workout data.

**Option A: Using GitHub Web Interface**
1. Go to [https://github.com/Tejasjagdale/github-db](https://github.com/Tejasjagdale/github-db)
2. Click on `workoutData.json`
3. Click the edit (pencil) icon
4. Paste the JSON content from below
5. Commit the changes

**Option B: Using the App**
1. Make sure your token is configured (Step 2)
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

### View/Update Token
- Go to **Settings**
- You'll see: ✓ GitHub token is configured
- Click **"Update Token"** to change it
- Click **"Remove Token"** to disconnect

### Repository Configuration
- **Owner**: `Tejasjagdale`
- **Repository**: `github-db`
- **File Path**: `workoutData.json`

## Security Notes

✓ **Your token is stored securely in your browser's local storage**
- It's never sent anywhere except to GitHub's official API
- It's not sent to any third-party servers
- It stays on your device

⚠ **Important**: 
- Don't share your token with anyone
- If you accidentally expose your token, regenerate it on GitHub
- The token has full access to your repositories

## Troubleshooting

### "Invalid token" Error
- Make sure you copied the full token correctly
- Check that you created a token with `repo` scope
- Regenerate a new token and try again

### "Failed to update file" Error
- Ensure the file exists at `workoutData.json` in your repository
- Check your GitHub repository settings (make sure it's not archived)
- Try removing and re-adding your token

### "Could not get file SHA" Error
- The file might not exist in your repository
- Create an empty `workoutData.json` file in your GitHub repository first
- Then try syncing again

### Data Not Syncing
- Verify your token is configured in Settings
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
