
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

export interface CodeBlockItem {
  id: string; // For React keys and potential future editing
  language: string;
  code: string;
}

export interface Design {
  id: string;
  title: string;
  filterCategory: string; 
  description: string;
  imageUrl: string; 
  codeBlocks: CodeBlockItem[]; // Changed from single language/codeSnippet
  designer: User;
  tags: string[];
  price?: number; // Price in INR
  submittedByUserId?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  passwordHash?: string; // Store hashed password for admin
}

export type AuthUser = Omit<User, 'passwordHash' | 'twoFactorPinHash'> | Omit<AdminUser, 'passwordHash'>;

export type StoredUser = User;
export type StoredAdminUser = AdminUser;
