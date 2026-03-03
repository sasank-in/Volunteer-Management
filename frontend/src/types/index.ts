// User types
export interface UserAccount {
  id: string;
  username: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'VOLUNTEER' | 'ORGANIZER' | 'ADMIN';

export interface AuthResponse {
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  user: UserAccount;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

// Event types
export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  eventDate: string;
  requiredVolunteers: number;
  registeredVolunteers: number;
  organizerId: string;
  organizerName: string;
  status: EventStatus;
  averageRating?: number;
  createdAt: string;
  updatedAt: string;
}

export type EventStatus = 'OPEN' | 'FULL' | 'COMPLETED' | 'CANCELLED';

export interface CreateEventRequest {
  title: string;
  description: string;
  location: string;
  eventDate: string;
  requiredVolunteers: number;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  status?: EventStatus;
}

// Participation types
export interface Participation {
  id: string;
  eventId: string;
  volunteerId: string;
  volunteerName: string;
  volunteerEmail: string;
  status: ParticipationStatus;
  rolePlayed?: string;
  registeredAt: string;
}

export type ParticipationStatus = 'REGISTERED' | 'ATTENDED' | 'CANCELLED';

// Feedback/Rating types
export interface Feedback {
  id: string;
  eventId: string;
  volunteerId: string;
  volunteerName: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: string;
}

export interface CreateFeedbackRequest {
  rating: number;
  comment?: string;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: NotificationType;
  readAt?: string;
  sentAt: string;
}

export type NotificationType = 'EMAIL' | 'IN_APP';

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}
