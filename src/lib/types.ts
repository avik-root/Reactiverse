export interface User {
  id: string;
  name: string; // Full Name
  username: string; // Format: @username, unique
  email?: string;
  phone?: string; // With country code
  avatarUrl?: string;
  password?: string; 
}

export interface Design {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  code: {
    html: string;
    css: string;
    js: string;
  };
  designer: User; 
  tags: string[];
  price?: number; 
  submittedByUserId?: string; 
}

export interface AdminUser {
  id: string;
  username: string;
  password?: string; 
}

export type AuthUser = User | AdminUser;
