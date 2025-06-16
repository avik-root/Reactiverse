

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
  failedPinAttempts?: number;
  isLocked?: boolean;
  canSetPrice?: boolean;
  githubUrl?: string;
  linkedinUrl?: string;
  figmaUrl?: string;
  isEmailPublic?: boolean;
  isPhonePublic?: boolean;
}

export interface CodeBlockItem {
  id: string;
  language: string;
  code: string;
}

export interface Design {
  id:string;
  title: string;
  filterCategory: string;
  description: string;
  codeBlocks: CodeBlockItem[];
  designer: User;
  tags: string[];
  price?: number;
  submittedByUserId?: string;
  copyCount?: number;
  likedBy: string[];
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

export type AuthUser =
  | (Omit<User, 'passwordHash' | 'twoFactorPinHash'> & {
      isAdmin?: false;
      canSetPrice?: boolean;
      githubUrl?: string;
      linkedinUrl?: string;
      figmaUrl?: string;
      isEmailPublic?: boolean;
      isPhonePublic?: boolean;
    })
  | (Omit<AdminUser, 'passwordHash' | 'twoFactorPinHash'> & { isAdmin: true });

export type StoredUser = User;
export type StoredAdminUser = AdminUser;


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
    primaryHSL: string;
    accentHSL: string;
  };
  logoPath?: string;
}

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

export type UpdateAdminProfileFormState = {
  message?: string | null;
  success?: boolean;
  adminUser?: Omit<AdminUser, 'passwordHash' | 'twoFactorPinHash'> | null;
  errors?: {
    name?: string[];
    avatarFile?: string[];
    general?: string[];
  };
};

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

export interface TeamMember {
  name: string;
  title: string;
  bio: string;
  imageUrl?: string;
  imageAlt?: string;
  imageDataAiHint?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  emailAddress?: string;
}

export interface TeamMembersContent {
  title: string;
  founder: TeamMember;
  coFounder: TeamMember;
}

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
  image1File?: File;
  offerTitle: string;
  offerItems: AboutUsOfferItem[];
  joinTitle: string;
  joinContent: string;
  image2Url?: string;
  image2Alt?: string;
  image2DataAiHint?: string;
  image2File?: File;
}

export interface FAQItem {
  question: string;
  answer: string;
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
  faqs: FAQItem[];
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
  teamMembers: TeamMembersContent;
};

export type PageContentKeys = keyof PageContentData;

export type UpdatePageContentFormState<T> = {
  message?: string | null;
  success?: boolean;
  errors?: Partial<Record<keyof T, string[] | any>> & { general?: string[] } & {
    image1File?: string[];
    image2File?: string[];
    founder?: Partial<Record<keyof TeamMember, string[] | { imageFile?: string[] }>>;
    coFounder?: Partial<Record<keyof TeamMember, string[] | { imageFile?: string[] }>>;
    faqsJSON?: string[];
    founderImageFile?: string[];
    coFounderImageFile?: string[];
  };
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

export type AdminSetUser2FAStatusFormState = {
  message?: string | null;
  success?: boolean;
  errors?: {
    userId?: string[];
    general?: string[];
  };
  updatedUser?: User | null;
};

export type AdminSetUserCanSetPriceFormState = {
  message?: string | null;
  success?: boolean;
  errors?: {
    userId?: string[];
    general?: string[];
  };
  updatedUser?: User | null;
};

export type UpdateProfileFormState = {
  message?: string | null;
  success?: boolean;
  user?: AuthUser | null;
  errors?: {
    name?: string[];
    avatarFile?: string[];
    githubUrl?: string[];
    linkedinUrl?: string[];
    figmaUrl?: string[];
    isEmailPublic?: string[];
    isPhonePublic?: string[];
    general?: string[];
  };
};

export type IncrementCopyCountResult = {
    success: boolean;
    message?: string;
    newCount?: number;
};

export type ToggleLikeDesignResult = {
  success: boolean;
  message?: string;
  newLikeCount?: number;
  isLikedByCurrentUser?: boolean;
};

export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  iconName: 'MessagesSquare' | 'Palette' | 'Code2' | 'Lightbulb' | 'Megaphone' | 'HelpCircle' | 'Users' | 'Info' | 'Filter' | 'LayoutList';
  topicCount?: number;
  postCount?: number;
  slug: string;
}

export type AddForumCategoryFormState = {
  message?: string | null;
  success?: boolean;
  errors?: {
    name?: string[];
    description?: string[];
    slug?: string[];
    iconName?: string[];
    general?: string[];
  };
  category?: ForumCategory | null;
};

export interface ForumPost {
  id: string;
  topicId: string; 
  content: string;
  createdByUserId: string;
  authorName: string;
  authorAvatarUrl?: string;
  createdAt: string;
}

export interface ForumTopic {
  id: string;
  categoryId: string; 
  title: string;
  content: string; 
  createdByUserId: string;
  authorName: string;
  authorAvatarUrl?: string;
  createdAt: string;
  lastRepliedAt: string;
  viewCount: number;
  replyCount: number;
  posts?: ForumPost[]; 
}


export interface NewsletterSubscriber {
  email: string;
  subscribedAt: string;
}

export type SubscribeToNewsletterFormState = {
  message?: string | null;
  success?: boolean;
  errors?: {
    email?: string[];
    general?: string[];
  };
};

export type CreateTopicFormState = {
  message?: string | null;
  success?: boolean;
  errors?: {
    title?: string[];
    content?: string[];
    general?: string[];
  };
  newTopicId?: string | null;
};

export type AdminDeleteTopicResult = {
  success: boolean;
  message: string;
};

