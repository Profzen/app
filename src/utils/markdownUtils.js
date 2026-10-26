/**
 * Markdown utilities for product descriptions across web and mobile.
 * Implements safe Markdown subset:
 * - Paragraphs (blank lines)
 * - Hard line breaks for single newlines within paragraphs
 * - **bold**
 * - *italic*
 * - Bullet lists ("- ", "* ", and lines starting with "•" or other unicode bullets,
 *   including copy-pasted ones with invisible characters: \u00a0, \u200b, \ufeff, etc.)
 * - Numbered lists ("1. ", "2. ", etc.)
 * - Headings (###)
 * - Strips or neutralizes raw HTML, links, and images for plain-text / safe rendering.
 */

// Invisible characters + unicode spaces: non-breaking space, zero-width spaces, hair/thin spaces, BOM, tabs, spaces
const INVISIBLE_PREFIX = '[\\s\\u00a0\\u1680\\u2000-\\u200d\\u2028\\u2029\\u202f\\u205f\\u3000\\ufeff]';
const BULLET_PREFIX_REGEX = new RegExp('^' + INVISIBLE_PREFIX + '*[•\\u2022\\u25cf\\u25e6\\u25aa\\u25ab]' + INVISIBLE_PREFIX + '*');
const DASH_BULLET_REGEX = new RegExp('^' + INVISIBLE_PREFIX + '*[-*]' + INVISIBLE_PREFIX + '+');
const NUMBERED_PREFIX_REGEX = new RegExp('^' + INVISIBLE_PREFIX + '*(\\d+)[.)]' + INVISIBLE_PREFIX + '+');
const HEADING_PREFIX_REGEX = new RegExp('^' + INVISIBLE_PREFIX + '*(#{1,6})' + INVISIBLE_PREFIX + '+');

/**
 * Normalizes raw product description text for standard Markdown parsing:
 * - Converts "•" or other bullet symbols (even with invisible spaces) into standard "* "
 * - Normalizes numbered lists and headings
 * - Ensures list blocks have blank lines before and after
 * - Appends two spaces to normal paragraph lines so single newlines become hard line breaks
 *
 * @param {string} text - Raw product description
 * @returns {string} Normalized Markdown text
 */
export function normalizeProductDescription(text) {
  if (!text || typeof text !== 'string') return '';

  const rawLines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

  // 1. Standardize line prefixes
  const standardizedLines = rawLines.map(line => {
    if (BULLET_PREFIX_REGEX.test(line)) {
      return line.replace(BULLET_PREFIX_REGEX, '* ');
    }
    if (DASH_BULLET_REGEX.test(line)) {
      return line.replace(DASH_BULLET_REGEX, '* ');
    }
    if (NUMBERED_PREFIX_REGEX.test(line)) {
      return line.replace(NUMBERED_PREFIX_REGEX, (_, n) => `${n}. `);
    }
    if (HEADING_PREFIX_REGEX.test(line)) {
      return line.replace(HEADING_PREFIX_REGEX, (_, h) => `${h} `);
    }
    return line;
  });

  // 2. Format spacing between lists and paragraphs, and preserve single line breaks
  const result = [];
  for (let i = 0; i < standardizedLines.length; i++) {
    const cur = standardizedLines[i];
    const isCurBullet = /^\* /.test(cur);
    const isCurNumbered = /^\d+\. /.test(cur);
    const isCurEmpty = cur.trim() === '';
    const isCurHeading = /^#{1,6} /.test(cur);

    const prev = result[result.length - 1];
    const isPrevBullet = prev !== undefined && /^\* /.test(prev.trim());
    const isPrevNumbered = prev !== undefined && /^\d+\. /.test(prev.trim());
    const isPrevEmpty = prev === undefined || prev.trim() === '';

    // If starting a bullet list after a normal paragraph, add a blank line
    if (isCurBullet && !isPrevBullet && !isPrevEmpty) {
      result.push('');
    }
    // If starting a numbered list after a normal paragraph or bullet list, add a blank line
    if (isCurNumbered && !isPrevNumbered && !isPrevEmpty) {
      result.push('');
    }
    // If transitioning from any list to normal paragraph, add a blank line
    if (!isCurBullet && !isCurNumbered && !isCurEmpty && (isPrevBullet || isPrevNumbered)) {
      result.push('');
    }

    const next = standardizedLines[i + 1];
    const isNextList = next !== undefined && /^(\* |\d+\. )/.test(next);
    const isNextEmpty = next === undefined || next.trim() === '';
    const isNextHeading = next !== undefined && /^#{1,6} /.test(next);

    // If normal text followed directly by another normal text line, add two spaces for hard break
    if (!isCurEmpty && !isCurHeading && !isCurBullet && !isCurNumbered && !isNextEmpty && !isNextList && !isNextHeading) {
      result.push(cur + '  ');
    } else {
      result.push(cur);
    }
  }

  return result.join('\n');
}

