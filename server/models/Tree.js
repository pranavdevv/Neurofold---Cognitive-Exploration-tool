import mongoose from 'mongoose';

const treeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  rootNodeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Node'
  }
}, { timestamps: true });

export default mongoose.model('Tree', treeSchema);
