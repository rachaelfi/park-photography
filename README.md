# parkphotography.net

Portfolio site for Park Photography — weddings, portraits, and landscapes.

Built with **Astro**, images served by **Cloudinary**, hosted on **Cloudflare Pages**. The site is fully static: no CMS and no client framework. The only JavaScript on the page runs the hero slideshow, the gallery lightbox, the mobile menu, and the contact form.

<br>

## Contents

- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Managing photos](#managing-photos)
- [Where to change things](#where-to-change-things)
- [Contact form](#contact-form)
- [Deploying](#deploying)
- [Troubleshooting](#troubleshooting)

<br>

## Getting started

```bash
npm install
npm run dev
```

The site runs at **http://localhost:4321**.

Before the first run, create a `.env` file in the project root with your Cloudinary credentials (see below). Without it the site still builds, but every gallery renders empty.

> **Never commit `.env`.** It holds your API secret. Confirm `.gitignore` contains a line reading `.env`.

<br>

## Environment variables

Set these in `.env` for local development, and again in the Cloudflare Pages dashboard under **Settings → Environment variables** for the live site.

**Photos** — required for the build:

| Variable | Purpose |
| --- | --- |
| `PUBLIC_CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name. Used in image URLs. |
| `CLOUDINARY_API_KEY` | Reads folder contents at build time. |
| `CLOUDINARY_API_SECRET` | Reads folder contents at build time. Mark as encrypted in Cloudflare. |

**Contact form** — only needed on Cloudflare:

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Sends the enquiry email. |
| `CONTACT_TO_EMAIL` | Where enquiries arrive. |
| `CONTACT_FROM_EMAIL` | Sender address. Must be on a domain verified with Resend. |

**Build** — Cloudflare only:

| Variable | Value |
| --- | --- |
| `NODE_VERSION` | `22` |

<br>

## Managing photos

Photos live in Cloudinary, not in this repo. Upload into these folders and they appear on the site at the next build:

```
parkphotography/
├── hero/          Home page slideshow — every photo rotates
├── about/         About page portrait — first photo only
├── nature/
├── portraits/
├── engagements/
├── weddings/
└── graduation/
```

Folder names are **case-sensitive** and must match `src/data/galleries.ts` exactly.

### Ordering

Photos sort by name, numerically. Prefix names to set the order:

```
01-sunrise
02-dunes
10-ridge     ← sorts after 02, not after 01
```

Change the order by editing a photo's **display name** in Cloudinary, not its public ID. Renaming public IDs can leave the site pairing new images with old dimensions, which crops them to the wrong shape.

### Cover photos

Tag any photo `cover` in Cloudinary to make it that gallery's cover. Without a tag, the first photo is used.

### Alt text

Open a photo in Cloudinary and add a contextual metadata field named `alt`. Without one, the photo gets a generic description.

<br>

## Where to change things

| What | File |
| --- | --- |
| Name, email, phone, tagline, social links | `src/data/site.ts` |
| Gallery titles, descriptions, folders | `src/data/galleries.ts` |
| Colours, type scale, spacing | `src/styles/global.css` |
| Header, menu, portfolio dropdown | `src/components/Nav.astro` |
| Footer and social icons | `src/components/Footer.astro` |
| Gallery layout (columns, spacing) | `src/components/StaggeredGrid.astro` |
| Home page slideshow | `src/components/Hero.astro` |
| Corner brackets on the slideshow | `src/components/Frame.astro` |
| Bio copy | `src/pages/about.astro` |
| Form fields | `src/pages/contact.astro` |

### Adding a gallery

Add one entry to `galleryDefinitions` in `src/data/galleries.ts`, then create the matching folder in Cloudinary. The portfolio page, gallery route, dropdown menu, and next-gallery link all pick it up automatically.

### Gallery layout

The gallery is a masonry layout. In `StaggeredGrid.astro`:

- **`column-count`** sets photo size — fewer columns means bigger photos
- **`max-width`** caps the overall width of the gallery
- **`--gap`** is the spacing between photos

<br>

## Contact form

The form posts to `functions/api/contact.ts`, a Cloudflare Pages Function. Pages serves anything in `/functions` alongside the static build, so no Astro adapter is needed.

Email is sent through [Resend](https://resend.com). Replies go straight to the sender, since `reply_to` is set to their address.

A hidden honeypot field named `company` catches bots — submissions that fill it get a silent success and nothing is sent.

> The form **does not work under `npm run dev`**, because Astro's dev server doesn't run Pages Functions. Test it on a deployed preview instead.

<br>

## Deploying

The site deploys automatically from GitHub. Push to `main` and Cloudflare rebuilds within a couple of minutes.

### First-time setup

1. In the Cloudflare dashboard, go to **Workers & Pages → Create application**
2. Choose the **Pages** tab — not the default Workers import, which won't run the contact form
3. **Connect to Git** and select this repository
4. Use these build settings:

   | Setting | Value |
   | --- | --- |
   | Framework preset | Astro |
   | Build command | `npm run build` |
   | Output directory | `dist` |

5. Add the [environment variables](#environment-variables)
6. **Save and Deploy**, then check the `.pages.dev` preview
7. Under **Custom domains**, add `parkphotography.net` and `www.parkphotography.net`

> Don't use `wrangler pages deploy`. That's Direct Upload, and a Git-connected project can't be switched to it.

### Publishing new photos automatically

Photos are read at build time, so uploading to Cloudinary doesn't change the live site on its own. To make it automatic:

1. In the Pages project, go to **Settings → Builds** and create a **deploy hook**
2. In Cloudinary, go to **Settings → Webhook Notifications** and add the hook URL for the **upload** event

For large batches, disable the notification, upload everything, then trigger the hook once by hand.

<br>

## Troubleshooting

**A gallery is empty.**
Check the terminal running `npm run dev` for a `[cloudinary]` line. `Missing credentials` means `.env` isn't being read. `No images found in "…"` means the folder name doesn't match.

**Changes in Cloudinary don't show up locally.**
Folder contents are cached for the life of the dev server. Stop it with `Ctrl+C` and restart — saving a file isn't enough.

**Photos are cropped to the wrong shape.**
Stale dimensions after a rename. Restart the dev server, or redeploy for the live site.

**Images load slowly after a code change.**
Cloudinary generates each image size the first time it's requested. Changing image settings changes the URLs, so the first load is slow until the new versions are cached. It speeds up on its own.
