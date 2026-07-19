import React, { useCallback, useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges
} from 'reactflow';
import 'reactflow/dist/style.css';
import useStore from '../store/useStore';
import CustomNode from './CustomNode';
import axios from 'axios';

const nodeTypes = {
  custom: CustomNode,
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Canvas = ({ treeId }) => {
  const { nodes, setNodes, edges, setEdges, setSelectedNode } = useStore();

  const onNodesChange = useCallback(
    (changes) => setNodes(applyNodeChanges(changes, nodes)),
    [nodes, setNodes]
  );
  
  const onEdgesChange = useCallback(
    (changes) => setEdges(applyEdgeChanges(changes, edges)),
    [edges, setEdges]
  );

  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node);
  }, [setSelectedNode]);

  const onNodeDragStop = useCallback(async (_, node) => {
    try {
      await axios.put(`${API_URL}/api/nodes/${node.data.dbId}/position`, {
        position: node.position
      });
    } catch (err) {
      console.error('Failed to save position', err);
    }
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', background: '#f5f5f5' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={1.5}
      >
        <Background color="#ccc" gap={16} />
        <Controls />
        <MiniMap 
          nodeColor={(n) => {
            if (n.data?.type === 'Root') return '#666';
            return '#3b82f6';
          }}
          maskColor="rgba(0, 0, 0, 0.7)"
          style={{ background: '#1a1a1a', border: '1px solid #333' }}
        />
      </ReactFlow>
    </div>
  );
};

export default Canvas;
