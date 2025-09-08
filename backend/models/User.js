import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  picture: {
    type: String,
    trim: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  preferences: {
    favoriteGenre: {
      type: String,
      default: ''
    },
    preferredMood: {
      type: String,
      default: 'chill'
    }
  },
  customData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Automatically manage createdAt and updatedAt
});

// Index for faster queries
userSchema.index({ createdAt: -1 });

// Pre-save middleware to update updatedAt
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to find user by Google ID
userSchema.statics.findByGoogleId = function(googleId) {
  return this.findOne({ googleId });
};

// Instance method to set custom data
userSchema.methods.setCustomData = function(key, value) {
  if (!this.customData) {
    this.customData = {};
  }
  this.customData[key] = value;
  return this.save();
};

// Instance method to get custom data
userSchema.methods.getCustomData = function(key) {
  return this.customData?.[key] || null;
};

// Instance method to get all custom data
userSchema.methods.getAllCustomData = function() {
  return this.customData || {};
};

const User = mongoose.model('User', userSchema);

export default User;
