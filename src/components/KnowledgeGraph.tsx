'use client';

import React, { useState } from 'react';
import { Network, Search, ZoomIn, ZoomOut, Layers, ExternalLink, Sparkles, Filter } from 'lucide-react';
import { GraphNode, GraphEdge } from '@/types';

const SAMPLE_NODES: GraphNode[] = [
  { id: 'node-1', project_id: 'proj-1', label: 'Transformer Architecture', node_type: 'technology', description: 'Sequence transduction model relying entirely on self-attention.', importance_score: 2.0, created_at: '' },
  { id: 'node-2', project_id: 'proj-1', label: 'Self-Attention Mechanism', node_type: 'concept', description: 'Mechanism relating different positions of a single sequence.', importance_score: 1.8, created_at: '' },
  { id: 'node-3', project_id: 'proj-1', label: 'Multi-Head Attention', node_type: 'concept', description: 'Jointly attends to information from different representation subspaces.', importance_score: 1.5, created_at: '' },
  { id: 'node-4', project_id: 'proj-1', label: 'Quantum Neural Networks', node_type: 'technology', description: 'Hybrid quantum-classical optimization network.', importance_score: 1.7, created_at: '' },
  { id: 'node-5', project_id: 'proj-1', label: 'Hilbert Space Mapping', node_type: 'topic', description: 'High-dimensional feature space projection for quantum states.', importance_score: 1.2, created_at: '' },
];

const SAMPLE_EDGES: GraphEdge[] = [
  { id: 'edge-1', project_id: 'proj-1', source_node_id: 'node-1', target_node_id: 'node-2', relationship_type: 'depends_on', evidence_text: 'The Transformer architecture relies solely on self-attention mechanisms.', created_at: '' },
  { id: 'edge-2', project_id: 'proj-1', source_node_id: 'node-2', target_node_id: 'node-3', relationship_type: 'is_example_of', evidence_text: 'Multi-Head Attention extends simple dot-product self-attention.', created_at: '' },
  { id: 'edge-3', project_id: 'proj-1', source_node_id: 'node-4', target_node_id: 'node-5', relationship_type: 'supports', evidence_text: 'QNNs map classical vectors into high-dimensional Hilbert space.', created_at: '' },
];

interface KnowledgeGraphProps {
  onSelectNodeDocument?: (docId: string) => void;
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ onSelectNodeDocument }) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(SAMPLE_NODES[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [zoom, setZoom] = useState(100);

  const filteredNodes = SAMPLE_NODES.filter((n) =>
    n.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-full bg-gray-950 border border-white/10 rounded-2xl glass-panel overflow-hidden">
      {/* Canvas Node Graph Area */}
      <div className="flex-1 flex flex-col relative bg-black/60 overflow-hidden">
        {/* Graph Controls Bar */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-3 bg-gray-900/90 border border-white/10 p-2 rounded-2xl backdrop-blur-md">
          <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-xl text-xs font-bold">
            <Network className="w-4 h-4 text-indigo-400" /> Interactive Knowledge Graph
          </div>
          <div className="h-4 w-px bg-white/10"></div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Find concept..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-950 border border-white/10 rounded-xl pl-8 pr-3 py-1 text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <button onClick={() => setZoom((z) => Math.max(50, z - 10))} className="p-1 hover:text-white">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[10px]">{zoom}%</span>
            <button onClick={() => setZoom((z) => Math.min(180, z + 10))} className="p-1 hover:text-white">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Visual Canvas Visualization (Interactive Node Cloud) */}
        <div
          className="flex-1 flex items-center justify-center p-12 relative transition-all"
          style={{ transform: `scale(${zoom / 100})` }}
        >
          {/* Edge Connection SVG Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-indigo-500/30 stroke-2">
            <line x1="30%" y1="40%" x2="50%" y2="30%" strokeDasharray="4" />
            <line x1="50%" y1="30%" x2="70%" y2="45%" strokeDasharray="4" />
            <line x1="35%" y1="70%" x2="65%" y2="70%" strokeDasharray="4" />
          </svg>

          {/* Render Graph Nodes */}
          <div className="relative w-full h-full max-w-3xl flex items-center justify-center">
            {filteredNodes.map((node, index) => {
              const isSelected = selectedNode?.id === node.id;
              // Positioning offsets for demo graph layout
              const positions = [
                { top: '35%', left: '25%' },
                { top: '25%', left: '48%' },
                { top: '42%', left: '68%' },
                { top: '65%', left: '30%' },
                { top: '68%', left: '62%' },
              ];
              const pos = positions[index % positions.length];

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`absolute p-4 rounded-2xl glass-card cursor-pointer border transition-all ${
                    isSelected
                      ? 'bg-indigo-600/30 border-indigo-400 glow-indigo text-white scale-110'
                      : 'border-white/10 hover:border-indigo-500/40 text-gray-300'
                  }`}
                  style={{ top: pos.top, left: pos.left }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-400 animate-pulse"></div>
                    <span className="text-xs font-bold whitespace-nowrap">{node.label}</span>
                  </div>
                  <span className="text-[9px] font-mono text-indigo-300 uppercase tracking-wider block mt-1">
                    {node.node_type}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Node Inspector Panel */}
      <div className="w-80 border-l border-white/10 p-5 space-y-5 bg-gray-900/80 overflow-y-auto">
        {selectedNode ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-indigo-400 font-semibold tracking-wider">
                Concept Inspector
              </span>
              <h3 className="text-base font-bold text-white">{selectedNode.label}</h3>
              <span className="inline-block px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] uppercase font-mono font-semibold">
                {selectedNode.node_type}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
              <span className="text-xs font-semibold text-gray-300">Description</span>
              <p className="text-xs text-gray-400 leading-relaxed">{selectedNode.description}</p>
            </div>

            {/* Provenance Evidence */}
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Source Evidence & Relationships
              </span>
              {SAMPLE_EDGES.filter(
                (e) => e.source_node_id === selectedNode.id || e.target_node_id === selectedNode.id
              ).map((edge) => (
                <div key={edge.id} className="p-3 rounded-xl glass-card space-y-1 text-xs">
                  <div className="flex items-center justify-between text-indigo-300 font-semibold">
                    <span>Relationship:</span>
                    <span className="font-mono text-[10px] uppercase">{edge.relationship_type}</span>
                  </div>
                  <p className="text-gray-400 italic">"{edge.evidence_text}"</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => onSelectNodeDocument?.('doc-1')}
              className="w-full py-2 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-medium flex items-center justify-center gap-2 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open Source Document
            </button>
          </div>
        ) : (
          <p className="text-xs text-gray-500 italic">Click any graph node to inspect details.</p>
        )}
      </div>
    </div>
  );
};
