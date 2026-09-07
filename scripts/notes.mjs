import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

import { marked } from 'marked';

const REQUIRED_FIELDS = [
  'slug',
  'title',
  'description',
  'eyebrow',
  'audience',
  'project',
  'status',
  'featured',
  'image',
];

const ALLOWED_FIELDS = new Set([
  ...REQUIRED_FIELDS,
  'publishedAt',
  'updatedAt',
]);

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function sourceLabel(filePath) {
  return filePath || '<unknown file>';
}

function parseScalar(rawValue) {
  const value = rawValue.trim();

  if (value === '') return null;
  if (value === 'true') return true;
  if (value === 'false') return false;

  const quote = value[0];
  if (
    value.length >= 2 &&
    (quote === '"' || quote === "'") &&
    value.at(-1) === quote
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function isCalendarDate(value) {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return false;

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function validateNote(note) {
  const label = sourceLabel(note?.filePath);
  const meta = note?.meta;

  if (!meta || typeof meta !== 'object' || Array.isArray(meta)) {
    throw new Error(`Missing note metadata in ${label}`);
  }

  for (const field of REQUIRED_FIELDS) {
    if (
      !Object.hasOwn(meta, field) ||
      meta[field] === null ||
      (typeof meta[field] === 'string' && meta[field].length === 0)
    ) {
      throw new Error(`Missing required frontmatter field "${field}" in ${label}`);
    }
  }

  if (typeof meta.slug !== 'string' || !SLUG_PATTERN.test(meta.slug)) {
    throw new Error(`Invalid slug "${String(meta.slug)}" in ${label}`);
  }

  if (!['recruitment', 'freelance'].includes(meta.audience)) {
    throw new Error(`Invalid audience "${String(meta.audience)}" in ${label}`);
  }

  if (!['draft', 'published'].includes(meta.status)) {
    throw new Error(`Invalid status "${String(meta.status)}" in ${label}`);
  }

  if (typeof meta.featured !== 'boolean') {
    throw new Error(`Frontmatter field "featured" must be a boolean in ${label}`);
  }

  if (typeof meta.image !== 'string' || !meta.image.startsWith('/')) {
    throw new Error(`Frontmatter field "image" must start with "/" in ${label}`);
  }

  if (meta.status === 'published' && !isCalendarDate(meta.publishedAt)) {
    throw new Error(
      `Frontmatter field "publishedAt" must be a YYYY-MM-DD date for published notes in ${label}`,
    );
  }

  if (meta.publishedAt != null && !isCalendarDate(meta.publishedAt)) {
    throw new Error(`Invalid publishedAt date in ${label}; expected YYYY-MM-DD`);
  }

  if (meta.updatedAt != null && !isCalendarDate(meta.updatedAt)) {
    throw new Error(`Invalid updatedAt date in ${label}; expected YYYY-MM-DD`);
  }
}

export function parseNote(source, filePath) {
  const label = sourceLabel(filePath);

  if (typeof source !== 'string') {
    throw new TypeError(`Note source must be a string in ${label}`);
  }

  const frontmatterMatch = source.match(
    /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/,
  );

  if (!frontmatterMatch) {
    throw new Error(`Missing or malformed frontmatter block in ${label}`);
  }

  const meta = {};
  const lines = frontmatterMatch[1].split(/\r?\n/);

  for (const [index, line] of lines.entries()) {
    const lineMatch = line.match(/^([A-Za-z][A-Za-z0-9]*):[ \t]*(.*)$/);

    if (!lineMatch) {
      throw new Error(
        `Malformed frontmatter line ${index + 2} in ${label}: ${line}`,
      );
    }

    const [, key, rawValue] = lineMatch;

    if (!ALLOWED_FIELDS.has(key)) {
      throw new Error(`Unknown frontmatter field "${key}" in ${label}`);
    }

    if (Object.hasOwn(meta, key)) {
      throw new Error(`Duplicate frontmatter field "${key}" in ${label}`);
    }

    meta[key] = parseScalar(rawValue);
  }

  const body = source.slice(frontmatterMatch[0].length).replace(/^\r?\n/, '');
  const note = { meta, body, filePath };
  validateNote(note);

  return note;
}

export function validateNotes(notes) {
  if (!Array.isArray(notes)) {
    throw new TypeError('Notes must be an array');
  }

  const slugs = new Map();

  for (const note of notes) {
    validateNote(note);

    const { slug } = note.meta;
    if (slugs.has(slug)) {
      throw new Error(
        `Duplicate slug "${slug}" in ${sourceLabel(note.filePath)}; first declared in ${slugs.get(slug)} (slug dupliqué)`,
      );
    }

    slugs.set(slug, sourceLabel(note.filePath));
  }

  return notes;
}

export async function loadNotes(contentDir) {
  const entries = await readdir(contentDir, { withFileTypes: true });
  const fileNames = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name)
    .sort();

  const notes = await Promise.all(
    fileNames.map(async (fileName) => {
      const filePath = join(contentDir, fileName);
      const source = await readFile(filePath, 'utf8');
      return parseNote(source, filePath);
    }),
  );

  return validateNotes(notes);
}

export function renderMarkdown(body) {
  return marked.parse(body, { gfm: true, breaks: false, mangle: false });
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
