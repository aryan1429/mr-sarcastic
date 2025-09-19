import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  originalName: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true,
    unique: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  folder: {
    type: String,
    default: 'uploads'
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for faster queries
fileSchema.index({ userId: 1, uploadedAt: -1 });

// Static method to find files by user
fileSchema.statics.findByUserId = function(userId, folder = null) {
  const query = { userId };
  if (folder) {
    query.folder = folder;
  }
  return this.find(query).sort({ uploadedAt: -1 });
};

// Instance method to get file info
fileSchema.methods.getFileInfo = function() {
  return {
    id: this._id,
    userId: this.userId,
    originalName: this.originalName,
    filename: this.filename,
    mimetype: this.mimetype,
    size: this.size,
    path: this.path,
    folder: this.folder,
    uploadedAt: this.uploadedAt,
    metadata: this.metadata
  };
};

const File = mongoose.model('File', fileSchema);

export default File;
