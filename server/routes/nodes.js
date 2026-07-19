import express from 'express';
import Node from '../models/Node.js';
import CacheNode from '../models/CacheNode.js';
import { processNode } from '../services/rmosService.js';

const router = express.Router();

// ⚠️ Named routes MUST come before /:id wildcard routes in Express

// Expand a node using RMOS (Fracture / Mirror / etc.)
router.post('/expand', async (req, res) => {
  try {
    const { parentId, operator, newLabel, bypassCache } = req.body;
    
    const parentNode = await Node.findById(parentId);
    if (!parentNode) return res.status(404).json({ error: 'Parent node not found' });

    // Gather ancestry for cache hash and context
    const ancestryPath = [...parentNode.ancestryPath, parentNode._id];
    const context = parentNode.content;

    // Run RMOS Pipeline
    const rmosResult = await processNode(newLabel, operator, ancestryPath, context, bypassCache);

    // Create New Node
    const newNode = new Node({
      treeId: parentNode.treeId,
      parentId: parentNode._id,
      label: newLabel,
      content: rmosResult.answer,
      type: operator,
      ancestryPath: ancestryPath,
      position: { 
        x: parentNode.position.x + (Math.random() * 200 - 100), 
        y: parentNode.position.y + 150 
      }
    });

    await newNode.save();

    res.status(201).json({ node: newNode, source: rmosResult.source });
  } catch (err) {
    console.error('Expand error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Upvote or Downvote a node's cache entry
router.post('/:id/vote', async (req, res) => {
  try {
    const { direction } = req.body; // 'up' or 'down'
    const node = await Node.findById(req.params.id);
    if (!node) return res.status(404).json({ error: 'Node not found' });

    const pathString = node.ancestryPath.join(',');
    const raw = `${node.label}|${node.type}|${pathString}`;
    const crypto = await import('crypto');
    const keyHash = crypto.createHash('sha256').update(raw).digest('hex');

    const cacheNode = await CacheNode.findOne({ keyHash });
    if (!cacheNode) return res.status(404).json({ error: 'Cache entry not found' });

    if (direction === 'up') {
      cacheNode.upvotes += 1;
    } else {
      cacheNode.downvotes += 1;
    }
    await cacheNode.save();

    res.json({ message: 'Vote recorded', upvotes: cacheNode.upvotes, downvotes: cacheNode.downvotes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Regenerate node content (bypass cache & update global cache if voted better)
router.post('/:id/regenerate', async (req, res) => {
  try {
    const node = await Node.findById(req.params.id);
    if (!node) return res.status(404).json({ error: 'Node not found' });

    const rmosResult = await processNode(node.label, node.type, node.ancestryPath, node.content, true);

    node.content = rmosResult.answer;
    await node.save();

    res.json({ node });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update node position
router.put('/:id/position', async (req, res) => {
  try {
    const { position } = req.body;
    const node = await Node.findByIdAndUpdate(req.params.id, { position }, { new: true });
    res.json(node);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get node details — wildcard LAST
router.get('/:id', async (req, res) => {
  try {
    const node = await Node.findById(req.params.id);
    if (!node) return res.status(404).json({ error: 'Node not found' });
    res.json(node);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
