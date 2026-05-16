export type MarkdownBlock =
  | { type: 'heading'; level: 1 | 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'bullet'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'code'; text: string };

export function parseMarkdown(markdown: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  let codeLines: string[] = [];
  let isInCodeBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === '```') {
      if (isInCodeBlock) {
        blocks.push({ type: 'code', text: codeLines.join('\n').trimEnd() });
        codeLines = [];
      }
      isInCodeBlock = !isInCodeBlock;
      continue;
    }

    if (isInCodeBlock) {
      codeLines.push(line);
      continue;
    }

    if (!trimmed) continue;

    const heading = /^(#{1,3})\s+(.+)$/.exec(trimmed);
    if (heading) {
      blocks.push({
        type: 'heading',
        level: heading[1].length as 1 | 2 | 3,
        text: heading[2].trim(),
      });
      continue;
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      blocks.push({ type: 'bullet', text: trimmed.slice(2).trim() });
      continue;
    }

    if (trimmed.startsWith('> ')) {
      blocks.push({ type: 'quote', text: trimmed.slice(2).trim() });
      continue;
    }

    blocks.push({ type: 'paragraph', text: trimmed });
  }

  if (isInCodeBlock && codeLines.length > 0) {
    blocks.push({ type: 'code', text: codeLines.join('\n').trimEnd() });
  }

  return blocks;
}
