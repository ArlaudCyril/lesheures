import {
  mkdir,
  realpath,
  stat,
  writeFile,
} from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { escapeHtml, loadNotes, renderMarkdown } from './notes.mjs';

const SITE_URL = 'https://cyrilarlaud.com';
const IMAGE_WIDTH = 1280;
const IMAGE_HEIGHT = 800;

function absoluteUrl(pathname) {
  return new URL(pathname, SITE_URL).href;
}

function formatDate(value) {
  if (!value) return null;

  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`));
}

function safeJson(value) {
  const characters = {
    '<': '\\u003c',
    '>': '\\u003e',
    '&': '\\u0026',
    '\u2028': '\\u2028',
    '\u2029': '\\u2029',
  };

  return JSON.stringify(value).replace(
    /[<>&\u2028\u2029]/g,
    (character) => characters[character],
  );
}

function isOutsideRoot(root, candidate) {
  const pathFromRoot = relative(root, candidate);

  return (
    pathFromRoot === '..' ||
    pathFromRoot.startsWith(`..${sep}`) ||
    isAbsolute(pathFromRoot)
  );
}

async function assertPublicImage(publicDir, note) {
  const { image, slug } = note.meta;

  if (
    !image.startsWith('/') ||
    image.startsWith('//') ||
    image.includes('\\') ||
    /[\0?#]/.test(image)
  ) {
    throw new Error(
      `Image must use an absolute site path for note "${slug}": ${image}`,
    );
  }

  const publicRoot = await realpath(publicDir);
  const imagePath = resolve(publicRoot, `.${image}`);

  if (imagePath === publicRoot || isOutsideRoot(publicRoot, imagePath)) {
    throw new Error(
      `Image path escapes the public directory for note "${slug}": ${image}`,
    );
  }

  let imageRealPath;
  let imageStat;

  try {
    imageRealPath = await realpath(imagePath);
    imageStat = await stat(imageRealPath);
  } catch (error) {
    if (error?.code === 'ENOENT') {
      throw new Error(
        `Image not found under public for note "${slug}": ${image}`,
      );
    }
    throw error;
  }

  if (isOutsideRoot(publicRoot, imageRealPath) || !imageStat.isFile()) {
    throw new Error(
      `Image must be a file inside public for note "${slug}": ${image}`,
    );
  }
}

function projectHref(project) {
  const routes = new Map([
    ['letmebet', '/projets/letmebet/'],
    ['bemore.fans', '/projets/bemore-fans/'],
  ]);

  return routes.get(String(project).toLowerCase()) ?? '/#work';
}

function noteStatus(note) {
  if (note.meta.status === 'draft') {
    return '<span class="note-status">Brouillon</span>';
  }

  return `<time datetime="${escapeHtml(note.meta.publishedAt)}">Publié le ${escapeHtml(formatDate(note.meta.publishedAt))}</time>`;
}

function pageHead({
  title,
  description,
  pathname,
  image = '/og.jpg',
  imageAlt,
  robots,
  type = 'website',
  structuredData = [],
}) {
  const canonical = absoluteUrl(pathname);
  const imageUrl = absoluteUrl(image);
  const jsonLd = structuredData
    .map(
      (data) =>
        `    <script type="application/ld+json">${safeJson(data)}</script>`,
    )
    .join('\n');

  return `
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="author" content="Cyril Arlaud" />
    <meta name="robots" content="${escapeHtml(robots)}" />
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="theme-color" content="#0b0a10" />
    <title>${escapeHtml(title)}</title>
    <link rel="canonical" href="${escapeHtml(canonical)}" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="stylesheet" href="/notes.css" />
    <meta property="og:type" content="${escapeHtml(type)}" />
    <meta property="og:site_name" content="Cyril Arlaud" />
    <meta property="og:locale" content="fr_FR" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(canonical)}" />
    <meta property="og:image" content="${escapeHtml(imageUrl)}" />
    <meta property="og:image:width" content="${IMAGE_WIDTH}" />
    <meta property="og:image:height" content="${IMAGE_HEIGHT}" />
    <meta property="og:image:alt" content="${escapeHtml(imageAlt)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />
