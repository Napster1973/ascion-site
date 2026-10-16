# Ascion — landing page

Static site: `index.html`, `style.css`, `script.js`. No build step.

## 1. Set up the contact form (5 min)
GitHub Pages can't send email by itself, so the form uses **Formspree** (free tier: 50 messages/month).

1. Create an account at https://formspree.io and create a new form.
2. Copy your form ID (looks like `xyzabcd`).
3. In `index.html`, replace `YOUR_FORM_ID` in the form `action`.
4. In `script.js`, set `CONTACT_EMAIL` to your email (shown to visitors only if sending fails). Submissions are emailed to the target email set in Formspree.

Until step 3 is done, the form opens the visitor's email app with the message pre-filled.

## 2. Publish on GitHub Pages
1. Create a new public repo (e.g. `ascion-site`) and upload the files to the root.
2. Repo → **Settings → Pages** → Source: *Deploy from a branch* → `main` / `(root)` → Save.
3. Under **Custom domain**, type your domain (e.g. `www.yourdomain.com`) → Save. This creates a `CNAME` file.

## 3. Point the domain (Cloudflare DNS)
Cloudflare → ascion.site → DNS → Records, all set to **DNS only** (grey cloud):

| Type  | Name | Content                 |
|-------|------|-------------------------|
| A     | @    | 185.199.108.153         |
| A     | @    | 185.199.109.153         |
| A     | @    | 185.199.110.153         |
| A     | @    | 185.199.111.153         |
| CNAME | www  | napster1973.github.io   |

Once GitHub's DNS check is green and the certificate is issued, tick **Enforce HTTPS** in Settings → Pages.

## Updating the site
```bash
git add . && git commit -m "update" && git push
```
Live in about a minute (hard-refresh with Ctrl+Shift+R to bypass the cache).

## Editing the text
All copy lives in `index.html`. Colors are variables at the top of `style.css`.
