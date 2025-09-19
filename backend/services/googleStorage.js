import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

class GoogleStorageService {
  constructor() {
    try {
      // Check if all required environment variables are set
      if (!process.env.GOOGLE_PROJECT_ID || 
          !process.env.GCS_BUCKET_NAME || 
          !process.env.GOOGLE_APPLICATION_CREDENTIALS ||
          process.env.GOOGLE_PROJECT_ID === 'placeholder_project_id') {
        console.warn('Google Cloud Storage not configured. File operations will be disabled.');
        this.isConfigured = false;
        return;
      }

      this.storage = new Storage({
        projectId: process.env.GOOGLE_PROJECT_ID,
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      });
      this.bucketName = process.env.GCS_BUCKET_NAME;
      this.bucket = this.storage.bucket(this.bucketName);
      this.isConfigured = true;
    } catch (error) {
      console.error('Failed to initialize Google Cloud Storage:', error.message);
      this.isConfigured = false;
    }
  }

  _checkConfiguration() {
    if (!this.isConfigured) {
      throw new Error('Google Cloud Storage is not properly configured. Please check your environment variables.');
    }
  }

  async uploadFile(file, userId, folder = 'uploads') {
    this._checkConfiguration();
    try {
      const fileExtension = path.extname(file.originalname);
      const fileName = `${folder}/${userId}/${uuidv4()}${fileExtension}`;
      
      const fileUpload = this.bucket.file(fileName);
      
      const stream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.mimetype,
          metadata: {
            uploadedBy: userId,
            originalName: file.originalname,
            uploadedAt: new Date().toISOString()
          }
        },
        resumable: false
      });

      return new Promise((resolve, reject) => {
        stream.on('error', (error) => {
          reject(new Error(`Upload failed: ${error.message}`));
        });

        stream.on('finish', async () => {
          try {
            // Make the file publicly accessible (optional)
            // await fileUpload.makePublic();
            
            const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${fileName}`;
            
            resolve({
              fileName,
              publicUrl,
              size: file.size,
              contentType: file.mimetype
            });
          } catch (error) {
            reject(error);
          }
        });

        stream.end(file.buffer);
      });
    } catch (error) {
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  async deleteFile(fileName) {
    this._checkConfiguration();
    try {
      await this.bucket.file(fileName).delete();
      return { success: true, message: 'File deleted successfully' };
    } catch (error) {
      throw new Error(`File deletion failed: ${error.message}`);
    }
  }

  async getSignedUrl(fileName, expirationMinutes = 60) {
    this._checkConfiguration();
    try {
      const options = {
        version: 'v4',
        action: 'read',
        expires: Date.now() + expirationMinutes * 60 * 1000,
      };

      const [url] = await this.bucket.file(fileName).getSignedUrl(options);
      return url;
    } catch (error) {
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  async listUserFiles(userId, folder = 'uploads') {
    this._checkConfiguration();
    try {
      const prefix = `${folder}/${userId}/`;
      const [files] = await this.bucket.getFiles({ prefix });
      
      return files.map(file => ({
        name: file.name,
        size: file.metadata.size,
        contentType: file.metadata.contentType,
        created: file.metadata.timeCreated,
        updated: file.metadata.updated
      }));
    } catch (error) {
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  async saveUserData(userId, data) {
    this._checkConfiguration();
    try {
      const fileName = `users/${userId}/profile.json`;
      const file = this.bucket.file(fileName);
      
      await file.save(JSON.stringify(data, null, 2), {
        metadata: {
          contentType: 'application/json',
          metadata: {
            updatedAt: new Date().toISOString()
          }
        }
      });
      
      return { success: true, fileName };
    } catch (error) {
      throw new Error(`Failed to save user data: ${error.message}`);
    }
  }

  async getUserData(userId) {
    this._checkConfiguration();
    try {
      const fileName = `users/${userId}/profile.json`;
      const file = this.bucket.file(fileName);
      
      const [exists] = await file.exists();
      if (!exists) {
        return null;
      }
      
      const [contents] = await file.download();
      return JSON.parse(contents.toString());
    } catch (error) {
      throw new Error(`Failed to get user data: ${error.message}`);
    }
  }
}

export default new GoogleStorageService();