${jsonLd}`;
}

function featuredCard(note) {
  const { meta } = note;
  const href = `/notes/${meta.slug}/`;

  return `
        <article class="note-card note-card--featured">
          <a class="note-card__visual" href="${href}" aria-label="Lire ${escapeHtml(meta.title)}">
            <img src="${escapeHtml(meta.image)}" width="${IMAGE_WIDTH}" height="${IMAGE_HEIGHT}" alt="Aperçu du projet ${escapeHtml(meta.project)}" />
          </a>
          <div class="note-card__content">
            <p class="note-kicker">${escapeHtml(meta.eyebrow)} · ${noteStatus(note)}</p>
            <h3><a href="${href}">${escapeHtml(meta.title)}</a></h3>
            <p>${escapeHtml(meta.description)}</p>
            <p class="note-card__meta">Projet associé : ${escapeHtml(meta.project)}</p>
            <a class="note-card__cta" href="${href}">Lire la note <span aria-hidden="true">→</span></a>
          </div>
        </article>`;
}

function compactCard(note) {
  const { meta } = note;
  const href = `/notes/${meta.slug}/`;

  return `
          <article class="note-card note-card--compact">
            <p class="note-kicker">${escapeHtml(meta.eyebrow)} · ${noteStatus(note)}</p>
            <h3><a href="${href}">${escapeHtml(meta.title)}</a></h3>
            <p>${escapeHtml(meta.description)}</p>
            <a class="note-card__cta" href="${href}">Lire la note <span aria-hidden="true">→</span></a>
          </article>`;
}

function renderIndex(notes, preview) {
  const visibleNotes = notes.filter(
    (note) => preview || note.meta.status === 'published',
  );
  const featured =
    visibleNotes.find((note) => note.meta.featured) ?? visibleNotes[0];
  const secondary = visibleNotes.filter((note) => note !== featured);
  const featuredContent = featured
    ? featuredCard(featured)
    : '<p class="notes-empty">Les premières notes sont en cours de préparation.</p>';
  const listContent = secondary.length
    ? secondary.map(compactCard).join('')
    : '<p class="notes-empty">Les prochaines notes paraîtront ici.</p>';
  const robots = preview
    ? 'noindex, nofollow'
    : 'index, follow, max-image-preview:large';

  return `<!DOCTYPE html>
<html lang="fr">
  <head>${pageHead({
    title: 'Notes — Cyril Arlaud',
    description:
      'Décisions techniques, architecture SaaS et retours de terrain par Cyril Arlaud.',
    pathname: '/notes/',
    imageAlt: 'Notes techniques de Cyril Arlaud',
    robots,
  })}
  </head>
  <body>
    <a class="skip-link" href="#main-content">Aller au contenu</a>
    <div class="notes-shell">
      <nav class="notes-nav" aria-label="Navigation des notes">
        <a href="/">← Cyril Arlaud</a>
        <a href="mailto:bonjour@cyrilarlaud.com">Me contacter</a>
      </nav>
      <main id="main-content">
        <header class="notes-index-hero">
          <p class="note-kicker">Notes de terrain · Produit &amp; technique</p>
          <h1>Construire, expliquer, améliorer.</h1>
          <p>Des décisions prises en construisant des produits SaaS, des interfaces temps réel et des expériences web, avec leur contexte, leurs compromis et ce qu’elles ont changé.</p>
        </header>
        <section class="notes-featured" aria-labelledby="featured-heading">
          <p class="section-label">Sélection</p>
          <h2 id="featured-heading">À la une</h2>${featuredContent}
        </section>
        <section class="notes-list" aria-labelledby="notes-list-heading">
          <p class="section-label">À parcourir</p>
          <h2 id="notes-list-heading">Toutes les notes</h2>
          <div class="notes-list__items">${listContent}
          </div>
        </section>
      </main>
      <footer class="notes-footer">
        <p>Une question ou un projet à discuter ? <a href="mailto:bonjour@cyrilarlaud.com">Écrire à Cyril</a>.</p>
      </footer>
    </div>
  </body>
</html>
`;
}

function publishedStructuredData(note) {
  const { meta } = note;
  const pageUrl = absoluteUrl(`/notes/${meta.slug}/`);
  const article = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: meta.title,
    description: meta.description,
    image: absoluteUrl(meta.image),
    datePublished: meta.publishedAt,
    author: {
      '@type': 'Person',
      name: 'Cyril Arlaud',
      url: `${SITE_URL}/`,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
  };

  if (meta.updatedAt) article.dateModified = meta.updatedAt;

  return [
    article,
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Accueil',
          item: `${SITE_URL}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Notes',
          item: `${SITE_URL}/notes/`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: meta.title,
          item: pageUrl,
        },
      ],
    },
  ];
}

