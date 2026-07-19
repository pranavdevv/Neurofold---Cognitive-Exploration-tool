import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useStore from '../store/useStore';
import { Plus, FolderTree, Upload, Trash2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Dashboard = () => {
  const { trees, setTrees } = useStore();
  const navigate = useNavigate();
  const [newTitle, setNewTitle] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchTrees = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/trees`);
        setTrees(res.data);
      } catch (err) {
        console.error('Failed to fetch trees', err);
      }
    };
    fetchTrees();
  }, [setTrees]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    setIsCreating(true);
    try {
      const res = await axios.post(`${API_URL}/api/trees`, {
        title: newTitle,
        rootQuestion: newQuestion
      });
      navigate(`/canvas/${res.data.tree._id}`);
    } catch (err) {
      console.error('Failed to create tree', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const importedData = JSON.parse(evt.target.result);
        const res = await axios.post(`${API_URL}/api/trees/import`, importedData);
        navigate(`/canvas/${res.data.tree._id}`);
      } catch (err) {
        console.error('Failed to import tree', err);
        alert('Invalid .nbts file format');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="zen-container">
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 300, letterSpacing: '-0.02em' }}>NeuroFold</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Recursive Cognitive Exploration</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="zen-card">
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={20} /> New Exploration
            </h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input 
                type="text" 
                className="zen-input" 
                placeholder="Title (optional)" 
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <textarea 
                className="zen-input" 
                placeholder="Enter your root question or concept..." 
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                rows={4}
                required
              />
              <button type="submit" className="zen-button" disabled={isCreating} style={{ marginTop: '0.5rem', opacity: isCreating ? 0.7 : 1 }}>
                {isCreating ? 'Materializing...' : 'Materialize Root Node'}
              </button>
            </form>
          </div>

          <div className="zen-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
            <Upload size={32} style={{ marginBottom: '1rem', color: '#888' }} />
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', textAlign: 'center' }}>
              Import an existing mind map (.nbts)
            </span>
            <label className="zen-button" style={{ fontSize: '0.85rem', cursor: 'pointer', textAlign: 'center' }}>
              Choose File
              <input 
                type="file" 
                accept=".nbts" 
                onChange={handleImport} 
                style={{ display: 'none' }} 
              />
            </label>
          </div>
        </div>

        <div>
          <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FolderTree size={20} /> Your Trees
          </h2>
          {trees.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', padding: '2rem', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
              No trees found. Start an exploration.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {trees.map(tree => (
                <div 
                  key={tree._id} 
                  className="zen-card" 
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div style={{ cursor: 'pointer', flex: 1 }} onClick={() => navigate(`/canvas/${tree._id}`)}>
                    <h3 style={{ fontSize: '1.1rem' }}>{tree.title}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {new Date(tree.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => navigate(`/canvas/${tree._id}`)}>&rarr;</div>
                    <button 
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (confirm('Are you sure you want to delete this tree?')) {
                          try {
                            await axios.delete(`${API_URL}/api/trees/${tree._id}`);
                            setTrees(trees.filter(t => t._id !== tree._id));
                          } catch (err) { console.error(err); }
                        }
                      }}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.5rem' }}
                      title="Delete Tree"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
