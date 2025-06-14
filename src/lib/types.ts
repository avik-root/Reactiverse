export interface User {
  id: string;
  name: string;
  email?: string; 
  avatarUrl?: string;
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
}

export interface AdminUser {
  id: string;
  username: string;
  password?: string; // Password should not be sent to client
}

export type AuthUser = User | AdminUser;
