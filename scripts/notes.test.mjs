import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { buildNotes } from './build-notes.mjs';

import {
  escapeHtml,
  loadNotes,
  parseNote,
  renderMarkdown,
  validateNotes,
} from './notes.mjs';

const validFrontmatter = `---
slug: launch-notes
title: "Launch notes"
description: 'What changed'
eyebrow: Product
audience: recruitment
project: Portfolio
status: published
featured: true
image: /images/launch.webp
publishedAt: 2026-09-07
updatedAt: 2026-09-08
---`;

const validMeta = {
  slug: 'launch-notes',
  title: 'Launch notes',
  description: 'What changed',
  eyebrow: 'Product',
  audience: 'recruitment',
  project: 'Portfolio',
  status: 'published',
  featured: true,
  image: '/images/launch.webp',
  publishedAt: '2026-09-07',
  updatedAt: '2026-09-08',
};

test('parseNote parses valid frontmatter scalars and preserves the Markdown body', () => {
  const source = `${validFrontmatter}\n\n# Hello\n\nA short note.\n`;

  const note = parseNote(source, '/content/notes/launch-notes.md');

  assert.deepEqual(note.meta, validMeta);
  assert.equal(note.body, '# Hello\n\nA short note.\n');
  assert.equal(note.filePath, '/content/notes/launch-notes.md');
});

test('validateNotes rejects duplicate slugs', () => {
  const first = { meta: { ...validMeta }, body: 'First', filePath: 'first.md' };
  const second = { meta: { ...validMeta }, body: 'Second', filePath: 'second.md' };

  assert.throws(
    () => validateNotes([first, second]),
    /duplicate slug "launch-notes".*second\.md/i,
  );
});

test('validateNotes rejects missing, undefined, null, and empty required fields', async (t) => {
  const invalidValues = [
    ['missing', Symbol('missing')],
    ['undefined', undefined],
    ['null', null],
    ['empty', ''],
  ];

  for (const [label, value] of invalidValues) {
    await t.test(label, () => {
      const meta = { ...validMeta };

      if (label === 'missing') {
        delete meta.title;
      } else {
        meta.title = value;
      }

      assert.throws(
        () => validateNotes([{ meta, body: '', filePath: `${label}.md` }]),
        new RegExp(`required frontmatter field "title".*${label}\\.md`, 'i'),
      );
    });
  }
});

test('loadNotes reads only Markdown files in sorted file-name order', async (t) => {
  const contentDir = await mkdtemp(join(tmpdir(), 'portfolio-notes-'));
  t.after(() => rm(contentDir, { recursive: true, force: true }));

  const draft = (slug) =>
    `${validFrontmatter
      .replace('slug: launch-notes', `slug: ${slug}`)
      .replace('status: published', 'status: draft')
      .replace('publishedAt: 2026-09-07', 'publishedAt:')}\n\nBody`;

  await Promise.all([
    writeFile(join(contentDir, 'b-note.md'), draft('second-note')),
    writeFile(join(contentDir, 'a-note.md'), draft('first-note')),
    writeFile(join(contentDir, 'ignored.txt'), 'not a note'),
  ]);

  const notes = await loadNotes(contentDir);

  assert.deepEqual(
    notes.map((note) => note.meta.slug),
    ['first-note', 'second-note'],
  );
});

test('validateNotes requires publishedAt for published notes', () => {
  assert.throws(
    () =>
      validateNotes([
        {
          meta: { ...validMeta, publishedAt: undefined },
          body: '',
          filePath: 'missing-date.md',
        },
      ]),
    /publishedAt.*published.*missing-date\.md/i,
  );
});

test('validateNotes rejects an invalid slug', () => {
  assert.throws(
    () =>
      validateNotes([
        {
          meta: { ...validMeta, slug: 'Launch_notes' },
          body: '',
          filePath: 'invalid-slug.md',
        },
      ]),
    /invalid slug.*invalid-slug\.md/i,
  );
});

test('parseNote rejects malformed frontmatter lines', () => {
  const source = `${validFrontmatter.replace('title: "Launch notes"', 'title "Launch notes"')}\n\nBody`;

  assert.throws(
    () => parseNote(source, 'malformed.md'),
    /malformed frontmatter.*malformed\.md/i,
  );
});

test('renderMarkdown converts GFM headings, emphasis, and lists to HTML', () => {
  const html = renderMarkdown('# Heading\n\n*important*\n\n- one\n- two');

  assert.match(html, /<h1>Heading<\/h1>/);
  assert.match(html, /<em>important<\/em>/);
  assert.match(html, /<ul>[\s\S]*<li>one<\/li>[\s\S]*<li>two<\/li>[\s\S]*<\/ul>/);
});