export function isHtml(content) {
  if (!content || typeof content !== 'string') return false;
  return /<\s*(?:p|h[1-6]|ul|ol|li|blockquote|strong|b|em|i|u|s|br)\b[^>]*>/i.test(content);
}

export function legacyToHtml(raw) {
  if (!raw || typeof raw !== 'string') return '';
  if (isHtml(raw)) return raw;

  const text = raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, '')
    .replace(/[\u00A0\u202F]/g, ' ')
    .trim();

  const lines = text.split('\n');
  const htmlParts = [];
  let inList = null;
  let currentParagraph = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      htmlParts.push(`<p>${currentParagraph.join('<br />')}</p>`);
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (inList) {
      htmlParts.push(`</${inList}>`);
      inList = null;
    }
  };

  const formatInline = (str) => {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&(?!lt;|gt;|quot;|#39;|nbsp;)/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.+?)__/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/_(.+?)_/g, '<em>$1</em>')
      .replace(/~~(.+?)~~/g, '<s>$1</s>');
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    const h3Match = line.match(/^###\s+(.+)$/);
    const h2Match = line.match(/^##\s+(.+)$/);
    if (h3Match) {
      flushParagraph();
      flushList();
      htmlParts.push(`<h3>${formatInline(h3Match[1])}</h3>`);
      continue;
    }
    if (h2Match) {
      flushParagraph();
      flushList();
      htmlParts.push(`<h2>${formatInline(h2Match[1])}</h2>`);
      continue;
    }

    const quoteMatch = line.match(/^>\s+(.+)$/);
    if (quoteMatch) {
      flushParagraph();
      flushList();
      htmlParts.push(`<blockquote><p>${formatInline(quoteMatch[1])}</p></blockquote>`);
      continue;
    }

    // Bullet list:
    // For "-" and "*", require at least one space/invisible char so "*italic*" and "-10%" remain normal text.
    // "•" may have no space.
    const bulletMatch = line.match(/^(?:[-*][\s\u00A0\u200B-\u200D\u202F\u2060\uFEFF]+|[•\u2022][\s\u00A0\u200B-\u200D\u202F\u2060\uFEFF]*)(.+)$/);
    if (bulletMatch) {
      const itemContent = bulletMatch[1]
        .replace(/^[\s\u00A0\u200B-\u200D\u202F\u2060\uFEFF]+/, '')
        .trim();
      if (itemContent) {
        flushParagraph();
        if (inList !== 'ul') {
          flushList();
          htmlParts.push('<ul>');
          inList = 'ul';
        }
        htmlParts.push(`<li>${formatInline(itemContent)}</li>`);
        continue;
      }
    }

    const numMatch = line.match(/^\d+[.)]\s*(.+)$/);
    if (numMatch) {
      flushParagraph();
      if (inList !== 'ol') {
        flushList();
        htmlParts.push('<ol>');
        inList = 'ol';
      }
      htmlParts.push(`<li>${formatInline(numMatch[1])}</li>`);
      continue;
    }

    flushList();
    currentParagraph.push(formatInline(line));
  }

  flushParagraph();
  flushList();

  return htmlParts.join('');
}

/**
 * Strips all HTML tags and Markdown formatting to produce clean plain text for cards,
 * search results, and 1-2 line clamped previews.
 *
 * @param {string} text - Raw, HTML, or Markdown text
 * @returns {string} Plain text without formatting
 */
export function stripMarkdown(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    // Remove HTML tags
    .replace(/<[^>]*>/g, ' ')
    // Remove headings (# Heading)
    .replace(/^[\s\u00a0\u1680\u2000-\u200d\u2028\u2029\u202f\u205f\u3000\ufeff]*#{1,6}\s+/gm, '')
    // Remove images: ![alt](url) -> alt
    .replace(/!\[(.*?)\]\(.*?\)/g, '$1')
    // Remove links: [text](url) -> text
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    // Remove bold and italic: **text**, __text__, *text*, _text_
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Remove strikethrough ~~text~~
    .replace(/~~(.*?)~~/g, '$1')
    // Replace bullet points at start of line
    .replace(/^[\s\u00a0\u1680\u2000-\u200d\u2028\u2029\u202f\u205f\u3000\ufeff]*[•\u2022\u25cf\u25e6\u25aa\u25ab\-*][\s\u00a0\u1680\u2000-\u200d\u2028\u2029\u202f\u205f\u3000\ufeff]*/gm, '')
    // Replace numbered lists at start of line
    .replace(/^[\s\u00a0\u1680\u2000-\u200d\u2028\u2029\u202f\u205f\u3000\ufeff]*\d+[.)][\s\u00a0\u1680\u2000-\u200d\u2028\u2029\u202f\u205f\u3000\ufeff]*/gm, '')
    // Remove blockquotes >
    .replace(/^>\s+/gm, '')
    // Replace HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Replace newlines with spaces
    .replace(/[\r\n]+/g, ' ')
    // Collapse multiple spaces into one
    .replace(/\s+/g, ' ')
    .trim();
}
