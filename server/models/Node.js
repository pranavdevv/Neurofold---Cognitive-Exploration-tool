import mongoose from 'mongoose';

const nodeSchema = new mongoose.Schema({
  treeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tree',
    required: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Node',
    default: null
  },
  label: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['Root', 'Fracture', 'Mirror', 'Bridge', 'Paradox', 'Synthesis', 'Explore'],
    default: 'Root'
  },
  ancestryPath: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Node'
  }],
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
  },
  isExpanded: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model('Node', nodeSchema);
