# Rebranding Guide

This guide explains how to rebrand the application using the automated GitHub Actions workflow.

## 🎯 Overview

You can rebrand the entire application from your tablet or any device with a web browser by using the GitHub Actions workflow. No terminal or command line access needed!

## 📱 How to Rebrand (From Your Tablet)

### Step 1: Go to GitHub Actions

1. Open your repository on GitHub: `https://github.com/julesmeister/testmanship-web-v2`
2. Click on the **Actions** tab at the top
3. In the left sidebar, click **Rebrand Application**
4. Click the **Run workflow** button (gray button on the right)

### Step 2: Fill Out the Form

A form will appear with these fields:

#### Required Fields:
- **New Brand Name**: Your new brand name (e.g., "MyApp", "LearnGerman")
- **New Domain**: Your new domain without https:// (e.g., "myapp.com")

#### Optional Fields:
- **Folder Name**: Leave empty for auto-generation (e.g., "myapp-web-v2")
- **R2 Bucket Name**: Leave empty for auto-generation (e.g., "myapp")
- **Database Name**: Leave empty for auto-generation (e.g., "myapp-web-v2")
- **Tagline**: Custom tagline (e.g., "Learn Languages Fast")
- **Description**: SEO description (e.g., "A modern language learning platform...")

#### GitHub Options:
- **Create new GitHub repository?**: Check this to create a new GitHub repo
- **Update git remote URL?**: Check this to update the remote URL
- **GitHub Username**: Your GitHub username (optional, uses current owner if empty)
- **Automatically commit and push changes?**: Check this to auto-commit (recommended)

### Step 3: Run the Workflow

1. Click the green **Run workflow** button at the bottom of the form
2. Wait for the workflow to complete (usually 1-2 minutes)
3. Click on the running workflow to see real-time progress

### Step 4: View the Summary

Once complete, you'll see a detailed summary including:
- ✅ All changes applied
- 📋 List of modified files
- 🔗 New repository URL (if created)
- 📋 Next steps checklist

## 🎨 Example: Rebranding to "GermanMaster"

### Input Values:
```
Brand Name: GermanMaster
Domain: germanmaster.io
Folder Name: (leave empty - auto: "germanmaster-web-v2")
Bucket Name: (leave empty - auto: "germanmaster")
Database Name: (leave empty - auto: "germanmaster-web-v2")
Tagline: Master German Like a Native
Description: An advanced German learning platform with AI-powered exercises
Create new GitHub repository: ✓ (checked)
Update git remote URL: ✓ (checked)
GitHub Username: yourname
Commit and push changes: ✓ (checked)
```

### What Happens:
1. ✅ Updates 40+ files with new brand name
2. ✅ Creates new GitHub repository: `yourname/germanmaster-web-v2`
3. ✅ Updates git remote to point to new repository
4. ✅ Commits and pushes all changes automatically
5. ✅ Provides detailed next steps

## 📋 After Rebranding

The workflow will provide a checklist, but here are the key steps:

### 1. Update Environment Variables
Update your `.env.local` file:
```bash
NEXT_PUBLIC_DOMAIN=germanmaster.io
# Update other URLs accordingly
```

### 2. Create Cloudflare R2 Bucket
- Go to Cloudflare Dashboard → R2
- Create new bucket with the new name
- Copy files from old bucket
- Update CORS settings for new domain

### 3. Create New Turso Database
```bash
turso db create germanmaster-web-v2
turso db show germanmaster-web-v2 --url
turso db tokens create germanmaster-web-v2
```

### 4. Update Vercel
- Go to Vercel Dashboard
- Update project name
- Add new domain
- Update environment variables

### 5. Update Firebase (if applicable)
- Create new Firebase project or update existing
- Update `lib/firebase.ts` with new project ID

### 6. Update Google OAuth
- Go to Google Cloud Console
- Add new authorized domain
- Update callback URL

### 7. Update DNS
- Point new domain to Vercel

### 8. Deploy
- Merge changes to main branch or deploy manually

## 🔧 Alternative: Manual Rebranding

If you prefer to run the script locally:

```bash
npm run rebrand -- --name "NewBrand" --domain "newbrand.com"
```

See full options in `scripts/rebrand.ts`

## ❓ FAQ

### Can I preview changes before applying them?

Unfortunately, the GitHub Actions workflow doesn't support dry-run mode. However, you can:
1. Create a new branch before running
2. Review the commit created by the workflow
3. Merge if satisfied, or discard the branch

### What if the workflow fails?

1. Check the workflow logs for error messages
2. Common issues:
   - Invalid domain format (don't include https://)
   - GitHub token permissions (ensure Actions has write access)
   - Repository already exists (if creating new repo)

### Can I undo a rebrand?

Yes! Simply:
1. Revert the commit created by the workflow
2. Or run the workflow again with the original values

### Do I need a Windows PC?

No! This workflow runs entirely in GitHub's cloud. You can use it from:
- 📱 Tablet (iOS or Android)
- 💻 Mac, Windows, or Linux
- 🌐 Any device with a web browser

## 🎉 Benefits of GitHub Actions Workflow

- ✅ No terminal/CLI required
- ✅ Works on tablets and mobile devices
- ✅ Fully automated process
- ✅ Creates GitHub repo automatically
- ✅ Detailed progress and summary
- ✅ Rollback-friendly (just revert the commit)
- ✅ No local setup needed

## 🆘 Support

If you encounter issues:
1. Check the workflow logs in the Actions tab
2. Review the error messages
3. Consult the main [CLAUDE.md](../CLAUDE.md) for project structure
4. Create an issue on GitHub

---

**Pro Tip**: Always commit your current work before running the rebrand workflow, so you can easily revert if needed!
