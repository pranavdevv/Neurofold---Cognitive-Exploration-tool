import { create } from 'zustand';

const useStore = create((set) => ({
  trees: [],
  setTrees: (trees) => set({ trees }),
  
  currentTree: null,
  setCurrentTree: (tree) => set({ currentTree: tree }),

  nodes: [],
  setNodes: (nodes) => set({ nodes }),
  addNodes: (newNodes) => set((state) => ({ nodes: [...state.nodes, ...newNodes] })),
  updateNode: (id, data) => set((state) => ({
    nodes: state.nodes.map(n => n.id === id ? { ...n, ...data } : n)
  })),

  edges: [],
  setEdges: (edges) => set({ edges }),
  addEdges: (newEdges) => set((state) => ({ edges: [...state.edges, ...newEdges] })),

  selectedNode: null,
  setSelectedNode: (node) => set({ selectedNode: node }),
}));

export default useStore;