test('escapeHtml escapes values before they are interpolated into generated HTML', () => {
  assert.equal(
    escapeHtml(`Tom & "Ada" <team> 'notes'`),
    'Tom &amp; &quot;Ada&quot; &lt;team&gt; &#39;notes&#39;',
  );
});

test('buildNotes generates isolated preview and public note routes', async () => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), 'portfolio-notes-build-'));
  const contentDir = join(temporaryRoot, 'content', 'notes');
  const publicDir = join(temporaryRoot, 'public');
  const previewDistDir = join(temporaryRoot, 'preview-dist');
  const publicDistDir = join(temporaryRoot, 'public-dist');

  try {
    await Promise.all([
      mkdir(contentDir, { recursive: true }),
      mkdir(join(publicDir, 'images'), { recursive: true }),
    ]);
    await writeFile(join(publicDir, 'images', 'launch.webp'), 'test image');

    const draft = validFrontmatter
      .replace('slug: launch-notes', 'slug: private-notes')
      .replace('title: "Launch notes"', 'title: "Draft <notes>"')
      .replace('status: published', 'status: draft')
      .replace('featured: true', 'featured: false')
      .replace('publishedAt: 2026-09-07', 'publishedAt:');

    const published = validFrontmatter.replace(
      'title: "Launch notes"',
      'title: "Launch </script><script>alert(1)</script>"',
    );

    await Promise.all([
      writeFile(
        join(contentDir, 'draft.md'),
        `${draft}\n\n## Draft body\n\nPrivate draft.\n`,
      ),
      writeFile(
        join(contentDir, 'published.md'),
        `${published}\n\n## Published body\n\nPublic note.\n`,
      ),
    ]);

    await buildNotes({
      contentDir,
      distDir: previewDistDir,
      publicDir,
      preview: true,
    });
    await buildNotes({
      contentDir,
      distDir: publicDistDir,
      publicDir,
      preview: false,
    });

    const [
      previewIndex,
      publicIndex,
      draftPage,
      publicDraftPage,
      publishedPage,
    ] =
      await Promise.all([
        readFile(join(previewDistDir, 'notes', 'index.html'), 'utf8'),
        readFile(join(publicDistDir, 'notes', 'index.html'), 'utf8'),
        readFile(
          join(previewDistDir, 'notes', 'private-notes', 'index.html'),
          'utf8',
        ),
        readFile(
          join(publicDistDir, 'notes', 'private-notes', 'index.html'),
          'utf8',
        ),
        readFile(
          join(publicDistDir, 'notes', 'launch-notes', 'index.html'),
          'utf8',
        ),
      ]);

    assert.match(previewIndex, /href="\/notes\/private-notes\/"/);
    assert.match(previewIndex, /<meta name="robots" content="index, follow/);
    assert.match(previewIndex, /Brouillon/);
    assert.match(previewIndex, /Draft &lt;notes&gt;/);
    assert.doesNotMatch(previewIndex, /Draft <notes>/);
    assert.doesNotMatch(publicIndex, /\/notes\/private-notes\//);

    assert.match(draftPage, /<meta name="robots" content="noindex, nofollow"/);
    assert.match(draftPage, /Brouillon/);
    assert.doesNotMatch(draftPage, /BlogPosting|BreadcrumbList/);
    assert.match(
      publicDraftPage,
      /<meta name="robots" content="noindex, nofollow"/,
    );

    assert.match(publishedPage, /<meta name="robots" content="index, follow/);
    assert.match(publishedPage, /rel="canonical"/);
    assert.match(publishedPage, /BlogPosting/);
    assert.match(publishedPage, /BreadcrumbList/);
    assert.match(publishedPage, /<img[^>]+width="1280"[^>]+height="800"/);
    assert.doesNotMatch(publishedPage, /<\/script><script>/);
    assert.match(publishedPage, /\\u003c\/script\\u003e\\u003cscript\\u003e/);

    const unsafeContentDir = join(temporaryRoot, 'unsafe-content');
    await mkdir(unsafeContentDir);
    await Promise.all([
      writeFile(join(temporaryRoot, 'outside.webp'), 'outside public'),
      writeFile(
        join(unsafeContentDir, 'unsafe.md'),
        `${draft.replace('/images/launch.webp', '/../outside.webp')}\n\nBody.\n`,
      ),
    ]);

    await assert.rejects(
      () =>
        buildNotes({
          contentDir: unsafeContentDir,
          distDir: join(temporaryRoot, 'unsafe-dist'),
          publicDir,
          preview: true,
        }),
      /image path escapes the public directory/i,
    );
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});
