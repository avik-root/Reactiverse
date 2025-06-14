
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
  twoFactorEnabled: boolean;
  twoFactorPinHash?: string;
}

// AuthUser is what's typically exposed to the client context or returned from non-sensitive actions
export type AuthUser = 
  | (Omit<User, 'passwordHash' | 'twoFactorPinHash'> & { isAdmin?: false }) 
  | (Omit<AdminUser, 'passwordHash' | 'twoFactorPinHash'> & { isAdmin: true });

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

export interface SiteSettings {
  siteTitle: string;
  allowNewUserRegistrations: boolean;
  themeColors: {
    primaryHSL: string; // e.g., "271 100% 75.3%"
    accentHSL: string;  // e.g., "300 100% 70%"
  };
  logoPath?: string; // Optional: path to custom logo
}

// Form state for Site Settings
export type SiteSettingsFormState = {
  message?: string | null;
  success?: boolean;
  settings?: SiteSettings | null;
  errors?: {
    siteTitle?: string[];
    allowNewUserRegistrations?: string[];
    primaryHSL?: string[];
    accentHSL?: string[];
    general?: string[];
  };
};

// Form state for Admin Profile Update
export type UpdateAdminProfileFormState = {
  message?: string | null;
  success?: boolean;
  adminUser?: Omit<AdminUser, 'passwordHash' | 'twoFactorPinHash'> | null; 
  errors?: {
    name?: string[];
    avatarUrl?: string[];
    general?: string[];
  };
};

// Form state for Admin Password Change
export type ChangeAdminPasswordFormState = {
  message?: string | null;
  success?: boolean;
  errors?: {
    currentPassword?: string[];
    newPassword?: string[];
    confirmPassword?: string[];
    general?: string[];
  };
};

// Form state for Admin 2FA
export type AdminTwoFactorAuthFormState = {
  message?: string | null;
  success?: boolean;
  actionType?: 'enable' | 'disable';
  errors?: {
    pin?: string[];
    confirmPin?: string[];
    currentPasswordFor2FA?: string[];
    general?: string[];
  };
};

// Page Content Types
export interface AboutUsOfferItem {
  title: string;
  description: string;
}
export interface AboutUsContent {
  title: string;
  description: string;
  missionTitle: string;
  missionContentP1: string;
  missionContentP2: string;
  image1Url?: string;
  image1Alt?: string;
  image1DataAiHint?: string;
  offerTitle: string;
  offerItems: AboutUsOfferItem[];
  joinTitle: string;
  joinContent: string;
  image2Url?: string;
  image2Alt?: string;
  image2DataAiHint?: string;
}

export interface SupportPageContent {
  title: string;
  description: string;
  emailSupportTitle: string;
  emailSupportDescription: string;
  emailAddress: string;
  forumTitle: string;
  forumDescription: string;
  forumLinkText: string;
  forumLinkUrl: string;
  faqTitle: string;
  faqPlaceholder: string;
}

export interface GuidelinesPageContent {
  title: string;
  description: string;
  mainPlaceholderTitle: string;
  mainPlaceholderContent: string;
  keyAreasTitle: string;
  keyAreas: string[];
}

export interface TopDesignersPageContent {
  title: string;
  description: string;
  mainPlaceholderTitle: string;
  mainPlaceholderContent: string;
}

export type PageContentData = {
  aboutUs: AboutUsContent;
  support: SupportPageContent;
  guidelines: GuidelinesPageContent;
  topDesigners: TopDesignersPageContent;
};

export type PageContentKeys = keyof PageContentData;

export type UpdatePageContentFormState<T> = {
  message?: string | null;
  success?: boolean;
  errors?: Partial<Record<keyof T, string[]>> & { general?: string[] };
  content?: T | null;
};

export type SiteLogoUploadState = {
    message?: string | null;
    success?: boolean;
    errors?: {
        logoFile?: string[];
        general?: string[];
    };
    filePath?: string | null;
};
