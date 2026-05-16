import { parseMarkdown } from '../../utils/markdown';

interface MarkdownPreviewProps {
  value: string;
}

export function MarkdownPreview({ value }: MarkdownPreviewProps) {
  const blocks = parseMarkdown(value);

  if (blocks.length === 0) {
    return <div className="text-sm text-graphite/50">No description yet.</div>;
  }

  return (
    <div className="space-y-2 text-sm leading-6 text-ink">
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          const HeadingTag = `h${block.level}` as 'h1' | 'h2' | 'h3';
          const headingClass =
            block.level === 1
              ? 'text-lg font-semibold'
              : block.level === 2
                ? 'text-base font-semibold'
                : 'text-sm font-semibold uppercase tracking-[0.08em] text-graphite/70';
          return (
            <HeadingTag key={`${block.type}-${index}`} className={headingClass}>
              {block.text}
            </HeadingTag>
          );
        }

        if (block.type === 'bullet') {
          return (
            <div key={`${block.type}-${index}`} className="flex gap-2">
              <span className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
              <span>{block.text}</span>
            </div>
          );
        }

        if (block.type === 'quote') {
          return (
            <blockquote
              key={`${block.type}-${index}`}
              className="border-l-2 border-teal/50 bg-mist px-3 py-2 text-graphite"
            >
              {block.text}
            </blockquote>
          );
        }

        if (block.type === 'code') {
          return (
            <pre
              key={`${block.type}-${index}`}
              className="overflow-auto rounded-md bg-ink px-3 py-2 text-xs leading-5 text-white"
            >
              <code>{block.text}</code>
            </pre>
          );
        }

        return <p key={`${block.type}-${index}`}>{block.text}</p>;
      })}
    </div>
  );
}
