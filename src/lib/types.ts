

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
  designer: User; // This will hold the sanitized User object
  tags: string[];
  price?: number; 
  submittedByUserId?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  avatarUrl?: string; 
  passwordHash?: string; 
}

// AuthUser is what's typically exposed to the client context or returned from non-sensitive actions
export type AuthUser = 
  | (Omit<User, 'passwordHash' | 'twoFactorPinHash'> & { isAdmin?: false }) 
  | (Omit<AdminUser, 'passwordHash'> & { isAdmin: true });

// StoredUser and StoredAdminUser represent the full objects as stored in JSON files, including hashes
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
    name?: string[];
    username?: string[];
    email?: string[];
    phone?: string[];
    password?: string[];
    confirmPassword?: string[];
    general?: string[];
  };
};


