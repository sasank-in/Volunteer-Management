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
  AuditLogEntry,
  PageResponse,
} from '@store/../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

class ApiService {
  private api: AxiosInstance;
  private accessToken: string | null = null;
  private accessTokenListeners: Array<(token: string | null) => void> = [];

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      // Send the HttpOnly refresh-token cookie on /auth/refresh and /auth/logout.
      withCredentials: true,
      // Spring's CookieCsrfTokenRepository sets XSRF-TOKEN; axios mirrors it back as X-XSRF-TOKEN.
      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',
    });

    this.api.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.setAccessToken(null);
        }
        return Promise.reject(error);
      }
    );
  }

  setAccessToken(token: string | null): void {
    this.accessToken = token;
    this.accessTokenListeners.forEach((cb) => cb(token));
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  onAccessTokenChange(cb: (token: string | null) => void): () => void {
    this.accessTokenListeners.push(cb);
    return () => {
      this.accessTokenListeners = this.accessTokenListeners.filter((l) => l !== cb);
    };
  }

  async register(data: RegisterRequest): Promise<UserAccount> {
    const response = await this.api.post<UserAccount>('/auth/register', data);
    return response.data;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/login', data);
    this.setAccessToken(response.data.tokens.accessToken);
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.primeCsrf();
      await this.api.post('/auth/logout');
    } finally {
      this.setAccessToken(null);
    }
  }

  /**
   * Exchanges the refresh-token cookie for a new access token. Used at app
   * boot to re-establish a session and after 401s.
   */
  /** Prime the XSRF-TOKEN cookie so axios can echo it on the next POST. */
  async primeCsrf(): Promise<void> {
    await this.api.get('/auth/csrf');
  }

  async refreshToken(): Promise<AuthResponse> {
    await this.primeCsrf();
    const response = await this.api.post<AuthResponse>('/auth/refresh');
    this.setAccessToken(response.data.tokens.accessToken);
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

  async getAuditLog(page = 0, size = 25, actionPrefix?: string): Promise<PageResponse<AuditLogEntry>> {
    const response = await this.api.get<PageResponse<AuditLogEntry>>('/admin/audit-log', {
      params: actionPrefix
        ? { page, size, actionPrefix }
        : { page, size },
    });
    return response.data;
  }

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

  async uploadEventCover(eventId: string, file: File): Promise<{ coverImageUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.api.post<{ coverImageUrl: string }>(
      `/events/${eventId}/cover`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data;
  }

  /** Resolves a cover image URL — strips /api so /uploads/x.jpg goes to the gateway root. */
  resolveImageUrl(coverImageUrl: string | null | undefined): string | undefined {
    if (!coverImageUrl) return undefined;
    if (coverImageUrl.startsWith('http')) return coverImageUrl;
    const base = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/api\/?$/, '');
    return `${base}${coverImageUrl}`;
  }

  async getMyOrganizedEvents(): Promise<Event[]> {
    const response = await this.api.get<Event[]>('/events/organizer/my-events');
    return response.data;
  }

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
