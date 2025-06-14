
export interface User {
  id: string;
  name: string; // Full Name
  username: string; // Format: @username, unique
  email?: string;
  phone?: string; // With country code
  avatarUrl?: string;
  passwordHash?: string; // Store hashed password
  twoFactorEnabled: boolean;
  twoFactorPinHash?: string;
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
  passwordHash?: string; // Store hashed password for admin
}

// AuthUser is a union type, its constituents have changed (password -> passwordHash)
// but the type itself still represents a logged-in user (either User or AdminUser)
// The actual object structure passed to AuthContext will be sanitized (no hashes).
export type AuthUser = Omit<User, 'passwordHash' | 'twoFactorPinHash'> | Omit<AdminUser, 'passwordHash'>;

// Define a type for the full user object as stored in the database/JSON
export type StoredUser = User;
export type StoredAdminUser = AdminUser;
