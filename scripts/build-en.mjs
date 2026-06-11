/* ============================================================
   LES HEURES — génération de la page anglaise pré-rendue
   Lancé après `vite build` : transforme dist/index.html en
   dist/en/index.html à partir du dictionnaire i18n (textes,
   balises head, chemins d'assets), et écrit dist/sitemap.xml
   avec la date du build. Une seule source de vérité : i18n.js.
   ============================================================ */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { translations } from "../src/i18n.js";

const SITE = "https://cyrilarlaud.com";
const dist = fileURLToPath(new URL("../dist/", import.meta.url));

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

let html = readFileSync(dist + "index.html", "utf8");

/* ---- textes : chaque data-i18n reçoit sa valeur anglaise ---- */
for (const [key, value] of Object.entries(translations.en)) {
  const re = new RegExp(
    `(data-i18n="${key.replace(/\./g, "\\.")}"[^>]*>)[^<]*`,
    "g"
  );
  html = html.replace(re, `$1${esc(value).replace(/\$/g, "$$$$")}`);
}

/* ---- head : langue, titre, descriptions, canonique, OG ---- */
const EN_TITLE = translations.en["meta.title"];
const EN_DESC =
  "Full-stack web developer in Marseille, France — React, Next.js, Node.js, React Native. SaaS, fintech and mobile products built end to end. Open to full-stack roles, on-site or fully remote.";
const EN_OG_DESC =
  "Web products built end to end — SaaS, fintech, mobile. From real-time gaming to PSD2 strong authentication.";

html = html
  .replace('<html lang="fr">', '<html lang="en">')
  .replace(/<title>[^<]*<\/title>/, `<title>${esc(EN_TITLE)}</title>`)
  .replace(
    /(name="description"\s+content=")[^"]*(")/,
    `$1${esc(EN_DESC)}$2`
  )
  .replace(
    /(rel="canonical" href=")[^"]*(")/,
    `$1${SITE}/en/$2`
  )
  .replace(/(property="og:url" content=")[^"]*(")/, `$1${SITE}/en/$2`)
  .replace(
    /(property="og:title" content=")[^"]*(")/,
    `$1${esc(EN_TITLE)}$2`
  )
  .replace(
    /(property="og:description"\s+content=")[^"]*(")/,
    `$1${esc(EN_OG_DESC)}$2`
  )
  .replace(
    /(property="og:image:alt" content=")[^"]*(")/,
    "$1Cyril Arlaud — Les Heures, full-stack web developer portfolio$2"
  )
  .replace('content="fr_FR"', 'content="__SWAP__"')
  .replace('content="en_US"', 'content="fr_FR"')
  .replace('content="__SWAP__"', 'content="en_US"')
  .replace(
    /(name="twitter:title" content=")[^"]*(")/,
    `$1${esc(EN_TITLE)}$2`
  )
  .replace(
    /(name="twitter:description"\s+content=")[^"]*(")/,
    `$1${esc(EN_OG_DESC)}$2`
  );

/* ---- chemins relatifs : la page vit un niveau plus bas ---- */
html = html
  .replaceAll('"./', '"../')
  .replaceAll('data-preview="screens/', 'data-preview="../screens/');

mkdirSync(dist + "en", { recursive: true });
writeFileSync(dist + "en/index.html", html);

/* ---- sitemap avec alternates hreflang ---- */
const today = new Date().toISOString().slice(0, 10);
const alt = `
    <xhtml:link rel="alternate" hreflang="fr" href="${SITE}/"/>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE}/en/"/>`;
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${SITE}/</loc>
    <lastmod>${today}</lastmod>${alt}
  </url>
  <url>
    <loc>${SITE}/en/</loc>
    <lastmod>${today}</lastmod>${alt}
  </url>
</urlset>
`;
writeFileSync(dist + "sitemap.xml", sitemap);

console.log("✓ dist/en/index.html + dist/sitemap.xml générés");
