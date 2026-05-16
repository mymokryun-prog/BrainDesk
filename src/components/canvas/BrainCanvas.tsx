import { useEffect, useMemo, useRef } from 'react';
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type ReactFlowInstance,
} from '@xyflow/react';
import type { Item } from '../../types/item';
import { getFilteredItems, useItemStore } from '../../store/itemStore';
import { BrainShapeBackdrop } from './BrainShapeBackdrop';
import { NeuroNode } from './NeuroNode';

const nodeTypes = { neuro: NeuroNode };

export function BrainCanvas() {
  return (
    <ReactFlowProvider>
      <BrainCanvasInner />
    </ReactFlowProvider>
  );
}

function BrainCanvasInner() {
  const flowRef = useRef<ReactFlowInstance | null>(null);
  const itemsById = useItemStore((state) => state.items);
  const relationshipsById = useItemStore((state) => state.relationships);
  const selectedItemId = useItemStore((state) => state.selectedItemId);
  const filters = useItemStore((state) => state.filters);
  const selectItem = useItemStore((state) => state.selectItem);
  const updateItemPosition = useItemStore((state) => state.updateItemPosition);
  const createRelationship = useItemStore((state) => state.createRelationship);

  const relationships = useMemo(() => Object.values(relationshipsById), [relationshipsById]);
  const visibleItems = useMemo(() => getFilteredItems({ items: itemsById, filters }), [filters, itemsById]);
  const visibleIds = useMemo(() => new Set(visibleItems.map((item) => item.id)), [visibleItems]);

  const initialNodes = useMemo<Node[]>(
    () =>
      visibleItems.map((item) => ({
        id: item.id,
        type: 'neuro',
        position: item.position,
        data: { item },
        selected: item.id === selectedItemId,
      })),
    [selectedItemId, visibleItems],
  );

  const initialEdges = useMemo<Edge[]>(
    () =>
      relationships
        .filter((relationship) => visibleIds.has(relationship.sourceItemId) && visibleIds.has(relationship.targetItemId))
        .map((relationship) => ({
          id: relationship.id,
          source: relationship.sourceItemId,
          target: relationship.targetItemId,
          label: relationship.label,
          type: 'smoothstep',
          animated: relationship.strength >= 4,
          style: {
            stroke: '#6c9487',
            strokeWidth: Math.max(1, relationship.strength),
          },
        })),
    [relationships, visibleIds],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  useEffect(() => {
    function fitView() {
      flowRef.current?.fitView({ padding: 0.18, duration: 320 });
    }

    window.addEventListener('neurotask:fit', fitView);
    return () => window.removeEventListener('neurotask:fit', fitView);
  }, []);

  function handleConnect(connection: Connection) {
    if (!connection.source || !connection.target || connection.source === connection.target) return;
    const relationship = createRelationship(connection.source, connection.target, {
      label: 'related',
      strength: 2,
    });
    setEdges((current) =>
      addEdge(
        {
          id: relationship.id,
          source: relationship.sourceItemId,
          target: relationship.targetItemId,
          label: relationship.label,
          type: 'smoothstep',
        },
        current,
      ),
    );
  }

  return (
    <div className="relative h-full overflow-hidden bg-[#edf2ef]">
      <BrainShapeBackdrop />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onInit={(instance) => {
          flowRef.current = instance;
        }}
        onNodeClick={(_, node) => selectItem(node.id)}
        onNodeDragStop={(_, node) => updateItemPosition(node.id, node.position)}
        fitView
        minZoom={0.25}
        maxZoom={2.2}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#cfdad4" gap={28} size={1} />
        <MiniMap
          pannable
          zoomable
          className="!bottom-20 !right-5 !rounded-lg !border !border-white/70 !bg-white/80 !shadow-panel"
          nodeColor={(node) => categoryColor((node.data.item as Item).category)}
        />
        <Controls className="!bottom-20 !left-5 !rounded-lg !border !border-white/70 !bg-white/85 !shadow-panel" />
      </ReactFlow>
    </div>
  );
}

function categoryColor(category: Item['category']) {
  return {
    Company: '#2f6f58',
    Family: '#c9695d',
    Personal: '#7ea8bd',
    'Top Priority': '#b08d57',
  }[category];
}
