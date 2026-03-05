import axios, { AxiosInstance } from 'axios';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  Event,
  CreateEventRequest,
  UpdateEventRequest,
  Participation,
  Feedback,
  CreateFeedbackRequest,
  UserAccount,
  Notification,
} from '@store/../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

console.log('[API Service] API Base URL:', API_BASE_URL);

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.api.interceptors.request.use((config) => {
      const token = this.getAccessToken();
      console.log('[API Request] Path:', config.url, 'Token:', !!token);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle responses
    this.api.interceptors.response.use(
      (response) => {
        console.log('[API Response] Success:', response.status, response.config.url);
        return response;
      },
      (error) => {
        console.error('[API Error] Status:', error.response?.status, 'URL:', error.config?.url, 'Message:', error.message);
        
        if (error.response?.status === 401) {
          console.error('[API Error] 401 Unauthorized - token is invalid');
          // Don't redirect here, let the app handle it through auth state
          this.clearAuth();
        }
        return Promise.reject(error);
      }
    );
  }

  private clearAuth(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    // Don't use window.location - let React Router handle navigation
  }

  private getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  // Auth endpoints
  async register(data: RegisterRequest): Promise<UserAccount> {
    console.log('[API] Registering user:', data.email);
    const response = await this.api.post<UserAccount>('/auth/register', data);
    return response.data;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    console.log('[API] Login attempt for:', data.email);
    try {
      const response = await this.api.post<AuthResponse>('/auth/login', data);
      console.log('[API] Login successful, tokens received');
      localStorage.setItem('accessToken', response.data.tokens.accessToken);
      localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
      return response.data;
    } catch (error) {
      console.error('[API] Login failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      await this.api.post('/auth/logout', { refreshToken });
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const response = await this.api.post<AuthResponse>('/auth/refresh', { refreshToken });
    localStorage.setItem('accessToken', response.data.tokens.accessToken);
    localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
    return response.data;
  }

  async requestPasswordReset(email: string): Promise<void> {
    await this.api.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await this.api.post('/auth/reset-password', { token, newPassword });
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await this.api.post('/auth/change-password', { oldPassword, newPassword });
  }

  // User endpoints
  async getProfile(): Promise<UserAccount> {
    const response = await this.api.get<UserAccount>('/users/me');
    return response.data;
  }

  async updateProfile(data: Partial<UserAccount>): Promise<UserAccount> {
    const response = await this.api.put<UserAccount>('/users/me', data);
    return response.data;
  }

  async getAllUsers(): Promise<UserAccount[]> {
    const response = await this.api.get<UserAccount[]>('/users');
    return response.data;
  }

  async updateUserRole(userId: string, role: string): Promise<UserAccount> {
    const response = await this.api.put<UserAccount>(`/users/${userId}/role`, { role });
    return response.data;
  }

  async updateUserStatus(userId: string, status: 'ACTIVE' | 'INACTIVE'): Promise<UserAccount> {
    const response = await this.api.put<UserAccount>(`/users/${userId}/status`, { status });
    return response.data;
  }

  async deleteUser(userId: string): Promise<void> {
    await this.api.delete(`/users/${userId}`);
  }

  // Event endpoints
  async getAllEvents(upcoming?: boolean): Promise<Event[]> {
    const params = upcoming !== undefined ? { upcoming } : {};
    const response = await this.api.get<Event[]>('/events', { params });
    return response.data;
  }

  async getEventById(eventId: string): Promise<Event> {
    const response = await this.api.get<Event>(`/events/${eventId}`);
    return response.data;
  }

  async createEvent(data: CreateEventRequest): Promise<Event> {
    const response = await this.api.post<Event>('/events', data);
    return response.data;
  }

  async updateEvent(eventId: string, data: UpdateEventRequest): Promise<Event> {
    const response = await this.api.put<Event>(`/events/${eventId}`, data);
    return response.data;
  }

  async deleteEvent(eventId: string): Promise<void> {
    await this.api.delete(`/events/${eventId}`);
  }

  async getMyOrganizedEvents(): Promise<Event[]> {
    const response = await this.api.get<Event[]>('/events/organizer/my-events');
    return response.data;
  }

  // Participation endpoints
  async registerForEvent(eventId: string): Promise<Participation> {
    const response = await this.api.post<Participation>(
      `/participations/events/${eventId}/register`,
      {}
    );
    return response.data;
  }

  async cancelParticipation(eventId: string): Promise<void> {
    await this.api.post(`/participations/events/${eventId}/cancel`, {});
  }

  async getMyParticipations(): Promise<Participation[]> {
    const response = await this.api.get<Participation[]>('/participations/me');
    return response.data;
  }

  async getEventParticipants(eventId: string): Promise<Participation[]> {
    const response = await this.api.get<Participation[]>(
      `/participations/events/${eventId}/participants`
    );
    return response.data;
  }

  async markAttendance(participationId: string): Promise<Participation> {
    const response = await this.api.put<Participation>(
      `/participations/${participationId}/mark-attended`,
      {}
    );
    return response.data;
  }

  // Feedback endpoints
  async submitFeedback(eventId: string, data: CreateFeedbackRequest): Promise<Feedback> {
    const response = await this.api.post<Feedback>(
      `/feedbacks/events/${eventId}/submit`,
      data
    );
    return response.data;
  }

  async getEventFeedback(eventId: string): Promise<Feedback[]> {
    const response = await this.api.get<Feedback[]>(`/feedbacks/events/${eventId}`);
    return response.data;
  }

  async getAverageRating(eventId: string): Promise<number> {
    const response = await this.api.get<number>(`/feedbacks/events/${eventId}/average-rating`);
    return response.data;
  }

  // Notification endpoints
  async getNotifications(): Promise<Notification[]> {
    const response = await this.api.get<Notification[]>('/notifications');
    return response.data;
  }

  async getUnreadNotifications(): Promise<Notification[]> {
    const response = await this.api.get<Notification[]>('/notifications/unread');
    return response.data;
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    await this.api.put(`/notifications/${notificationId}/read`, {});
  }

  async markAllNotificationsRead(): Promise<void> {
    await this.api.put('/notifications/read-all', {});
  }
}

export default new ApiService();
