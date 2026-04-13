# kleikodesh.github.io — Project Website

The public-facing website for the KleiKodesh project, hosted at [kleikodesh.github.io](https://kleikodesh.github.io).

## What It Is

A static HTML/CSS/JS site that serves as the download and information page for the KleiKodesh Word add-in. It is a separate Git repository (submodule / sibling folder) and is deployed directly via GitHub Pages.

## Structure

```
kleikodesh.github.io/
├── index.html              — Single-page site
├── style.css               — Custom styles
├── script.js               — Theme toggle, scroll progress, gallery interactions
├── lightbox.css / .js      — Lightbox for screenshot gallery
├── photoswipe.esm.js / .css — PhotoSwipe image viewer
├── images/                 — Screenshots and logos
└── Files/                  — Downloadable guides and Word templates
```

## Sections

- **Hero** — Download button and email signup form.
- **Features** — Showcases Kezayit (seforim viewer), Regex search, Torah formatting tools, and the websites panel.
- **Downloads** — Links to user guides and document templates.
- **Related Projects** — Links to Otzaria and the standalone Zayit app.
- **Contact** — Contact form.

## Relationship to the Main Project

This folder is not part of the Visual Studio solution. It is a standalone static site that links to the installer (`KleiKodeshVstoInstallerWpf` build output) hosted elsewhere (e.g. GitHub Releases).
