const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface Song {
  id: string;
  title: string;
  artist: string;
  mood: string;
  duration: string;
  youtubeUrl: string;
  thumbnail: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
  error?: string;
}

class SongsService {
  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getAllSongs(): Promise<Song[]> {
    try {
      const response: ApiResponse<Song[]> = await this.fetchWithAuth('/api/songs');
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch songs');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching songs:', error);
      throw error;
    }
  }

  async getSongsByMood(mood: string, limit: number = 10): Promise<Song[]> {
    try {
      const response: ApiResponse<Song[]> = await this.fetchWithAuth(`/api/songs/mood/${mood}?limit=${limit}`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch songs by mood');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching songs by mood:', error);
      throw error;
    }
  }

  async searchSongs(query: string, mood?: string, limit: number = 20): Promise<Song[]> {
    try {
      const params = new URLSearchParams({
        q: query,
        limit: limit.toString(),
      });
      
      if (mood && mood !== 'All') {
        params.append('mood', mood);
      }
      
      const response: ApiResponse<Song[]> = await this.fetchWithAuth(`/api/songs/search?${params}`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to search songs');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error searching songs:', error);
      throw error;
    }
  }
}

export const songsService = new SongsService();