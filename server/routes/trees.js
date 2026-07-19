import express from 'express';
import Tree from '../models/Tree.js';
import Node from '../models/Node.js';
import { processNode } from '../services/rmosService.js';

const router = express.Router();

// Get all trees (for dashboard)
router.get('/', async (req, res) => {
  try {
    const trees = await Tree.find().sort({ updatedAt: -1 });
    res.json(trees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new tree
router.post('/', async (req, res) => {
  try {
    const { title, rootQuestion } = req.body;
    const tree = new Tree({ title: title || rootQuestion.substring(0, 50) });
    await tree.save();

    // Process the root question through the AI
    const rmosResult = await processNode(rootQuestion, 'Explore', [], '', false);

    const rootNode = new Node({
      treeId: tree._id,
      label: rootQuestion,
      content: rmosResult.answer,
      type: 'Root',
      ancestryPath: []
    });
    await rootNode.save();

    tree.rootNodeId = rootNode._id;
    await tree.save();

    res.status(201).json({ tree, rootNode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get tree by id with all its nodes
router.get('/:id', async (req, res) => {
  try {
    const tree = await Tree.findById(req.params.id);
    if (!tree) return res.status(404).json({ error: 'Tree not found' });
    
    const nodes = await Node.find({ treeId: tree._id });
    res.json({ tree, nodes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete tree
router.delete('/:id', async (req, res) => {
  try {
    const tree = await Tree.findByIdAndDelete(req.params.id);
    if (!tree) return res.status(404).json({ error: 'Tree not found' });
    
    await Node.deleteMany({ treeId: tree._id });
    res.json({ message: 'Tree deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Import tree
router.post('/import', async (req, res) => {
  try {
    const { tree, nodes } = req.body;
    
    const newTree = new Tree({ title: tree.title });
    await newTree.save();

    // Map old Node IDs to new Node IDs to rebuild parent/child links
    const idMap = {};
    
    // First pass: Create nodes with temporary parent/child relationships
    for (const node of nodes) {
      const newNode = new Node({
        treeId: newTree._id,
        label: node.label,
        content: node.content,
        type: node.type,
        position: node.position,
        isExpanded: node.isExpanded,
        ancestryPath: []
      });
      await newNode.save();
      idMap[node._id] = newNode._id;

      if (node.type === 'Root') {
        newTree.rootNodeId = newNode._id;
      }
    }
    await newTree.save();

    // Second pass: Update parentId and ancestryPath with mapped IDs
    for (const node of nodes) {
      if (node.parentId || node.ancestryPath.length > 0) {
        const dbNode = await Node.findById(idMap[node._id]);
        if (node.parentId) {
          dbNode.parentId = idMap[node.parentId];
        }
        dbNode.ancestryPath = node.ancestryPath.map(oldId => idMap[oldId]).filter(Boolean);
        await dbNode.save();
      }
    }

    res.status(201).json({ tree: newTree });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
