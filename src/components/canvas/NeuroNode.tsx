import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { Item } from '../../types/item';

const categoryStyles: Record<Item['category'], string> = {
  Company: 'border-fern/40 bg-white',
  Family: 'border-coral/35 bg-white',
  Personal: 'border-skyglass bg-white',
  'Top Priority': 'border-brass/60 bg-[#fffaf0]',
};

export const NeuroNode = memo(function NeuroNode({ data, selected }: NodeProps) {
  const item = data.item as Item;

  return (
    <div
      className={`w-[184px] rounded-lg border px-3 py-2 shadow-node transition ${categoryStyles[item.category]} ${
        selected ? 'ring-2 ring-brass' : ''
      }`}
    >
      <Handle className="!h-2 !w-2 !bg-fern" type="target" position={Position.Top} />
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs font-semibold uppercase tracking-wide text-graphite/65">{item.category}</span>
        <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[10px] font-semibold text-graphite">{item.type}</span>
      </div>
      <div className="mt-1 line-clamp-2 text-sm font-semibold text-ink">{item.title}</div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-graphite/70">
        <span>{item.status}</span>
        <span>{item.priority}</span>
      </div>
      <Handle className="!h-2 !w-2 !bg-fern" type="source" position={Position.Bottom} />
    </div>
  );
});
