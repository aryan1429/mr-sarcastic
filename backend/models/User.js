import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';

const userSchema = new mongoose.Schema({
  // For Google OAuth users (legacy)
  googleId: {
    type: String,
    sparse: true, // Allows null values and ensures uniqueness only for non-null values
    index: true
  },
  // For Firebase users
  firebaseUID: {
    type: String,
    sparse: true,
    index: true
  },
  // For email/password users
  username: {
    type: String,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    minlength: 8,
    select: false // Don't include password in queries by default
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
  authProvider: {
    type: String,
    enum: ['google', 'email'],
    required: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
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
  }
}, {
  timestamps: true // Automatically manage createdAt and updatedAt
});

// Index for faster queries
userSchema.index({ createdAt: -1 });
userSchema.index({ email: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it has been modified and exists
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Static method to find user by Google ID
userSchema.statics.findByGoogleId = function(googleId) {
  return this.findOne({ googleId });
};

// Static method to find user by Firebase UID
userSchema.statics.findByFirebaseUID = function(firebaseUID) {
  return this.findOne({ firebaseUID });
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find user by username
userSchema.statics.findByUsername = function(username) {
  return this.findOne({ username });
};

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) {
    return false; // User might be Google OAuth user without password
  }
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get public profile (excludes sensitive data)
userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    googleId: this.googleId,
    firebaseUID: this.firebaseUID,
    username: this.username,
    email: this.email,
    name: this.name,
    picture: this.picture,
    emailVerified: this.emailVerified,
    authProvider: this.authProvider,
    preferences: this.preferences,
    createdAt: this.createdAt,
    lastLogin: this.lastLogin
  };
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
