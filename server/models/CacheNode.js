import mongoose from 'mongoose';

const cacheNodeSchema = new mongoose.Schema({
  keyHash: {
    type: String,
    required: true,
    unique: true
  },
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  sourceLens: {
    type: String,
    default: 'Default'
  },
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  regenerateCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export default mongoose.model('CacheNode', cacheNodeSchema);
