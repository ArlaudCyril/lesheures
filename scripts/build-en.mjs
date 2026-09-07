/* ============================================================
   LES HEURES — génération de la page anglaise pré-rendue
   Lancé après `vite build` : transforme dist/index.html en
   dist/en/index.html à partir du dictionnaire i18n (textes,
   balises head, chemins d'assets), et écrit les fichiers de
   découverte (sitemap.xml, llms.txt). Une seule source de vérité : i18n.js.
   ============================================================ */
import {
  mkdirSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { translations } from "../src/i18n.js";
import { loadNotes } from "./notes.mjs";

const SITE = "https://cyrilarlaud.com";
const dist = fileURLToPath(new URL("../dist/", import.meta.url));
const notesDirectory = fileURLToPath(
  new URL("../content/notes/", import.meta.url)
);

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const escapeXml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const escapeLlmsText = (value) =>
  String(value ?? "")
    .replace(/\r?\n/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/([`*_\[\]{}()#+.!|~=>-])/g, "\\$1")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

function writeArtifactsAtomically(artifacts) {
  const staged = [];

  try {
    artifacts.forEach(({ path, contents }) => {
      const temporaryPath = `${path}.tmp-${randomUUID()}`;
      writeFileSync(temporaryPath, contents, { encoding: "utf8", flag: "wx" });
      staged.push({ path, temporaryPath });
    });

    staged.forEach(({ path, temporaryPath }) => {
      renameSync(temporaryPath, path);
    });
  } finally {
    staged.forEach(({ temporaryPath }) => {
      try {
        unlinkSync(temporaryPath);
      } catch (error) {
        if (error?.code !== "ENOENT") throw error;
      }
    });
  }
}

let html = readFileSync(dist + "index.html", "utf8");

/* ---- textes : chaque data-i18n reçoit sa valeur anglaise ---- */
for (const [key, value] of Object.entries(translations.en)) {
  const re = new RegExp(
    `(data-i18n="${key.replace(/\./g, "\\.")}"[^>]*>)[^<]*`,
    "g"
  );
  html = html.replace(re, `$1${esc(value).replace(/\$/g, "$$$$")}`);
}

/* ---- attributs accessibles : aria-labels bilingues ---- */
for (const [key, value] of Object.entries(translations.en)) {
  const re = new RegExp(
    `(data-i18n-aria-label="${key.replace(/\./g, "\\.")}"[^>]*aria-label=")[^"]*(")`,
    "g"
  );
  html = html.replace(re, `$1${esc(value).replace(/\$/g, "$$$$")}$2`);
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
  .replaceAll('data-preview="screens/', 'data-preview="../screens/')
  .replaceAll('href="/projets/letmebet/"', 'href="/en/projets/letmebet/"')
  .replaceAll('href="/projets/bemore-fans/"', 'href="/en/projets/bemore-fans/"');

/* Les notes restent françaises tant qu'aucune traduction relue n'existe. */
if (!html.includes('href="/notes/"') || html.includes('href="/en/notes/"')) {
  throw new Error("Les liens Notes anglais doivent conserver la route /notes/");
}

/* ---- sitemap avec alternates hreflang ---- */
const publishedNotes = (await loadNotes(notesDirectory))
  .filter((note) => note.meta.status === "published")
  .sort((left, right) =>
    left.meta.slug < right.meta.slug
      ? -1
      : left.meta.slug > right.meta.slug
        ? 1
        : 0
  );

const alternates = (fr, en) => `
    <xhtml:link rel="alternate" hreflang="fr" href="${fr}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${en}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${fr}"/>`;

const noteEntries = publishedNotes
  .map((note) => {
    const url = escapeXml(`${SITE}/notes/${note.meta.slug}/`);
    const lastmod = note.meta.updatedAt
      ? `\n    <lastmod>${escapeXml(note.meta.updatedAt)}</lastmod>`
      : "";

    return `  <url>
    <loc>${url}</loc>${lastmod}
    <xhtml:link rel="alternate" hreflang="fr" href="${url}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${url}"/>
  </url>`;
  })
  .join("\n");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${SITE}/</loc>
    ${alternates(`${SITE}/`, `${SITE}/en/`)}
  </url>
  <url>
    <loc>${SITE}/en/</loc>
    ${alternates(`${SITE}/`, `${SITE}/en/`)}
  </url>
  <url>
    <loc>${SITE}/projets/letmebet/</loc>
    ${alternates(`${SITE}/projets/letmebet/`, `${SITE}/en/projets/letmebet/`)}
  </url>
  <url>
    <loc>${SITE}/en/projets/letmebet/</loc>
    ${alternates(`${SITE}/projets/letmebet/`, `${SITE}/en/projets/letmebet/`)}
  </url>
  <url>
    <loc>${SITE}/projets/bemore-fans/</loc>
    ${alternates(`${SITE}/projets/bemore-fans/`, `${SITE}/en/projets/bemore-fans/`)}
  </url>
  <url>
    <loc>${SITE}/en/projets/bemore-fans/</loc>
    ${alternates(`${SITE}/projets/bemore-fans/`, `${SITE}/en/projets/bemore-fans/`)}
  </url>${noteEntries ? `\n${noteEntries}` : ""}
</urlset>
`;
/* ---- llms.txt : remplacer seulement le bloc de notes généré ---- */
const llmsPath = dist + "llms.txt";
const llmsStartMarker = "<!-- GENERATED_NOTES_START -->";
const llmsEndMarker = "<!-- GENERATED_NOTES_END -->";
const llms = readFileSync(llmsPath, "utf8");
const llmsStart = llms.indexOf(llmsStartMarker);
const llmsEnd = llms.indexOf(llmsEndMarker);

if (
  llmsStart === -1 ||
  llmsEnd === -1 ||
  llmsEnd < llmsStart + llmsStartMarker.length ||
  llms.indexOf(llmsStartMarker, llmsStart + llmsStartMarker.length) !== -1 ||
  llms.indexOf(llmsEndMarker, llmsEnd + llmsEndMarker.length) !== -1
) {
  throw new Error("Le bloc de notes généré de dist/llms.txt est invalide");
}

const llmsNotes = publishedNotes
  .map((note) => {
    const url = `${SITE}/notes/${note.meta.slug}/`;

    return `### ${escapeLlmsText(note.meta.title)}

${escapeLlmsText(note.meta.description)}

${url}`;
  })
  .join("\n\n");

const llmsContentStart = llmsStart + llmsStartMarker.length;
const generatedLlmsBlock = `\n${llmsNotes}${llmsNotes ? "\n" : ""}`;
const generatedLlms =
  llms.slice(0, llmsContentStart) +
  generatedLlmsBlock +
  llms.slice(llmsEnd);

mkdirSync(dist + "en", { recursive: true });
writeArtifactsAtomically([
  { path: dist + "en/index.html", contents: html },
  { path: dist + "sitemap.xml", contents: sitemap },
  { path: llmsPath, contents: generatedLlms },
]);

console.log(
  "✓ dist/en/index.html + dist/sitemap.xml + dist/llms.txt générés"
);
