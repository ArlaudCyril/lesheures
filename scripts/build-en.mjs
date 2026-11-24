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
    .replace(/([`*_\[\]{}()#+.!|~=-])/g, "\\$1")
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
  "Backend-focused full-stack developer in Marseille. I build secure APIs, web and mobile apps, and support tools powered by AI agents.";
const EN_IMAGE_ALT =
  "Cyril Arlaud, backend-focused full-stack developer for web and mobile, against a dawn sky";

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
    `$1${esc(EN_DESC)}$2`
  )
  .replaceAll(`content="${SITE}/og.jpg"`, `content="${SITE}/og-en.jpg"`)
  .replace(
    /((?:property="og:image:alt"|name="twitter:image:alt") content=")[^"]*(")/g,
    `$1${esc(EN_IMAGE_ALT)}$2`
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
    `$1${esc(EN_DESC)}$2`
  )
  .replace(/("jobTitle": )"[^"]*"/, (_, prefix) => prefix + JSON.stringify(translations.en["hero.eyebrow"]))
  .replace(/("description": )"[^"]*"/, (_, prefix) => prefix + JSON.stringify(EN_DESC));

/* ---- chemins relatifs : la page vit un niveau plus bas ---- */
html = html
  .replaceAll('"./', '"../')
  .replaceAll('href="/projets/letmebet/"', 'href="/en/projets/letmebet/"')
  .replaceAll('href="/projets/letmebet-support/"', 'href="/en/projets/letmebet-support/"')
  .replaceAll('href="/projets/bemore-fans/"', 'href="/en/projets/bemore-fans/"')
  .replaceAll('href="/projets/orion/"', 'href="/en/projets/orion/"')
  .replaceAll('href="/projets/yoor/"', 'href="/en/projets/yoor/"')
  .replaceAll('href="/projets/pcs/"', 'href="/en/projets/pcs/"')
  .replaceAll('href="/projets/hora-essence/"', 'href="/en/projets/hora-essence/"');

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
    <loc>${SITE}/projets/letmebet-support/</loc>
    ${alternates(`${SITE}/projets/letmebet-support/`, `${SITE}/en/projets/letmebet-support/`)}
  </url>
  <url>
    <loc>${SITE}/en/projets/letmebet-support/</loc>
    ${alternates(`${SITE}/projets/letmebet-support/`, `${SITE}/en/projets/letmebet-support/`)}
  </url>
  <url>
    <loc>${SITE}/projets/bemore-fans/</loc>
    ${alternates(`${SITE}/projets/bemore-fans/`, `${SITE}/en/projets/bemore-fans/`)}
  </url>
  <url>
    <loc>${SITE}/en/projets/bemore-fans/</loc>
    ${alternates(`${SITE}/projets/bemore-fans/`, `${SITE}/en/projets/bemore-fans/`)}
  </url>
  <url>
    <loc>${SITE}/projets/orion/</loc>
    ${alternates(`${SITE}/projets/orion/`, `${SITE}/en/projets/orion/`)}
  </url>
  <url>
    <loc>${SITE}/en/projets/orion/</loc>
    ${alternates(`${SITE}/projets/orion/`, `${SITE}/en/projets/orion/`)}
  </url>
  <url>
    <loc>${SITE}/projets/yoor/</loc>
    ${alternates(`${SITE}/projets/yoor/`, `${SITE}/en/projets/yoor/`)}
  </url>
  <url>
    <loc>${SITE}/en/projets/yoor/</loc>
    ${alternates(`${SITE}/projets/yoor/`, `${SITE}/en/projets/yoor/`)}
  </url>
  <url>
    <loc>${SITE}/projets/pcs/</loc>
    ${alternates(`${SITE}/projets/pcs/`, `${SITE}/en/projets/pcs/`)}
  </url>
  <url>
    <loc>${SITE}/en/projets/pcs/</loc>
    ${alternates(`${SITE}/projets/pcs/`, `${SITE}/en/projets/pcs/`)}
  </url>
  <url>
    <loc>${SITE}/projets/hora-essence/</loc>
    ${alternates(`${SITE}/projets/hora-essence/`, `${SITE}/en/projets/hora-essence/`)}
  </url>
  <url>
    <loc>${SITE}/en/projets/hora-essence/</loc>
    ${alternates(`${SITE}/projets/hora-essence/`, `${SITE}/en/projets/hora-essence/`)}
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
