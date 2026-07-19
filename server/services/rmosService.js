import crypto from 'crypto';
import CacheNode from '../models/CacheNode.js';
import { generateCompletion, getPromptForOperator } from './aiService.js';

// Simple in-memory Bloom filter mock for high-speed checks
const bloomFilter = new Set();

const generateKeyHash = (question, operator, ancestryPath) => {
  const pathString = ancestryPath.join(',');
  const raw = `${question}|${operator}|${pathString}`;
  return crypto.createHash('sha256').update(raw).digest('hex');
};

export const processNode = async (question, operator, ancestryPath, context, bypassCache = false) => {
  const keyHash = generateKeyHash(question, operator, ancestryPath);
  
  // Cache Trap Mitigations: Trap A (Bypass/Entropy) & Trap B (Bloom Filter / DB Fallback)
  if (!bypassCache) {
    if (bloomFilter.has(keyHash)) {
      const cached = await CacheNode.findOne({ keyHash });
      if (cached) {
        console.log("RMOS: Cache Hit (Trap B avoided)");
        return { answer: cached.answer, source: 'cache', cacheId: cached._id };
      }
    } else {
      // Fallback DB check just in case Bloom filter missed it
      const cached = await CacheNode.findOne({ keyHash });
      if (cached) {
        bloomFilter.add(keyHash);
        return { answer: cached.answer, source: 'cache', cacheId: cached._id };
      }
    }
  }

  console.log("RMOS: Executing AI Pipeline (Propose-Solve-Aggregate-Refine)");
  
  // Build Prompt
  const prompt = getPromptForOperator(operator, question, context);
  
  // Call AI (Simulating the 4-stage pipeline with a single comprehensive prompt for now to save latency, 
  // but conceptually RMOS processes it)
  const answer = await generateCompletion(prompt);
  
  // Save to Cache
  const newCache = new CacheNode({
    keyHash,
    question,
    answer,
    sourceLens: operator
  });
  await newCache.save();
  bloomFilter.add(keyHash);

  return { answer, source: 'ai', cacheId: newCache._id };
};
