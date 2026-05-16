import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { Item } from '../../types/item';

const categoryStyles: Record<Item['category'], string> = {
  Company: 'border-fern/80 bg-fern',
  Family: 'border-coral/80 bg-coral',
  Personal: 'border-skyglass bg-skyglass',
  'Top Priority': 'border-brass bg-brass',
};

export const NeuroNode = memo(function NeuroNode({ data, selected }: NodeProps) {
  const item = data.item as Item;

  return (
    <div
      className={`group relative flex min-w-[132px] items-center gap-2 rounded-full border bg-[#17191c]/82 px-2.5 py-1.5 shadow-none backdrop-blur-sm transition ${selected ? 'ring-2 ring-white/75' : ''}`}
    >
      <Handle className="!left-1/2 !top-1/2 !h-2 !w-2 !-translate-x-1/2 !-translate-y-1/2 !border-0 !bg-transparent" type="target" position={Position.Top} />
      <span
        className={`h-3 w-3 shrink-0 rounded-full border shadow-[0_0_16px_rgba(255,255,255,0.2)] ${categoryStyles[item.category]} ${
          selected ? 'scale-125' : ''
      }`}
      />
      <div className="min-w-0">
        <div className="truncate text-[11px] font-semibold text-white/88">{item.title}</div>
        <div className="truncate text-[9px] uppercase text-white/42">{item.category} / {item.type}</div>
      </div>
      <Handle className="!left-1/2 !top-1/2 !h-2 !w-2 !-translate-x-1/2 !-translate-y-1/2 !border-0 !bg-transparent" type="source" position={Position.Bottom} />
    </div>
  );
});
