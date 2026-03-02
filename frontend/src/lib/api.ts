const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private accessToken: string | null = null;

  setToken(token: string) {
    this.accessToken = token;
  }

  clearToken() {
    this.accessToken = null;
  }

  getToken(): string | null {
    return this.accessToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include', // Send cookies (refresh token)
    });

    if (response.status === 401) {
      // Try to refresh the token
      const refreshed = await this.refreshToken();
      if (refreshed) {
        // Retry the original request with new token
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        const retryResponse = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers,
          credentials: 'include',
        });
        return retryResponse.json();
      }
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) return false;

      const data = await response.json();
      this.accessToken = data.accessToken;
      return true;
    } catch {
      return false;
    }
  }

  // Auth endpoints
  async getMe() {
    return this.request<any>('/auth/me');
  }

  // User endpoints
  async updateProfile(data: any) {
    return this.request<any>('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async searchUsers(query: string) {
    return this.request<any[]>(`/users/search?q=${query}`);
  }

  // Room endpoints
  async getRooms(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/rooms${query}`);
  }

  async getRoom(id: string) {
    return this.request<any>(`/rooms/${id}`);
  }

  async createRoom(data: any) {
    return this.request<any>('/rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRoom(id: string, data: any) {
    return this.request<any>(`/rooms/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteRoom(id: string) {
    return this.request<any>(`/rooms/${id}`, {
      method: 'DELETE',
    });
  }

  async joinRoom(id: string, password?: string) {
    return this.request<any>(`/rooms/${id}/join`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  async leaveRoom(id: string) {
    return this.request<any>(`/rooms/${id}/leave`, {
      method: 'POST',
    });
  }

  // Leaderboard endpoints
  async getLeaderboard(period: string = 'weekly', limit: number = 10) {
    return this.request<any[]>(`/leaderboard?period=${period}&limit=${limit}`);
  }

  async getMyRank(period: string = 'weekly') {
    return this.request<any>(`/leaderboard/me?period=${period}`);
  }
}

export const api = new ApiClient();