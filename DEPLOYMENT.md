# Deployment Guide: Tic Tac Toe Pro

Since Tic Tac Toe Pro is built using only vanilla HTML, CSS, and JavaScript with no build framework required, it can be hosted for free on any static web hosting provider. 

Here are step-by-step instructions for deploying to **GitHub Pages** and **Cloudflare Pages**.

---

## 1. Deploying to GitHub Pages

GitHub Pages is a free, fast hosting service integrated directly into GitHub repositories.

### Prerequisites:
- A GitHub account.
- Git installed on your system.

### Steps:

1. **Initialize a Git Repository and Commit Files:**
   Open your terminal in the project directory (`ticTacToe`) and run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Tic Tac Toe Pro PWA"
   ```

2. **Create a New GitHub Repository:**
   - Log in to your GitHub account and click **New** repository.
   - Name your repository (e.g., `tictactoe-pro`).
   - Do **NOT** initialize it with a README, `.gitignore`, or license.
   - Click **Create repository**.

3. **Push Code to GitHub:**
   Copy the commands from the GitHub repository page and run them:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/tictactoe-pro.git
   git branch -M main
   git push -u origin main
   ```

4. **Enable GitHub Pages:**
   - Go to your repository page on GitHub.
   - Click on the **Settings** tab.
   - In the left sidebar under the "Code and automation" section, click on **Pages**.
   - Under **Build and deployment**, set the **Source** to `Deploy from a branch`.
   - Set the **Branch** to `main` and the directory folder to `/ (root)`.
   - Click **Save**.

5. **Visit Your Site:**
   - Wait 1-2 minutes. GitHub Actions will build and deploy the page automatically.
   - Refresh the Settings -> Pages tab to see your live deployment URL (usually `https://YOUR_USERNAME.github.io/tictactoe-pro/`).

> [!NOTE]
> Because GitHub Pages serves sites from subdirectories (e.g. `/tictactoe-pro/` instead of `/`), make sure your asset reference URLs in `sw.js` and HTML files are relative (e.g., `./assets/css/main.css` or `assets/css/main.css`) rather than absolute (e.g. `/assets/css/main.css`), or set your custom root domain mapping in GitHub Settings.

---

## 2. Deploying to Cloudflare Pages

Cloudflare Pages provides global CDN coverage, fast loading speeds, and automatic SSL out of the box.

### Prerequisites:
- A Cloudflare account.
- Your project uploaded to a GitHub or GitLab repository.

### Steps:

1. **Connect to Cloudflare Pages:**
   - Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
   - In the left sidebar, select **Workers & Pages**.
   - Click **Create Application** and select the **Pages** tab.
   - Click **Connect to Git**.
   - Authenticate with GitHub/GitLab and select your `tictactoe-pro` repository.

2. **Configure Build Settings:**
   - **Project Name:** `tictactoe-pro` (this will determine your default subdomain, e.g., `tictactoe-pro.pages.dev`).
   - **Production Branch:** `main`.
   - **Framework Preset:** Select `None` (since this is a vanilla site).
   - **Build Command:** Leave empty.
   - **Build Output Directory:** Set to the root directory `/` or `.` (this is where `index.html` resides).

3. **Deploy:**
   - Click **Save and Deploy**.
   - Cloudflare will clone your repository and build the static assets.
   - Once completed (usually under 30 seconds), you will receive a live URL: `https://tictactoe-pro.pages.dev`.

### Benefits of Cloudflare Pages:
- Immediate global edge distribution (fast Core Web Vitals).
- Out-of-the-box support for service worker cache headers.
- Pre-configured HTTP/3 and HTTPS security.
