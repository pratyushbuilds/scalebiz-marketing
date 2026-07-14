# Scalebiz Marketing — brand assets

All marks vectorized from the master logo (`assets/images/Scalebiz_logo.jpeg`).
Brand navy `#1E3146`, cream/background `#FAF9F6`, blue `#0B4DFF`, red `#E94235`.

## assets/logo/ — full wordmark lockup (icon + "Scalebiz MARKETING")
| File | Use |
|---|---|
| `logo-dark.svg` / `logo-dark.png` | **Navy** artwork — for light / cream backgrounds |
| `logo-light.svg` / `logo-light.png` | **Cream** artwork — for dark backgrounds |

(Name = the artwork colour. SVG is resolution-independent; PNG is 1600px wide.)

## assets/favicon/ — browser tab + app icons (wired into every page `<head>`)
`favicon.ico` (16/32/48), `favicon.svg`, `favicon-16/32/48.png`,
`apple-touch-icon.png` (180, opaque), `android-chrome-192/512.png`,
`maskable-512.png`, `site.webmanifest`.
A copy of `favicon.ico` also lives at the site root for default `/favicon.ico` requests.

## assets/brand/ — square / avatar assets
`logo-square.png` (1024, navy rounded tile + cream mark — social profile pictures),
`mark-navy.svg`, `mark-cream.svg` (icon mark only, no wordmark).

## assets/social/ — link-share preview
`og-image.png` (1200×630) — branded share card built from the logo lockup
(mark + wordmark on cream, tagline + domain). Referenced by every page's
`og:image` / `twitter:image`. Replaced the old text-only `og-scalebiz.png`.

## Regenerating
Scripts live in the scratchpad (`analyze.js`, `trace.js`, `trace_full.js`,
`generate.js`) using `sharp` + `potrace` + `png-to-ico`. Re-run `generate.js`
to rebuild the full set from the traced paths.