function renderNote(note) {
  const { meta } = note;
  const pathname = `/notes/${meta.slug}/`;
  const isPublished = meta.status === 'published';
  const robots = isPublished
    ? 'index, follow, max-image-preview:large'
    : 'noindex, nofollow';
  const structuredData = isPublished ? publishedStructuredData(note) : [];
  const publishedDate = formatDate(meta.publishedAt);
  const updatedDate = formatDate(meta.updatedAt);
  const dateLabel = isPublished
    ? `Publié le ${escapeHtml(publishedDate)}${updatedDate ? ` · Mis à jour le ${escapeHtml(updatedDate)}` : ''}`
    : '<span class="note-status">Brouillon</span> · Aperçu local';
  const projectUrl = projectHref(meta.project);

  return `<!DOCTYPE html>
<html lang="fr">
  <head>${pageHead({
    title: `${meta.title} — Cyril Arlaud`,
    description: meta.description,
    pathname,
    image: meta.image,
    imageAlt: `Aperçu du projet ${meta.project}`,
    robots,
    type: 'article',
    structuredData,
  })}
  </head>
  <body>
    <a class="skip-link" href="#main-content">Aller au contenu</a>
    <div class="notes-shell">
      <nav class="notes-nav" aria-label="Navigation de la note">
        <a href="/">← Cyril Arlaud</a>
        <a href="/notes/">Toutes les notes</a>
      </nav>
      <nav class="note-breadcrumb" aria-label="Fil d’Ariane">
        <ol>
          <li><a href="/">Accueil</a></li>
          <li><a href="/notes/">Notes</a></li>
          <li aria-current="page">${escapeHtml(meta.title)}</li>
        </ol>
      </nav>
      <main id="main-content">
        <article class="note-article">
          <header class="note-hero">
            <p class="note-kicker">${escapeHtml(meta.eyebrow)} · ${dateLabel}</p>
            <h1>${escapeHtml(meta.title)}</h1>
            <p class="note-intro">${escapeHtml(meta.description)}</p>
          </header>
          <figure class="note-cover">
            <img src="${escapeHtml(meta.image)}" width="${IMAGE_WIDTH}" height="${IMAGE_HEIGHT}" alt="Aperçu du projet ${escapeHtml(meta.project)}" />
          </figure>
          <div class="note-layout">
            <div class="note-body">${renderMarkdown(note.body)}</div>
            <aside class="note-aside" aria-labelledby="associated-project">
              <h2 id="associated-project">Projet associé</h2>
              <p>${escapeHtml(meta.project)}</p>
              <p><a href="${projectUrl}">Voir le projet ${escapeHtml(meta.project)}</a></p>
              <h2>En parler</h2>
              <p><a href="mailto:bonjour@cyrilarlaud.com?subject=${encodeURIComponent(`Note : ${meta.title}`)}">Écrire à Cyril</a></p>
              <p><a href="/notes/">Découvrir les autres notes</a></p>
            </aside>
          </div>
        </article>
      </main>
    </div>
  </body>
</html>
`;
}

export async function buildNotes({
  contentDir,
  distDir,
  preview = false,
  publicDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public'),
}) {
  if (!contentDir || !distDir) {
    throw new TypeError('buildNotes requires contentDir and distDir');
  }

  const notes = await loadNotes(contentDir);
  await Promise.all(notes.map((note) => assertPublicImage(publicDir, note)));

  const notesDistDir = join(distDir, 'notes');
  await mkdir(notesDistDir, { recursive: true });
  await writeFile(join(notesDistDir, 'index.html'), renderIndex(notes, preview));

  await Promise.all(
    notes.map(async (note) => {
      const noteDistDir = join(notesDistDir, note.meta.slug);
      await mkdir(noteDistDir, { recursive: true });
      await writeFile(join(noteDistDir, 'index.html'), renderNote(note));
    }),
  );

  return notes;
}

const scriptPath = fileURLToPath(import.meta.url);
const isCli = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href === pathToFileURL(scriptPath).href
  : false;

if (isCli) {
  const projectRoot = resolve(dirname(scriptPath), '..');
  await buildNotes({
    contentDir: join(projectRoot, 'content', 'notes'),
    distDir: join(projectRoot, 'dist'),
    publicDir: join(projectRoot, 'public'),
    preview: process.argv.includes('--preview'),
  });
}
