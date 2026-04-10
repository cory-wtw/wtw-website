# Worth Their Weight — Website

Public website and transparency dashboard for Worth Their Weight, a Chattanooga, TN veterans nonprofit helping homeless veterans navigate VA claims.

**Live site:** https://worththeirweight.org

---

## Repo structure

```
worth-their-weight/
├── index.html              — Main website
├── dashboard-widget.html   — Transparency dashboard (embedded in index.html)
├── update-dashboard.md     — Instructions for Claude Code to update dashboard data
└── README.md               — This file
```

---

## First-time setup

### 1. Create the GitHub repo

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create worth-their-weight --public
git push -u origin main
```

Or create the repo at github.com manually and push.

### 2. Connect to Netlify

1. Go to [netlify.com](https://netlify.com) and log in
2. Click **Add new site → Import an existing project**
3. Connect to GitHub and select this repo
4. Build settings: leave everything blank (no build command, publish directory is `/`)
5. Click **Deploy site**
6. Once deployed, go to **Domain settings** and add your custom domain

Netlify will auto-deploy every time you push to `main`.

---

## Updating the dashboard (monthly workflow)

Every time you reconcile your books:

1. Open your Google Sheet (Worth Their Weight Books)
2. File → Download → Microsoft Excel (.xlsx)
3. Open Claude Code in this repo folder
4. Upload `WorthTheirWeight_Books.xlsx`
5. Type: **"Follow update-dashboard.md"**
6. Review the summary of changes Claude shows you
7. Deploy:

```bash
git add dashboard-widget.html
git commit -m "Dashboard update — April 2026"
git push
```

Site updates in ~30 seconds.

---

## Editing website copy

Open `index.html` in any text editor. The mission statement, hero text, and how-it-works steps are all plain HTML — easy to find and edit.

To update the mission statement or case placeholder text that appears in the dashboard widget, edit those values in the `Settings` tab of your Google Sheet. They'll be picked up automatically on the next Claude Code update run.

---

## Local preview

Open any `.html` file directly in your browser, or run a simple local server:

```bash
npx serve .
```

Then visit `http://localhost:3000`.

---

## Tech stack

- Plain HTML, CSS, JavaScript — no frameworks, no build step
- Hosted on Netlify (free tier)
- Dashboard data updated via Claude Code + spreadsheet upload
- Fonts: DM Serif Display + DM Sans (Google Fonts)

---

## Contact

hello@worththeirweight.org
