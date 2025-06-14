export interface User {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  password?: string; // Added for storing user password in users.json
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
  designer: User; // User type now includes optional password, but it won't be typically populated here
  tags: string[];
  price?: number; // Optional: 0 or undefined for free, >0 for priced
  submittedByUserId?: string; // To link design to the user who submitted it
}

export interface AdminUser {
  id: string;
  username: string;
  password?: string; // Password should not be sent to client
}

export type AuthUser = User | AdminUser;
