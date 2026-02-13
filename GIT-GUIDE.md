# Git Quick Reference

Your project is now a Git repository! 🎉

## 📊 Current Status

```bash
✅ Repository initialized
✅ Initial commit made (28 files, 3,781 lines)
✅ .gitignore configured
✅ On branch: master
```

## 🌿 Basic Git Commands

### Check Status
```bash
git status
```

### Stage Changes
```bash
# Stage all changes
git add .

# Stage specific file
git add backend/server.js
```

### Commit Changes
```bash
git commit -m "Your commit message"
```

### View History
```bash
# View commit history
git log

# View condensed history
git log --oneline

# View last 5 commits
git log -5
```

### View Changes
```bash
# See unstaged changes
git diff

# See staged changes
git diff --cached
```

## 🔄 Common Workflows

### After Making Code Changes

```bash
# 1. Check what changed
git status

# 2. Stage changes
git add .

# 3. Commit with message
git commit -m "feat: add new weather metric calculation"

# 4. View history
git log --oneline
```

### Undo Changes

```bash
# Undo uncommitted changes to a file
git checkout -- filename

# Unstage a staged file
git reset HEAD filename

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1
```

## 🚀 Connect to GitHub/GitLab

### GitHub

```bash
# 1. Create repo on GitHub (don't initialize with README)

# 2. Add remote
git remote add origin https://github.com/your-username/weather-analytics.git

# 3. Push
git branch -M main
git push -u origin main
```

### GitLab

```bash
# 1. Create repo on GitLab

# 2. Add remote
git remote add origin https://gitlab.com/your-username/weather-analytics.git

# 3. Push
git branch -M main
git push -u origin main
```

## 🌿 Branching

### Create Branch

```bash
# Create and switch to new branch
git checkout -b feature/add-city-search

# Or using newer syntax
git switch -c feature/add-city-search
```

### Switch Branches

```bash
git checkout main
# or
git switch main
```

### Merge Branch

```bash
# Switch to main
git checkout main

# Merge feature branch
git merge feature/add-city-search
```

### Delete Branch

```bash
git branch -d feature/add-city-search
```

## 📝 Commit Message Conventions

Use semantic commit messages:

```bash
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting, missing semicolons, etc.
refactor: code refactoring
test: add tests
chore: maintenance tasks

# Examples:
git commit -m "feat: add London to city list"
git commit -m "fix: correct temperature calculation in Lambda"
git commit -m "docs: update deployment guide"
```

## 🔍 View What's Ignored

```bash
# See what .gitignore excludes
git status --ignored
```

## 📦 What's Ignored (from .gitignore)

✅ Currently ignored:
- `node_modules/` (dependencies)
- `.env` (API keys, secrets)
- `frontend/dist/` (build output)
- `backend/lambda-function.zip` (deployment package)
- `backend/lambda-package/` (temp Lambda files)
- Log files, OS files, IDE configs

❌ Tracked in Git:
- All source code (`.js`, `.jsx`)
- Configuration files (`package.json`, `vite.config.js`)
- Documentation (`.md` files)
- Deployment scripts (`.sh`, `.ps1`)

## 🚫 Never Commit These

- ❌ API keys or secrets (`.env` files)
- ❌ `node_modules/` folder
- ❌ Build outputs (`dist/`, `build/`)
- ❌ Personal IDE settings
- ❌ Temporary files

**They're already in .gitignore!** ✅

## 🔗 Useful Aliases (Optional)

Add to your shell config (`~/.bashrc` or `~/.zshrc`):

```bash
alias gs='git status'
alias ga='git add'
alias gc='git commit -m'
alias gp='git push'
alias gl='git log --oneline'
alias gd='git diff'
```

Then use:
```bash
gs              # instead of git status
ga .            # instead of git add .
gc "message"    # instead of git commit -m "message"
```

## 📊 Current Repository State

```bash
Branch: master
Commits: 1
Files tracked: 28
Lines of code: 3,781
```

**Initial commit includes:**
- ✅ Backend (6 modules)
- ✅ Frontend (React app + 6 components)
- ✅ Deployment scripts (VM + AWS)
- ✅ Documentation (README, deployment guides)

## 🎯 Next Steps

1. **Make changes** to your code
2. **Stage changes**: `git add .`
3. **Commit**: `git commit -m "your message"`
4. **(Optional)** Push to GitHub/GitLab

---

**Pro Tip:** Commit frequently! Small, focused commits are better than large ones.
