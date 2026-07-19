import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Canvas from '../components/Canvas';
import MermaidRenderer from '../components/MermaidRenderer';
import useStore from '../store/useStore';
import { ArrowLeft, GitBranch, Minimize2, Loader2, Eye, X, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CanvasPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { nodes, edges, setNodes, setEdges, setCurrentTree, selectedNode, setSelectedNode, addNodes, addEdges, updateNode } = useStore();
  const [expandLabel, setExpandLabel] = useState('');
  const [isExpanding, setIsExpanding] = useState(false);
  const [bypassCache, setBypassCache] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [votes, setVotes] = useState({ up: 0, down: 0 });
  const [isMirrorOpen, setIsMirrorOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchTreeData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/trees/${id}`);
        setCurrentTree(res.data.tree);
        
        const flowNodes = res.data.nodes.map(n => ({
          id: n._id,
          type: 'custom',
          position: n.position || { x: 0, y: 0 },
          data: {
            dbId: n._id,
            label: n.label,
            content: n.content,
            type: n.type,
            ancestryPath: n.ancestryPath
          }
        }));

        const flowEdges = res.data.nodes
          .filter(n => n.parentId)
          .map(n => ({
            id: `e${n.parentId}-${n._id}`,
            source: n.parentId,
            target: n._id,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#999', strokeWidth: 2 }
          }));

        setNodes(flowNodes);
        setEdges(flowEdges);
      } catch (err) {
        console.error('Failed to fetch tree data', err);
      }
    };
    fetchTreeData();
  }, [id, setCurrentTree, setNodes, setEdges]);

  // Handle selected node details changing (like votes)
  useEffect(() => {
    if (selectedNode) {
      setVotes({ up: 0, down: 0 });
    }
  }, [selectedNode]);

  const handleExpand = async (operator) => {
    if (!selectedNode || !expandLabel.trim()) return;
    
    setIsExpanding(true);
    
    // Split by commas for batch processing (e.g. "Rhythm, Melody, Harmony")
    const labels = expandLabel.split(',').map(l => l.trim()).filter(l => l.length > 0);
    
    try {
      const newNodes = [];
      const newEdgesList = [];
      
      // Process in parallel using Promise.all
      const promises = labels.map(label => 
        axios.post(`${API_URL}/api/nodes/expand`, {
          parentId: selectedNode.data.dbId,
          operator,
          newLabel: label,
          bypassCache: bypassCache
        })
      );
      
      const responses = await Promise.all(promises);
      
      responses.forEach(res => {
        const n = res.data.node;
        newNodes.push({
          id: n._id,
          type: 'custom',
          position: n.position,
          data: {
            dbId: n._id,
            label: n.label,
            content: n.content,
            type: n.type,
            ancestryPath: n.ancestryPath
          }
        });
        newEdgesList.push({
          id: `e${n.parentId}-${n._id}`,
          source: n.parentId,
          target: n._id,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#999', strokeWidth: 2 }
        });
      });

      addNodes(newNodes);
      addEdges(newEdgesList);
      setExpandLabel('');
      
    } catch (err) {
      console.error('Expand failed', err);
    } finally {
      setIsExpanding(false);
    }
  };

  const handleVote = async (direction) => {
    if (!selectedNode) return;
    try {
      const res = await axios.post(`${API_URL}/api/nodes/${selectedNode.data.dbId}/vote`, {
        direction
      });
      setVotes({ up: res.data.upvotes, down: res.data.downvotes });
    } catch (err) {
      console.error('Failed to vote', err);
    }
  };

  const handleRegenerate = async () => {
    if (!selectedNode) return;
    setIsRegenerating(true);
    try {
      const res = await axios.post(`${API_URL}/api/nodes/${selectedNode.data.dbId}/regenerate`);
      const updated = res.data.node;
      updateNode(selectedNode.id, {
        data: {
          ...selectedNode.data,
          content: updated.content
        }
      });
      setSelectedNode({
        ...selectedNode,
        data: {
          ...selectedNode.data,
          content: updated.content
        }
      });
    } catch (err) {
      console.error('Failed to regenerate', err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const generateMermaidChart = () => {
    let chart = "graph TD\n";
    nodes.forEach(n => {
      const label = n.data.label.replace(/"/g, '\\"');
      chart += `  ${n.id}["${label}"]\n`;
    });
    edges.forEach(e => {
      chart += `  ${e.source} --> ${e.target}\n`;
    });
    return chart;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateMermaidChart());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const exportData = {
      tree: { title: useStore.getState().currentTree?.title || 'NeuroFold Exploration' },
      nodes: nodes.map(n => ({
        _id: n.id,
        label: n.data.label,
        content: n.data.content,
        type: n.data.type,
        position: n.position,
        parentId: edges.find(e => e.target === n.id)?.source || null,
        ancestryPath: n.data.ancestryPath || []
      }))
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${useStore.getState().currentTree?.title || 'tree'}.nbts`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10, display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', cursor: 'pointer', boxShadow: 'var(--node-shadow)' }}
          >
            <ArrowLeft size={16} /> Dashboard
          </button>
          
          <button 
            onClick={() => setIsMirrorOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', cursor: 'pointer', boxShadow: 'var(--node-shadow)' }}
          >
            <Eye size={16} /> Mirror Mode
          </button>

          <button 
            onClick={handleExport}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', cursor: 'pointer', boxShadow: 'var(--node-shadow)' }}
          >
            Export (.nbts)
          </button>
        </div>
        <Canvas treeId={id} />
      </div>

      <div style={{ width: '380px', background: 'white', borderLeft: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', boxShadow: '-5px 0 20px rgba(0,0,0,0.02)' }}>
        {selectedNode ? (
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)' }}>
                {selectedNode.data.type} Node
              </span>
              <button onClick={() => setSelectedNode(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <Minimize2 size={18} />
              </button>
            </div>
            
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', lineHeight: 1.3 }}>
              {selectedNode.data.label}
            </h2>
            
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, flex: 1, overflowY: 'auto', marginBottom: '1rem', paddingRight: '0.5rem' }}>
              <ReactMarkdown 
                components={{
                  p: ({node, ...props}) => <p style={{marginBottom: '1em'}} {...props} />,
                  ul: ({node, ...props}) => <ul style={{paddingLeft: '1.5em', marginBottom: '1em'}} {...props} />,
                  ol: ({node, ...props}) => <ol style={{paddingLeft: '1.5em', marginBottom: '1em'}} {...props} />,
                  li: ({node, ...props}) => <li style={{marginBottom: '0.5em'}} {...props} />,
                  strong: ({node, ...props}) => <strong style={{color: '#1a1a1a', fontWeight: 600}} {...props} />,
                }}
              >
                {selectedNode.data.content}
              </ReactMarkdown>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', alignItems: 'center' }}>
              <button onClick={() => handleVote('up')} className="zen-button" style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                &uarr; Upvote ({votes.up})
              </button>
              <button onClick={() => handleVote('down')} className="zen-button" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                &darr; Downvote ({votes.down})
              </button>
              <button onClick={handleRegenerate} disabled={isRegenerating} className="zen-button" style={{ background: '#f5f5f5', color: '#1a1a1a', border: '1px solid #e5e5e5', padding: '0.4rem 0.8rem', fontSize: '0.8rem', marginLeft: 'auto' }}>
                {isRegenerating ? 'Syncing...' : 'Regenerate'}
              </button>
            </div>

            <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#1a1a1a' }}>
                  Ask a Question
                </h3>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={bypassCache} 
                    onChange={(e) => setBypassCache(e.target.checked)} 
                  />
                  Bypass Cache
                </label>
              </div>

              <input 
                type="text" 
                className="zen-input" 
                placeholder="e.g. What is Melody? or Rhythm, Timbre, Tempo" 
                value={expandLabel}
                onChange={(e) => setExpandLabel(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleExpand('Explore'); }}
                style={{ marginBottom: '1rem' }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.4 }}>Tip: comma-separate multiple questions to generate several nodes at once.</p>

              {isExpanding ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem', color: 'var(--accent-color)' }}>
                  <span style={{ marginRight: '0.5rem' }}>⟳</span>
                  <span>Thinking...</span>
                </div>
              ) : (
                <button onClick={() => handleExpand('Explore')} className="zen-button" style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem' }}>Explore →</button>
              )}
            </div>
          </div>
        ) : (
          <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', textAlign: 'center' }}>
            <GitBranch size={48} strokeWidth={1} style={{ marginBottom: '1rem', color: '#ccc' }} />
            <p>Select a node on the canvas to view its details and explore further.</p>
          </div>
        )}
      </div>

      {/* Mirror Mode Modal */}
      {isMirrorOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div className="zen-card" style={{ width: '80%', maxHeight: '85%', overflowY: 'auto', background: 'white', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <button onClick={() => setIsMirrorOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <X size={24} />
            </button>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 300 }}>Cerebral Map: Mirror Mode</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Visualize the hierarchical fractal structure of your thoughts.</p>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button onClick={copyToClipboard} className="zen-button" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied' : 'Copy Mermaid Code'}
              </button>
            </div>

            <div style={{ flex: 1, minHeight: '300px' }}>
              <MermaidRenderer chart={generateMermaidChart()} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CanvasPage;
