import { describe, expect, it } from 'vitest';
import { parseMarkdown } from '../utils/markdown';

describe('markdown parser', () => {
  it('parses headings, bullets, quotes, paragraphs, and fenced code blocks', () => {
    expect(
      parseMarkdown(`# Strategy

Plain note body
- first action
> decision context
\`\`\`
const value = 1;
\`\`\``),
    ).toEqual([
      { type: 'heading', level: 1, text: 'Strategy' },
      { type: 'paragraph', text: 'Plain note body' },
      { type: 'bullet', text: 'first action' },
      { type: 'quote', text: 'decision context' },
      { type: 'code', text: 'const value = 1;' },
    ]);
  });

  it('returns no blocks for empty content', () => {
    expect(parseMarkdown(' \n\n ')).toEqual([]);
  });
});
