import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const CustomNode = ({ data, selected }) => {
  return (
    <div style={{
      background: 'var(--node-bg)',
      border: `1px solid ${selected ? 'var(--accent-color)' : 'var(--border-color)'}`,
      borderRadius: '12px',
      padding: '1.25rem',
      width: '280px',
      boxShadow: selected ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : 'var(--node-shadow)',
      backdropFilter: 'blur(10px)',
      transition: 'all 0.2s ease',
      transform: selected ? 'scale(1.02)' : 'scale(1)',
    }}>
      <Handle type="target" position={Position.Top} style={{ background: '#ccc', border: 'none' }} />
      
      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
        <span>{data.type}</span>
      </div>
      
      <div style={{ fontWeight: 500, fontSize: '0.95rem', marginBottom: '0.75rem', lineHeight: 1.4 }}>
        {data.label}
      </div>

      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, maxHeight: '100px', overflowY: 'auto' }}>
        {data.content}
      </div>

      <Handle type="source" position={Position.Bottom} style={{ background: '#ccc', border: 'none' }} />
    </div>
  );
};

export default memo(CustomNode);
