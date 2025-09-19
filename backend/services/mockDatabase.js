import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';
import validator from 'validator';

class MockDatabase {
  constructor() {
    this.dataFile = path.join(process.cwd(), 'mock-users.json');
    this.users = [];
    this.isLoaded = false;
  }

  async connect() {
    try {
      await this.loadUsers();
      console.log('Connected to mock database successfully');
      return true;
    } catch (error) {
      console.error('Mock database initialization failed:', error);
      throw error;
    }
  }

  async loadUsers() {
    try {
      const data = await fs.readFile(this.dataFile, 'utf-8');
      this.users = JSON.parse(data);
    } catch (error) {
      // File doesn't exist, start with empty array
      this.users = [];
    }
    this.isLoaded = true;
  }

  async saveUsers() {
    await fs.writeFile(this.dataFile, JSON.stringify(this.users, null, 2));
  }

  generateId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  async findByEmail(email) {
    if (!this.isLoaded) await this.loadUsers();
    return this.users.find(user => user.email === email.toLowerCase());
  }

  async findByGoogleId(googleId) {
    if (!this.isLoaded) await this.loadUsers();
    return this.users.find(user => user.googleId === googleId);
  }

  async findByFirebaseUID(firebaseUID) {
    if (!this.isLoaded) await this.loadUsers();
    return this.users.find(user => user.firebaseUID === firebaseUID);
  }

  async findByUsername(username) {
    if (!this.isLoaded) await this.loadUsers();
    return this.users.find(user => user.username === username);
  }

  async findById(id) {
    if (!this.isLoaded) await this.loadUsers();
    return this.users.find(user => user.id === id || user._id === id);
  }

  async createUser(userData) {
    if (!this.isLoaded) await this.loadUsers();
    
    const user = {
      _id: this.generateId(),
      id: this.generateId(),
      ...userData,
      email: userData.email.toLowerCase(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    // Hash password if provided
    if (userData.password) {
      const salt = await bcrypt.genSalt(12);
      user.password = await bcrypt.hash(userData.password, salt);
    }

    this.users.push(user);
    await this.saveUsers();
    return user;
  }

  async updateUser(id, updates) {
    if (!this.isLoaded) await this.loadUsers();
    
    const userIndex = this.users.findIndex(user => user.id === id || user._id === id);
    if (userIndex === -1) return null;

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await this.saveUsers();
    return this.users[userIndex];
  }

  async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

// Create mock User model that mimics Mongoose
class MockUser {
  constructor(data) {
    Object.assign(this, data);
  }

  static async findByEmail(email) {
    return mockDb.findByEmail(email);
  }

  static async findByGoogleId(googleId) {
    return mockDb.findByGoogleId(googleId);
  }

  static async findById(id) {
    return mockDb.findById(id);
  }

  async save() {
    if (this._id || this.id) {
      // Update existing user
      const updated = await mockDb.updateUser(this._id || this.id, this);
      Object.assign(this, updated);
    } else {
      // Create new user
      const created = await mockDb.createUser(this);
      Object.assign(this, created);
    }
    return this;
  }

  async comparePassword(plainPassword) {
    if (!this.password) return false;
    return mockDb.comparePassword(plainPassword, this.password);
  }

  getPublicProfile() {
    return {
      id: this._id || this.id,
      googleId: this.googleId,
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
  }
}

const mockDb = new MockDatabase();

export { MockUser as User, mockDb };
export default { connect: () => mockDb.connect() };
