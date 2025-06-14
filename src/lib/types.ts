

export interface User {
  id: string;
  name: string; 
  username: string; 
  email?: string;
  phone?: string; 
  avatarUrl?: string;
  passwordHash?: string; 
  twoFactorEnabled: boolean;
  twoFactorPinHash?: string;
}

export interface CodeBlockItem {
  id: string; 
  language: string;
  code: string;
}

export interface Design {
  id: string;
  title: string;
  filterCategory: string; 
  description: string;
  codeBlocks: CodeBlockItem[]; 
  designer: User;
  tags: string[];
  price?: number; 
  submittedByUserId?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  passwordHash?: string; 
}

export type AuthUser = Omit<User, 'passwordHash' | 'twoFactorPinHash'> | Omit<AdminUser, 'passwordHash'>;

export type StoredUser = User;
export type StoredAdminUser = AdminUser;

// State type for delete action result
export interface DeleteDesignResult {
  success: boolean;
  message: string;
}

export type AdminCreateAccountFormState = {
  message?: string | null;
  success?: boolean;
  errors?: {
    username?: string[];
    password?: string[];
    confirmPassword?: string[];
    general?: string[];
  };
};
