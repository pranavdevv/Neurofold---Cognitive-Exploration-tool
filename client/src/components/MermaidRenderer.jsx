import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'loose',
  flowchart: { useMaxWidth: true, htmlLabels: true }
});

const MermaidRenderer = ({ chart }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && chart) {
      ref.current.innerHTML = chart;
      ref.current.removeAttribute('data-processed');
      try {
        mermaid.run({
          nodes: [ref.current]
        });
      } catch (err) {
        console.error("Mermaid parsing error:", err);
      }
    }
  }, [chart]);

  return (
    <div 
      ref={ref} 
      className="mermaid" 
      style={{ display: 'flex', justifyContent: 'center', overflowX: 'auto', background: '#fafafa', padding: '1rem', borderRadius: '8px' }}
    />
  );
};

export default MermaidRenderer;
