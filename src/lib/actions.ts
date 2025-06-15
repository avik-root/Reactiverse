
'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import path from 'path';
import {
  getUsersFromFile,
  saveUserToFile,
  getAdminUsers,
  addDesignToFile,
  updateUserInFile,
  getDesignsFromFile,
  updateDesignInFile,
  deleteDesignFromFile,
  saveDesignsToFile,
  saveFirstAdminUser,
  updateAdminInFile,
  deleteUserFromFile as deleteUserFromServerData,
  getSiteSettings as getSiteSettingsFromFile,
  saveSiteSettings as saveSiteSettingsToFile,
  getPageContent as getPageContentFromFile,
  savePageContent as savePageContentToFile,
  saveSiteLogo as saveSiteLogoToServer,
  saveTeamMemberImage,
} from './server-data';
import type {
  AdminUser,
  User,
  Design,
  AuthUser,
  StoredUser,
  StoredAdminUser,
  CodeBlockItem,
  DeleteDesignResult,
  AdminCreateAccountFormState,
  SiteSettings,
  SiteSettingsFormState,
  UpdateAdminProfileFormState,
  ChangeAdminPasswordFormState,
  AdminTwoFactorAuthFormState,
  PageContentData,
  PageContentKeys,
  UpdatePageContentFormState,
  AboutUsContent,
  SupportPageContent,
  GuidelinesPageContent,
  TopDesignersPageContent,
  SiteLogoUploadState,
  AdminSetUser2FAStatusFormState,
  AdminSetUserCanSetPriceFormState,
  TeamMembersContent,
  TeamMember,
  UpdateProfileFormState as UserUpdateProfileFormState,
  IncrementCopyCountResult,
  ToggleLikeDesignResult,
} from './types';
import { revalidatePath } from 'next/cache';
import { hashPassword, comparePassword, hashPin, comparePin } from './auth-utils';

const ADMIN_AUTH_COOKIE_NAME_FOR_ACTIONS = 'admin-auth-token';
const MAX_PIN_ATTEMPTS = 5;

const LoginSchema = z.object({
  identifier: z.string().min(1, { message: 'Username or email is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
  pin: z.string().length(6, { message: 'PIN must be 6 digits.' }).regex(/^\d{6}$/, "PIN must be 6 digits.").optional(),
  userIdForPin: z.string().optional(),
});

const SignupSchema = z.object({
  name: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
  username: z.string()
    .min(4, { message: 'Username must be at least 3 characters plus @.' })
    .regex(/^@[a-zA-Z0-9_]+$/, { message: 'Username must start with @ and contain only letters, numbers, or underscores.'}),
  email: z.string().email({ message: 'Invalid email address.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number with country code.' })
    .regex(/^\+[1-9]\d{1,14}$/, { message: 'Phone number must start with + and country code (e.g., +1234567890).' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
});

const AdminLoginSchema = z.object({
  username: z.string().min(1, { message: 'Username is required.' }).optional(),
  password: z.string().min(1, { message: 'Password is required.' }).optional(),
  pin: z.string().length(6, { message: 'PIN must be 6 digits.' }).regex(/^\d{6}$/, "PIN must be 6 digits.").optional(),
  adminIdForPin: z.string().optional(),
});

const AdminCreateAccountSchema = z.object({
  name: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
  username: z.string().min(4, { message: 'Username must be at least 4 characters.' }).regex(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers, or underscores.'}),
  email: z.string().email({ message: 'Invalid email address.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number with country code.' })
    .regex(/^\+[1-9]\d{1,14}$/, { message: 'Phone number must start with + and country code (e.g., +1234567890).' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ['confirmPassword'],
});


const CodeBlockSchema = z.object({
  language: z.string().min(1, "Language is required."),
  code: z.string().min(10, "Code must be at least 10 characters.")
});

const AddDesignSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
  filterCategory: z.string().min(3, {message: 'Filter category must be at least 3 characters.'}),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  codeBlocksJSON: z.string().refine(
    (val) => {
      try {
        const arr = JSON.parse(val);
        if (!Array.isArray(arr) || arr.length === 0) return false;
        return arr.every(
          (item) => CodeBlockSchema.safeParse(item).success
        );
      } catch {
        return false;
      }
    },
    { message: 'At least one valid code block (language and snippet with min 10 chars) is required.' }
  ),
  tags: z.string().min(1, {message: 'Please add at least one tag.'}),
  price: z.coerce.number().min(0, { message: 'Price cannot be negative.' }).default(0),
  submittedByUserId: z.string(),
});

const UpdateDesignSchema = AddDesignSchema.extend({
  designId: z.string().min(1, { message: 'Design ID is required for update.' }),
});


const UpdateProfileSchema = z.object({
  userId: z.string(),
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  avatarUrl: z.string().optional(),
  githubUrl: z.string().url("Invalid GitHub URL format.").or(z.literal('')).optional(),
  linkedinUrl: z.string().url("Invalid LinkedIn URL format.").or(z.literal('')).optional(),
  figmaUrl: z.string().url("Invalid Figma URL format.").or(z.literal('')).optional(),
  isEmailPublic: z.preprocess((val) => String(val).toLowerCase() === 'on' || String(val).toLowerCase() === 'true', z.boolean().default(false)),
  isPhonePublic: z.preprocess((val) => String(val).toLowerCase() === 'on' || String(val).toLowerCase() === 'true', z.boolean().default(false)),
});


const ChangePasswordSchema = z.object({
  userId: z.string(),
  currentPassword: z.string().min(1, {message: "Current password is required."}),
  newPassword: z.string().min(8, { message: 'New password must be at least 8 characters.' }),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match.",
  path: ['confirmPassword'],
});

const EnableTwoFactorSchema = z.object({
  userId: z.string(),
  pin: z.string().length(6, { message: 'PIN must be 6 digits.' }).regex(/^\d{6}$/, "PIN must be 6 digits."),
  confirmPin: z.string(),
  currentPasswordFor2FA: z.string().min(1, {message: "Current password is required to enable 2FA."}),
}).refine(data => data.pin === data.confirmPin, {
  message: "PINs don't match.",
  path: ['confirmPin'],
});

const DisableTwoFactorSchema = z.object({
  userId: z.string(),
  currentPasswordFor2FA: z.string().min(1, {message: "Current password is required to disable 2FA."}),
});

const HSLColorSchema = z.string()
  .regex(
    /^\d{1,3}\s+\d{1,3}%\s+\d{1,3}(?:\.\d+)?%$/,
    "Invalid HSL format. Example: '271 100% 75.3%'"
  )
  .optional();

const SiteSettingsSchema = z.object({
  siteTitle: z.string().min(3, { message: 'Site title must be at least 3 characters.' }),
  allowNewUserRegistrations: z.preprocess((val) => val === 'on' || val === true, z.boolean()),
  primaryHSL: HSLColorSchema,
  accentHSL: HSLColorSchema,
});

const UpdateAdminProfileSchema = z.object({
  adminId: z.string(),
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  avatarUrl: z.string().optional(),
});

const ChangeAdminPasswordSchema = z.object({
  adminId: z.string(),
  currentPassword: z.string().min(1, { message: "Current password is required." }),
  newPassword: z.string().min(8, { message: 'New password must be at least 8 characters.' }),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match.",
  path: ['confirmPassword'],
});

const EnableAdminTwoFactorSchema = z.object({
  adminId: z.string(),
  pin: z.string().length(6, { message: 'PIN must be 6 digits.' }).regex(/^\d{6}$/, "PIN must be 6 digits."),
  confirmPin: z.string(),
  currentPasswordFor2FA: z.string().min(1, { message: "Current password is required to enable 2FA." }),
}).refine(data => data.pin === data.confirmPin, {
  message: "PINs don't match.",
  path: ['confirmPin'],
});

const DisableAdminTwoFactorSchema = z.object({
  adminId: z.string(),
  currentPasswordFor2FA: z.string().min(1, { message: "Current password is required to disable 2FA." }),
});

const AdminSetUser2FAStatusSchema = z.object({
    userId: z.string().min(1, "User ID is required."),
    enable: z.preprocess((val) => String(val).toLowerCase() === 'true', z.boolean()),
    adminId: z.string().min(1, "Admin ID is required for authorization."),
});

const AdminSetUserCanSetPriceSchema = z.object({
    userId: z.string().min(1, "User ID is required."),
    canSetPrice: z.preprocess((val) => String(val).toLowerCase() === 'true', z.boolean()),
    adminId: z.string().min(1, "Admin ID is required for authorization."),
});


const AboutUsContentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  missionTitle: z.string().min(1, "Mission title is required"),
  missionContentP1: z.string().min(1, "Mission paragraph 1 is required"),
  missionContentP2: z.string().min(1, "Mission paragraph 2 is required"),
  image1Url: z.string().url("Invalid URL for mission image").or(z.literal('')).optional(),
  image1Alt: z.string().optional(),
  image1DataAiHint: z.string().max(30, "AI hint too long").optional(),
  offerTitle: z.string().min(1, "Offer title is required"),
  offerItems: z.preprocess(
    (val) => {
      const items: { title: string; description: string }[] = [];
      const data = val as Record<string, any>;
      let i = 0;
      while(data[`offerItems[${i}].title`] !== undefined || data[`offerItems[${i}].description`] !== undefined) {
        items.push({
          title: data[`offerItems[${i}].title`] || '',
          description: data[`offerItems[${i}].description`] || ''
        });
        delete data[`offerItems[${i}].title`];
        delete data[`offerItems[${i}].description`];
        i++;
      }
      if (items.length > 0) return items;
      return val;
    },
    z.array(
      z.object({
        title: z.string().min(1, "Offer item title is required"),
        description: z.string().min(1, "Offer item description is required")
      })
    ).min(1, "At least one offer item is required")
  ),
  joinTitle: z.string().min(1, "Join title is required"),
  joinContent: z.string().min(1, "Join content is required"),
  image2Url: z.string().url("Invalid URL for join image").or(z.literal('')).optional(),
  image2Alt: z.string().optional(),
  image2DataAiHint: z.string().max(30, "AI hint too long").optional(),
});


const SupportPageContentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  emailSupportTitle: z.string().min(1, "Email support title is required"),
  emailSupportDescription: z.string().min(1, "Email support description is required"),
  emailAddress: z.string().email("Invalid email address"),
  forumTitle: z.string().min(1, "Forum title is required"),
  forumDescription: z.string().min(1, "Forum description is required"),
  forumLinkText: z.string().min(1, "Forum link text is required"),
  forumLinkUrl: z.string().url("Invalid URL for forum link").or(z.literal('#')),
  faqTitle: z.string().min(1, "FAQ title is required"),
  faqPlaceholder: z.string().min(1, "FAQ placeholder text is required"),
});

const GuidelinesPageContentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  mainPlaceholderTitle: z.string().min(1, "Placeholder title is required"),
  mainPlaceholderContent: z.string().min(1, "Placeholder content is required"),
  keyAreasTitle: z.string().min(1, "Key areas title is required"),
  keyAreas: z.array(z.string().min(1, "Key area item cannot be empty"))
              .min(1, "At least one key area is required"),
  keyAreasJSON: z.string().optional(),
}).transform(data => {
  if (data.keyAreasJSON) {
    try {
      const parsedKeyAreas = JSON.parse(data.keyAreasJSON);
      if (Array.isArray(parsedKeyAreas) && parsedKeyAreas.every(item => typeof item === 'string')) {
        data.keyAreas = parsedKeyAreas;
      }
    } catch (e) {
    }
  }
  const { keyAreasJSON, ...rest } = data;
  return rest;
});


const TopDesignersPageContentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  mainPlaceholderTitle: z.string().min(1, "Placeholder title is required"),
  mainPlaceholderContent: z.string().min(1, "Placeholder content is required"),
});

const ValidImageFileSchema = z.instanceof(File, { message: "Image file is required." })
  .refine(file => file.size > 0, "Image file cannot be empty.")
  .refine(file => file.size <= 2 * 1024 * 1024, "Image must be 2MB or less.")
  .refine(file => ["image/png", "image/jpeg", "image/jpg"].includes(file.type), "Invalid file type. Must be PNG or JPG.");

const TeamMemberSchemaClient = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  imageUrl: z.string().optional(), // This will be the existing path or new path after upload
  imageAlt: z.string().optional(),
  imageDataAiHint: z.string().max(30, "AI hint too long").optional(),
  githubUrl: z.string().url("Invalid GitHub URL").or(z.literal("")).optional(),
  linkedinUrl: z.string().url("Invalid LinkedIn URL").or(z.literal("")).optional(),
  emailAddress: z.string().email("Invalid Email Address").or(z.literal("")).optional(),
});

const TeamMembersContentSchemaClient = z.object({
  title: z.string().min(1, "Section title is required"),
  founder: TeamMemberSchemaClient,
  coFounder: TeamMemberSchemaClient,
  founderImageFile: ValidImageFileSchema.optional(),
  coFounderImageFile: ValidImageFileSchema.optional(),
  "founder.existingImageUrl": z.string().optional(),
  "coFounder.existingImageUrl": z.string().optional(),
});



const SiteLogoSchema = z.object({
  logoFile: ValidImageFileSchema,
});


const pageContentSchemasMap = {
  aboutUs: AboutUsContentSchema,
  support: SupportPageContentSchema,
  guidelines: GuidelinesPageContentSchema,
  topDesigners: TopDesignersPageContentSchema,
  teamMembers: TeamMembersContentSchemaClient,
};


export type LoginFormState = {
  message?: string | null;
  user?: AuthUser | null;
  errors?: {
    identifier?: string[];
    password?: string[];
    pin?: string[];
    general?: string[];
  };
  requiresPin?: boolean;
  userIdForPin?: string;
  accountLocked?: boolean;
};

export type SignupFormState = {
  message?: string | null;
  user?: AuthUser | null;
  errors?: {
    name?: string[];
    username?: string[];
    email?: string[];
    phone?: string[];
    password?: string[];
    general?: string[];
  };
};

export type AdminLoginFormState = {
  message?: string | null;
  adminUser?: AuthUser | null;
  errors?: {
    username?: string[];
    password?: string[];
    pin?: string[];
    general?: string[];
  };
  requiresPin?: boolean;
  adminIdForPin?: string;
};

type CodeBlockError = { language?: string[]; code?: string[] };

export type AddDesignFormState = {
  message?: string | null;
  success?: boolean;
  errors?: {
    title?: string[];
    filterCategory?: string[];
    description?: string[];
    codeBlocksJSON?: string[];
    codeBlocks?: CodeBlockError[];
    tags?: string[];
    price?: string[];
    general?: string[];
  };
};

export type UpdateDesignFormState = AddDesignFormState & {
  errors?: AddDesignFormState['errors'] & {
    designId?: string[];
  };
};




export async function loginUser(prevState: LoginFormState, formData: FormData): Promise<LoginFormState> {
  const validatedFields = LoginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields. Please check your input.',
    };
  }

  const { identifier, password, pin, userIdForPin } = validatedFields.data;
  const users = await getUsersFromFile();
  let targetUser: StoredUser | undefined;

  if (userIdForPin && pin) {
    targetUser = users.find(u => u.id === userIdForPin);
    if (!targetUser) {
      return { message: 'User not found for PIN verification.', errors: { general: ['An error occurred. Please try logging in again.'] } };
    }

    if (targetUser.isLocked) {
      return { message: 'Your account is locked due to too many failed 2FA attempts. Please contact support.', accountLocked: true, errors: { general: ['Account locked.'] } };
    }

    if (!targetUser.twoFactorEnabled || !targetUser.twoFactorPinHash) {
      return { message: '2FA is not enabled for this user or PIN not set up.', errors: { general: ['2FA error. Please try logging in again.'] } };
    }

    const pinMatches = await comparePin(pin, targetUser.twoFactorPinHash);
    if (!pinMatches) {
      targetUser.failedPinAttempts = (targetUser.failedPinAttempts || 0) + 1;
      if (targetUser.failedPinAttempts >= MAX_PIN_ATTEMPTS) {
        targetUser.isLocked = true;
        await updateUserInFile(targetUser);
        return {
          message: 'Invalid PIN. Your account has been locked due to too many failed attempts. Please contact support.',
          errors: { pin: ['Incorrect PIN. Account locked.'] },
          requiresPin: true,
          userIdForPin: targetUser.id,
          accountLocked: true,
        };
      }
      await updateUserInFile(targetUser);
      return {
        message: `Invalid PIN. ${MAX_PIN_ATTEMPTS - targetUser.failedPinAttempts} attempts remaining.`,
        errors: { pin: ['Incorrect PIN.'] },
        requiresPin: true,
        userIdForPin: targetUser.id
      };
    }
    targetUser.failedPinAttempts = 0;
    await updateUserInFile(targetUser);
    const { passwordHash, twoFactorPinHash: removedPinHash, ...userToReturn } = targetUser;
    return { message: 'Login successful!', user: {...userToReturn, isAdmin: false, canSetPrice: userToReturn.canSetPrice || false} };

  } else {
    if (!identifier || !password) {
        return { message: 'Username/email and password are required.', errors: { general: ['Username/email and password are required.'] } };
    }
    targetUser = users.find(u => (u.email === identifier || u.username === identifier));
    if (!targetUser || !targetUser.passwordHash) {
      return { message: 'Invalid credentials.', errors: { general: ['Invalid username/email or password.'] } };
    }

    if (targetUser.isLocked) {
      return { message: 'Your account is locked. Please contact support.', accountLocked: true, errors: { general: ['Account locked.'] } };
    }

    const passwordMatches = await comparePassword(password, targetUser.passwordHash);
    if (!passwordMatches) {
      return { message: 'Invalid credentials.', errors: { general: ['Invalid username/email or password.'] } };
    }

    if (targetUser.twoFactorEnabled) {
      return {
        message: 'Please enter your 2FA PIN.',
        requiresPin: true,
        userIdForPin: targetUser.id
      };
    } else {
      const { passwordHash, twoFactorPinHash: removedPinHash, ...userToReturn } = targetUser;
      return { message: 'Login successful!', user: {...userToReturn, isAdmin: false, canSetPrice: userToReturn.canSetPrice || false} };
    }
  }
}

export async function signupUser(prevState: SignupFormState, formData: FormData): Promise<SignupFormState> {
  const validatedFields = SignupSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields. Please check your input.',
    };
  }

  const settings = await getSiteSettingsFromFile();
  if (!settings.allowNewUserRegistrations) {
    return {
      message: 'New user registrations are currently disabled by the administrator.',
      errors: { general: ['Registrations are disabled.'] }
    };
  }

  const { name, username, email, phone, password } = validatedFields.data;
  const users = await getUsersFromFile();

  if (users.some(u => u.email === email)) {
    return { message: 'User with this email already exists.', errors: { email: ['Email already in use.'] } };
  }
  if (users.some(u => u.username === username)) {
    return { message: 'This username is already taken.', errors: { username: ['Username already taken.'] } };
  }

  const hashedPassword = await hashPassword(password);
  const newUser: StoredUser = {
    id: `user-${Date.now()}`,
    name,
    username,
    email,
    phone,
    passwordHash: hashedPassword,
    avatarUrl: `https://placehold.co/100x100.png?text=${name.charAt(0).toUpperCase()}`,
    twoFactorEnabled: false,
    failedPinAttempts: 0,
    isLocked: false,
    canSetPrice: false,
    githubUrl: '',
    linkedinUrl: '',
    figmaUrl: '',
    isEmailPublic: false,
    isPhonePublic: false,
  };

  await saveUserToFile(newUser);
  const { passwordHash, twoFactorPinHash, ...userToReturnForState } = newUser;

  return { message: 'Signup successful! Please log in.', user: {...userToReturnForState, isAdmin: false, canSetPrice: newUser.canSetPrice} };
}

export async function loginAdmin(prevState: AdminLoginFormState, formData: FormData): Promise<AdminLoginFormState> {
  const validatedFields = AdminLoginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields. Please check your input.',
    };
  }

  const { username, password, pin, adminIdForPin } = validatedFields.data;
  const adminUsers = await getAdminUsers();
  let targetAdmin: StoredAdminUser | undefined;

  if (adminIdForPin && pin) {
    targetAdmin = adminUsers.find(admin => admin.id === adminIdForPin);
    if (!targetAdmin) {
      return { message: 'Admin user not found for PIN verification.', errors: { general: ['An error occurred. Please try logging in again.'] } };
    }
    if (!targetAdmin.twoFactorEnabled || !targetAdmin.twoFactorPinHash) {
      return { message: '2FA is not enabled for this admin or PIN not set up.', errors: { general: ['Admin 2FA error. Please try logging in again.'] } };
    }
    const pinMatches = await comparePin(pin, targetAdmin.twoFactorPinHash);
    if (!pinMatches) {
      return {
        message: 'Invalid PIN.',
        errors: { pin: ['Incorrect PIN.'] },
        requiresPin: true,
        adminIdForPin: targetAdmin.id,
      };
    }
  } else if (username && password) {
    targetAdmin = adminUsers.find(admin => admin.username === username);
    if (!targetAdmin || !targetAdmin.passwordHash) {
      return { message: 'Invalid username or password.', errors: { general: ['Invalid username or password.'] } };
    }
    const passwordMatches = await comparePassword(password, targetAdmin.passwordHash);
    if (!passwordMatches) {
      return { message: 'Invalid username or password.', errors: { general: ['Invalid username or password.'] } };
    }

    if (targetAdmin.twoFactorEnabled) {
      return {
        message: 'Please enter your 2FA PIN.',
        requiresPin: true,
        adminIdForPin: targetAdmin.id,
      };
    }
  } else {
    return { message: 'Invalid login attempt.', errors: { general: ['Invalid login state.'] } };
  }

  if (!targetAdmin) {
    return { message: 'Admin user not found.', errors: { general: ['Admin user not found.'] } };
  }

  cookies().set(ADMIN_AUTH_COOKIE_NAME_FOR_ACTIONS, targetAdmin.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/admin',
    maxAge: 0, // Use maxAge: 0 for session cookie behavior if preferred or specific duration
    sameSite: 'lax',
  });

  const { passwordHash, twoFactorPinHash, ...adminUserToReturn } = targetAdmin;
  return { message: 'Admin login successful!', adminUser: { ...adminUserToReturn, isAdmin: true } };
}


export async function logoutAdminAction(): Promise<{ success: boolean }> {
  try {
    cookies().set(ADMIN_AUTH_COOKIE_NAME_FOR_ACTIONS, '', {
      path: '/admin',
      maxAge: 0, // Explicitly expire the cookie
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    // cookies().delete(ADMIN_AUTH_COOKIE_NAME_FOR_ACTIONS); // The set with maxAge: 0 should be sufficient
    return { success: true };
  } catch (error) {
    console.error('Error during admin logout action:', error);
    return { success: false };
  }
}

export async function submitDesignAction(prevState: AddDesignFormState, formData: FormData): Promise<AddDesignFormState> {
  const validatedFields = AddDesignSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    if (fieldErrors.codeBlocksJSON) {
        try {
            const rawCodeBlocks = JSON.parse(formData.get('codeBlocksJSON') as string);
            if(Array.isArray(rawCodeBlocks)) {
                const codeBlockErrors : CodeBlockError[] = rawCodeBlocks.map(block => {
                    const errors: CodeBlockError = {};
                    if(!block.language || block.language.trim() === '') errors.language = ["Language is required."];
                    if(!block.code || block.code.trim().length < 10) errors.code = ["Code must be at least 10 characters."];
                    return errors;
                }).filter(e => Object.keys(e).length > 0);

                if(codeBlockErrors.length > 0 && fieldErrors.codeBlocksJSON ) {
                    return {
                        errors: { ...fieldErrors, codeBlocks: codeBlockErrors, codeBlocksJSON: undefined },
                        message: 'Invalid fields in code snippets. Please check your input.',
                        success: false,
                    };
                }
            }
        } catch (e) {
        }
    }
    return {
      errors: fieldErrors,
      message: 'Invalid fields. Please check your input.',
      success: false,
    };
  }

  const { title, filterCategory, description, codeBlocksJSON, tags, price, submittedByUserId } = validatedFields.data;

  const users = await getUsersFromFile();
  const storedDesigner = users.find(u => u.id === submittedByUserId);

  if (!storedDesigner) {
    return { message: 'Designer user not found.', success: false, errors: { general: ['Designer user not found.'] } };
  }
  const { passwordHash, twoFactorPinHash, ...designerInfo } = storedDesigner;

  let parsedCodeBlocksRaw: Array<{ language: string; code: string }>;
  try {
    parsedCodeBlocksRaw = JSON.parse(codeBlocksJSON);
  } catch (error) {
    return { message: 'Error parsing code blocks data.', success: false, errors: { codeBlocksJSON: ['Invalid format for code blocks.'] } };
  }

  const codeBlocks: CodeBlockItem[] = parsedCodeBlocksRaw.map((cb, index) => ({
    id: `cb-${Date.now()}-${index}`,
    language: cb.language,
    code: cb.code,
  }));

  const finalPrice = (designerInfo.canSetPrice) ? price : 0;


  const newDesign: Design = {
    id: `design-${Date.now()}`,
    title,
    filterCategory,
    description,
    codeBlocks,
    designer: designerInfo as User,
    tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
    price: finalPrice,
    submittedByUserId,
    copyCount: 0,
    likedBy: [],
  };

  try {
    await addDesignToFile(newDesign);
    revalidatePath('/');
    revalidatePath('/dashboard/designs');
    revalidatePath('/designers');
    return { message: 'Design submitted successfully!', success: true };
  } catch (error) {
    console.error("Error submitting design:", error);
    return { message: 'Failed to submit design. Please try again.', success: false, errors: { general: ['Server error.'] } };
  }
}


export async function updateDesignAction(prevState: UpdateDesignFormState, formData: FormData): Promise<UpdateDesignFormState> {
  const validatedFields = UpdateDesignSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    if (fieldErrors.codeBlocksJSON) {
        try {
            const rawCodeBlocks = JSON.parse(formData.get('codeBlocksJSON') as string);
            if(Array.isArray(rawCodeBlocks)) {
                const codeBlockErrors : CodeBlockError[] = rawCodeBlocks.map(block => {
                    const errors: CodeBlockError = {};
                    if(!block.language || block.language.trim() === '') errors.language = ["Language is required."];
                    if(!block.code || block.code.trim().length < 10) errors.code = ["Code must be at least 10 characters."];
                    return errors;
                }).filter(e => Object.keys(e).length > 0);

                if(codeBlockErrors.length > 0 && fieldErrors.codeBlocksJSON ) {
                    return {
                        errors: { ...fieldErrors, codeBlocks: codeBlockErrors, codeBlocksJSON: undefined },
                        message: 'Invalid fields in code snippets. Please check your input.',
                        success: false,
                    };
                }
            }
        } catch (e) {
        }
    }
    return {
      errors: fieldErrors,
      message: 'Invalid fields. Please check your input.',
      success: false,
    };
  }

  const { designId, title, filterCategory, description, codeBlocksJSON, tags, price, submittedByUserId } = validatedFields.data;

  const designs = await getDesignsFromFile();
  const existingDesignIndex = designs.findIndex(d => d.id === designId);

  if (existingDesignIndex === -1) {
    return { message: 'Design not found.', success: false, errors: { designId: ['Design not found.'] } };
  }

  const existingDesign = designs[existingDesignIndex];
  if (existingDesign.submittedByUserId !== submittedByUserId) {
     return { message: 'You are not authorized to edit this design.', success: false, errors: { general: ['Authorization failed.'] } };
  }

  const users = await getUsersFromFile();
  const storedDesigner = users.find(u => u.id === submittedByUserId);
  if (!storedDesigner) {
    return { message: 'Designer user not found.', success: false, errors: { general: ['Designer user not found.'] } };
  }
  const { passwordHash: designerPasswordHash, twoFactorPinHash: designerPinHash, ...designerInfo } = storedDesigner;


  let parsedCodeBlocksRaw: Array<{ language: string; code: string; id?: string }>;
  try {
    parsedCodeBlocksRaw = JSON.parse(codeBlocksJSON);
  } catch (error) {
    return { message: 'Error parsing code blocks data.', success: false, errors: { codeBlocksJSON: ['Invalid format for code blocks.'] } };
  }

  const codeBlocks: CodeBlockItem[] = parsedCodeBlocksRaw.map((cb, index) => ({
    id: cb.id || `cb-${Date.now()}-${index}`,
    language: cb.language,
    code: cb.code,
  }));

  const finalPrice = (designerInfo.canSetPrice) ? price : 0;

  const updatedDesign: Design = {
    ...existingDesign,
    title,
    filterCategory,
    description,
    codeBlocks,
    designer: designerInfo as User,
    tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
    price: finalPrice,
    likedBy: existingDesign.likedBy || [], // Preserve existing likes
  };

  try {
    await updateDesignInFile(updatedDesign);
    revalidatePath('/');
    revalidatePath('/dashboard/designs');
    revalidatePath(`/dashboard/designs/edit/${designId}`);
    revalidatePath('/designers');
    return { message: 'Design updated successfully!', success: true };
  } catch (error) {
    console.error("Error updating design:", error);
    return { message: 'Failed to update design. Please try again.', success: false, errors: { general: ['Server error.'] } };
  }
}


export async function updateProfileAction(prevState: UserUpdateProfileFormState, formData: FormData): Promise<UserUpdateProfileFormState> {
  const validatedFields = UpdateProfileSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields. Please check your input.',
      success: false,
    };
  }

  const { userId, name, avatarUrl, githubUrl, linkedinUrl, figmaUrl, isEmailPublic, isPhonePublic } = validatedFields.data;

  const users = await getUsersFromFile();
  const userToUpdate = users.find(u => u.id === userId);

  if (!userToUpdate) {
    return { message: 'User not found.', success: false, errors: { general: ['User not found.'] } };
  }

  const updatedUserData: StoredUser = {
    ...userToUpdate,
    name,
    avatarUrl: avatarUrl || userToUpdate.avatarUrl,
    githubUrl: githubUrl || "",
    linkedinUrl: linkedinUrl || "",
    figmaUrl: figmaUrl || "",
    isEmailPublic: isEmailPublic === undefined ? userToUpdate.isEmailPublic : isEmailPublic,
    isPhonePublic: isPhonePublic === undefined ? userToUpdate.isPhonePublic : isPhonePublic,
  };

  try {
    const success = await updateUserInFile(updatedUserData);
    if (!success) throw new Error("Update operation failed at server-data");
    const { passwordHash, twoFactorPinHash, ...userToReturn } = updatedUserData;
    revalidatePath('/dashboard/profile');
    revalidatePath('/dashboard');
    revalidatePath('/');
    revalidatePath('/designers');
    return { message: 'Profile updated successfully!', success: true, user: {...userToReturn, isAdmin: false, canSetPrice: userToReturn.canSetPrice || false} };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { message: 'Failed to update profile. Please try again.', success: false, errors: { general: ['Server error.'] } };
  }
}

export async function changePasswordAction(prevState: ChangePasswordFormState, formData: FormData): Promise<ChangePasswordFormState> {
  const validatedFields = ChangePasswordSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields. Please check your input.',
      success: false,
    };
  }

  const { userId, currentPassword, newPassword } = validatedFields.data;

  const users = await getUsersFromFile();
  const userToUpdate = users.find(u => u.id === userId);

  if (!userToUpdate || !userToUpdate.passwordHash) {
    return { message: 'User not found or password not set.', success: false, errors: { general: ['User not found.'] } };
  }

  const passwordMatches = await comparePassword(currentPassword, userToUpdate.passwordHash);
  if (!passwordMatches) {
    return { message: 'Incorrect current password.', success: false, errors: { currentPassword: ['Incorrect current password.'] } };
  }

  const newHashedPassword = await hashPassword(newPassword);
  const updatedUserData: StoredUser = {
    ...userToUpdate,
    passwordHash: newHashedPassword,
  };

  try {
    const success = await updateUserInFile(updatedUserData);
     if (!success) throw new Error("Update operation failed at server-data");
    revalidatePath('/dashboard/profile');
    return { message: 'Password changed successfully!', success: true };
  } catch (error) {
    console.error("Error changing password:", error);
    return { message: 'Failed to change password. Please try again.', success: false, errors: { general: ['Server error.'] } };
  }
}

export async function enableTwoFactorAction(prevState: AdminTwoFactorAuthFormState, formData: FormData): Promise<AdminTwoFactorAuthFormState> {
  const validatedFields = EnableTwoFactorSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, message: 'Invalid fields.', success: false, actionType: 'enable' };
  }

  const { userId, pin, currentPasswordFor2FA } = validatedFields.data;
  const users = await getUsersFromFile();
  const userToUpdate = users.find(u => u.id === userId);

  if (!userToUpdate || !userToUpdate.passwordHash) {
    return { message: 'User not found.', success: false, errors: { general: ['User not found.'] }, actionType: 'enable' };
  }

  const passwordMatches = await comparePassword(currentPasswordFor2FA, userToUpdate.passwordHash);
  if (!passwordMatches) {
    return { message: 'Incorrect current password.', success: false, errors: { currentPasswordFor2FA: ['Incorrect current password.'] }, actionType: 'enable' };
  }

  const hashedPin = await hashPin(pin);
  const updatedUserData: StoredUser = {
    ...userToUpdate,
    twoFactorEnabled: true,
    twoFactorPinHash: hashedPin,
  };

  try {
    await updateUserInFile(updatedUserData);
    revalidatePath('/dashboard/profile');
    return { message: '2FA enabled successfully!', success: true, actionType: 'enable' };
  } catch (error) {
    console.error("Error enabling 2FA:", error);
    return { message: 'Failed to enable 2FA.', success: false, errors: { general: ['Server error.'] }, actionType: 'enable' };
  }
}

export async function disableTwoFactorAction(prevState: AdminTwoFactorAuthFormState, formData: FormData): Promise<AdminTwoFactorAuthFormState> {
  const validatedFields = DisableTwoFactorSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, message: 'Invalid fields.', success: false, actionType: 'disable' };
  }

  const { userId, currentPasswordFor2FA } = validatedFields.data;
  const users = await getUsersFromFile();
  const userToUpdate = users.find(u => u.id === userId);

  if (!userToUpdate || !userToUpdate.passwordHash) {
    return { message: 'User not found.', success: false, errors: { general: ['User not found.'] }, actionType: 'disable' };
  }

  const passwordMatches = await comparePassword(currentPasswordFor2FA, userToUpdate.passwordHash);
  if (!passwordMatches) {
    return { message: 'Incorrect current password.', success: false, errors: { currentPasswordFor2FA: ['Incorrect current password.'] }, actionType: 'disable' };
  }

  const updatedUserData: StoredUser = {
    ...userToUpdate,
    twoFactorEnabled: false,
    twoFactorPinHash: undefined,
    failedPinAttempts: 0,
    isLocked: false,
  };

  try {
    await updateUserInFile(updatedUserData);
    revalidatePath('/dashboard/profile');
    return { message: '2FA disabled successfully!', success: true, actionType: 'disable' };
  } catch (error) {
    console.error("Error disabling 2FA:", error);
    return { message: 'Failed to disable 2FA.', success: false, errors: { general: ['Server error.'] }, actionType: 'disable' };
  }
}


export async function getAllDesignsAction(): Promise<Design[]> {
  try {
    const designs = await getDesignsFromFile();
    return designs.map(design => {
      const sanitizedDesigner = design.designer
        ? (({ passwordHash, twoFactorPinHash, ...rest }: StoredUser) => rest)(design.designer as StoredUser) as User
        : { id: 'unknown', name: 'Unknown Designer', username: '@unknown', avatarUrl: '', email: 'unknown@example.com', phone: '', twoFactorEnabled: false, failedPinAttempts: 0, isLocked: false, canSetPrice: false, githubUrl: '', linkedinUrl: '', figmaUrl: '', isEmailPublic: false, isPhonePublic: false };

      return {
        ...design,
        designer: sanitizedDesigner,
        codeBlocks: design.codeBlocks || [],
        copyCount: design.copyCount || 0,
        likedBy: design.likedBy || [],
      };
    });
  } catch (error) {
    console.error("Error fetching all designs via action:", error);
    return [];
  }
}

export async function getDesignByIdAction(id: string): Promise<Design | undefined> {
  try {
    const designs = await getDesignsFromFile();
    const design = designs.find(d => d.id === id);
    if (design) {
      const sanitizedDesigner = design.designer
        ? (({ passwordHash, twoFactorPinHash, ...rest }: StoredUser) => rest)(design.designer as StoredUser) as User
        : { id: 'unknown', name: 'Unknown Designer', username: '@unknown', avatarUrl: '', email: 'unknown@example.com', phone: '', twoFactorEnabled: false, failedPinAttempts: 0, isLocked: false, canSetPrice: false, githubUrl: '', linkedinUrl: '', figmaUrl: '', isEmailPublic: false, isPhonePublic: false };
      return {
        ...design,
        designer: sanitizedDesigner,
        codeBlocks: design.codeBlocks || [],
        copyCount: design.copyCount || 0,
        likedBy: design.likedBy || [],
      };
    }
    return undefined;
  } catch (error) {
    console.error(`Error fetching design by ID (${id}) via action:`, error);
    return undefined;
  }
}

export async function deleteDesignAction(designId: string): Promise<DeleteDesignResult> {
  if (!designId) {
    return { success: false, message: 'Design ID is required for deletion.' };
  }

  try {
    const deleted = await deleteDesignFromFile(designId);
    if (!deleted) {
      return { success: false, message: 'Design not found or already deleted.' };
    }
    revalidatePath('/dashboard/designs');
    revalidatePath('/admin/designs');
    revalidatePath('/');
    revalidatePath('/designers');
    return { success: true, message: 'Design deleted successfully.' };
  } catch (error) {
    console.error('Error deleting design via action:', error);
    return { success: false, message: 'Failed to delete design due to a server error.' };
  }
}

export async function checkAdminDataExistsAction(): Promise<{ adminExists: boolean }> {
  try {
    const admins = await getAdminUsers();
    return { adminExists: admins.length > 0 };
  } catch (error) {
    console.error("Error checking admin data:", error);
    return { adminExists: false };
  }
}

export async function createAdminAccountAction(prevState: AdminCreateAccountFormState, formData: FormData): Promise<AdminCreateAccountFormState> {
  const validatedFields = AdminCreateAccountSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields. Please check your input.',
      success: false,
    };
  }

  const { name, username, email, phone, password } = validatedFields.data;

  const existingAdmins = await getAdminUsers();
  if (existingAdmins.length > 0) {
    return { message: 'An admin account already exists. Please login.', success: false, errors: { general: ['Setup already completed.'] } };
  }
  if (existingAdmins.some(admin => admin.email === email)) {
    return { message: 'Admin with this email already exists.', success: false, errors: { email: ['Email already in use.'] } };
  }
  if (existingAdmins.some(admin => admin.username === username)) {
    return { message: 'This admin username is already taken.', success: false, errors: { username: ['Username already taken.'] } };
  }


  const hashedPassword = await hashPassword(password);
  const newAdmin: StoredAdminUser = {
    id: `admin-${Date.now()}`,
    name,
    username,
    email,
    phone,
    passwordHash: hashedPassword,
    avatarUrl: `https://placehold.co/100x100.png?text=${name.charAt(0).toUpperCase()}`,
    twoFactorEnabled: false,
  };

  try {
    await saveFirstAdminUser(newAdmin);
    revalidatePath('/admin/login');
    revalidatePath('/admin');
    return { message: 'Admin account created successfully! You can now log in.', success: true };
  } catch (error) {
    console.error("Error creating admin account:", error);
    return { message: 'Failed to create admin account. Please try again.', success: false, errors: { general: ['Server error during account creation.'] } };
  }
}

export async function getAllUsersAdminAction(): Promise<User[]> {
  try {
    const storedUsers = await getUsersFromFile();
    return storedUsers.map(user => {
      const { passwordHash, twoFactorPinHash, ...sanitizedUser } = user;
      return {
        ...sanitizedUser,
        failedPinAttempts: user.failedPinAttempts || 0,
        isLocked: user.isLocked || false,
        twoFactorEnabled: user.twoFactorEnabled || false,
        canSetPrice: user.canSetPrice || false,
        githubUrl: user.githubUrl || "",
        linkedinUrl: user.linkedinUrl || "",
        figmaUrl: user.figmaUrl || "",
        isEmailPublic: user.isEmailPublic === undefined ? false : user.isEmailPublic,
        isPhonePublic: user.isPhonePublic === undefined ? false : user.isPhonePublic,
      };
    });
  } catch (error) {
    console.error("Error fetching all users for admin:", error);
    return [];
  }
}

export async function deleteUserAdminAction(userId: string): Promise<{ success: boolean; message: string }> {
  if (!userId) {
    return { success: false, message: 'User ID is required for deletion.' };
  }

  try {
    const deleted = await deleteUserFromServerData(userId);
    if (!deleted) {
      return { success: false, message: 'User not found or already deleted.' };
    }
    revalidatePath('/admin/users');
    revalidatePath('/designers');
    return { success: true, message: 'User deleted successfully.' };
  } catch (error) {
    console.error('Error deleting user via admin action:', error);
    return { success: false, message: 'Failed to delete user due to a server error.' };
  }
}

export async function getSiteSettingsAction(): Promise<SiteSettings> {
  return getSiteSettingsFromFile();
}

export async function updateSiteSettingsAction(
  prevState: SiteSettingsFormState,
  formData: FormData
): Promise<SiteSettingsFormState> {
  const validatedFields = SiteSettingsSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid settings. Please check your input.',
      success: false,
    };
  }

  const { siteTitle, allowNewUserRegistrations, primaryHSL, accentHSL } = validatedFields.data;

  const currentSettings = await getSiteSettingsFromFile();

  const newSettings: SiteSettings = {
    ...currentSettings,
    siteTitle,
    allowNewUserRegistrations,
    themeColors: {
      primaryHSL: primaryHSL || currentSettings.themeColors.primaryHSL,
      accentHSL: accentHSL || currentSettings.themeColors.accentHSL,
    },
  };

  try {
    await saveSiteSettingsToFile(newSettings);
    revalidatePath('/admin/settings');
    revalidatePath('/'); // Site title and theme can affect all pages
    return { message: 'Site settings updated successfully!', success: true, settings: newSettings };
  } catch (error) {
    console.error('Error updating site settings:', error);
    return { message: 'Failed to update settings. Please try again.', success: false, errors: { general: ['Server error.'] } };
  }
}


export async function updateAdminProfileAction(
  prevState: UpdateAdminProfileFormState,
  formData: FormData
): Promise<UpdateAdminProfileFormState> {
  const validatedFields = UpdateAdminProfileSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields. Please check your input.',
      success: false,
    };
  }

  const { adminId, name, avatarUrl } = validatedFields.data;
  const admins = await getAdminUsers();
  const adminToUpdate = admins.find(a => a.id === adminId);

  if (!adminToUpdate) {
    return { message: 'Admin user not found.', success: false, errors: { general: ['Admin user not found.'] } };
  }

  const updatedAdminData: StoredAdminUser = {
    ...adminToUpdate,
    name,
    avatarUrl: avatarUrl || adminToUpdate.avatarUrl,
  };

  try {
    await updateAdminInFile(updatedAdminData);
    const { passwordHash, twoFactorPinHash, ...adminToReturn } = updatedAdminData;
    revalidatePath('/admin/account-settings');
    return { message: 'Admin profile updated successfully!', success: true, adminUser: adminToReturn };
  } catch (error) {
    console.error("Error updating admin profile:", error);
    return { message: 'Failed to update admin profile.', success: false, errors: { general: ['Server error.'] } };
  }
}

export async function changeAdminPasswordAction(
  prevState: ChangeAdminPasswordFormState,
  formData: FormData
): Promise<ChangeAdminPasswordFormState> {
  const validatedFields = ChangeAdminPasswordSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields. Please check your input.',
      success: false,
    };
  }

  const { adminId, currentPassword, newPassword } = validatedFields.data;
  const admins = await getAdminUsers();
  const adminToUpdate = admins.find(a => a.id === adminId);

  if (!adminToUpdate || !adminToUpdate.passwordHash) {
    return { message: 'Admin user not found or password not set.', success: false, errors: { general: ['Admin user not found.'] } };
  }

  const passwordMatches = await comparePassword(currentPassword, adminToUpdate.passwordHash);
  if (!passwordMatches) {
    return { message: 'Incorrect current password.', success: false, errors: { currentPassword: ['Incorrect current password.'] } };
  }

  const newHashedPassword = await hashPassword(newPassword);
  const updatedAdminData: StoredAdminUser = {
    ...adminToUpdate,
    passwordHash: newHashedPassword,
  };

  try {
    await updateAdminInFile(updatedAdminData);
    revalidatePath('/admin/account-settings');
    return { message: 'Admin password changed successfully!', success: true };
  } catch (error) {
    console.error("Error changing admin password:", error);
    return { message: 'Failed to change admin password.', success: false, errors: { general: ['Server error.'] } };
  }
}

export async function enableAdminTwoFactorAction(
  prevState: AdminTwoFactorAuthFormState,
  formData: FormData
): Promise<AdminTwoFactorAuthFormState> {
  const validatedFields = EnableAdminTwoFactorSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, message: 'Invalid fields.', success: false, actionType: 'enable' };
  }

  const { adminId, pin, currentPasswordFor2FA } = validatedFields.data;
  const admins = await getAdminUsers();
  const adminToUpdate = admins.find(a => a.id === adminId);

  if (!adminToUpdate || !adminToUpdate.passwordHash) {
    return { message: 'Admin user not found.', success: false, errors: { general: ['Admin user not found.'] }, actionType: 'enable' };
  }

  const passwordMatches = await comparePassword(currentPasswordFor2FA, adminToUpdate.passwordHash);
  if (!passwordMatches) {
    return { message: 'Incorrect current password.', success: false, errors: { currentPasswordFor2FA: ['Incorrect current password.'] }, actionType: 'enable' };
  }

  const hashedPin = await hashPin(pin);
  const updatedAdminData: StoredAdminUser = {
    ...adminToUpdate,
    twoFactorEnabled: true,
    twoFactorPinHash: hashedPin,
  };

  try {
    await updateAdminInFile(updatedAdminData);
    revalidatePath('/admin/account-settings');
    return { message: 'Admin 2FA enabled successfully!', success: true, actionType: 'enable' };
  } catch (error) {
    console.error("Error enabling admin 2FA:", error);
    return { message: 'Failed to enable admin 2FA.', success: false, errors: { general: ['Server error.'] }, actionType: 'enable' };
  }
}

export async function disableAdminTwoFactorAction(
  prevState: AdminTwoFactorAuthFormState,
  formData: FormData
): Promise<AdminTwoFactorAuthFormState> {
  const validatedFields = DisableAdminTwoFactorSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, message: 'Invalid fields.', success: false, actionType: 'disable' };
  }

  const { adminId, currentPasswordFor2FA } = validatedFields.data;
  const admins = await getAdminUsers();
  const adminToUpdate = admins.find(a => a.id === adminId);

  if (!adminToUpdate || !adminToUpdate.passwordHash) {
    return { message: 'Admin user not found.', success: false, errors: { general: ['Admin user not found.'] }, actionType: 'disable' };
  }

  const passwordMatches = await comparePassword(currentPasswordFor2FA, adminToUpdate.passwordHash);
  if (!passwordMatches) {
    return { message: 'Incorrect current password.', success: false, errors: { currentPasswordFor2FA: ['Incorrect current password.'] }, actionType: 'disable' };
  }

  const updatedAdminData: StoredAdminUser = {
    ...adminToUpdate,
    twoFactorEnabled: false,
    twoFactorPinHash: undefined,
  };

  try {
    await updateAdminInFile(updatedAdminData);
    revalidatePath('/admin/account-settings');
    return { message: 'Admin 2FA disabled successfully!', success: true, actionType: 'disable' };
  } catch (error) {
    console.error("Error disabling admin 2FA:", error);
    return { message: 'Failed to disable admin 2FA.', success: false, errors: { general: ['Server error.'] }, actionType: 'disable' };
  }
}

export async function getPageContentAction(pageKey: PageContentKeys): Promise<any> {
  try {
    const allContent = await getPageContentFromFile();
    if (allContent.hasOwnProperty(pageKey)) {
      return allContent[pageKey];
    }
    console.warn(`Content for key "${pageKey}" not found in getPageContentAction.`);
    switch (pageKey) {
      case 'aboutUs': return {} as AboutUsContent;
      case 'support': return {} as SupportPageContent;
      case 'guidelines': return { keyAreas: [] } as GuidelinesPageContent;
      case 'topDesigners': return {} as TopDesignersPageContent;
      case 'teamMembers': return { founder: {}, coFounder: {} } as TeamMembersContent;
      default: return null;
    }
  } catch (error) {
    console.error(`Error in getPageContentAction for key "${pageKey}":`, error);
    switch (pageKey) {
      case 'aboutUs': return {} as AboutUsContent;
      case 'support': return {} as SupportPageContent;
      case 'guidelines': return { keyAreas: [] } as GuidelinesPageContent;
      case 'topDesigners': return {} as TopDesignersPageContent;
      case 'teamMembers': return { founder: {}, coFounder: {} } as TeamMembersContent;
      default: return null;
    }
  }
}

export async function updatePageContentAction<T extends PageContentKeys>(
  pageKey: T,
  formData: FormData
): Promise<UpdatePageContentFormState<PageContentData[T]>> {
  const schema = pageContentSchemasMap[pageKey];
  if (!schema) {
    return { message: `No validation schema found for page: ${pageKey}`, success: false, errors: { general: ["Configuration error."] } };
  }

  let rawData = Object.fromEntries(formData.entries());

  if (pageKey === 'aboutUs') {
    const offerItems: { title: string; description: string }[] = [];
    let i = 0;
    while(rawData[`offerItems[${i}].title`] !== undefined || rawData[`offerItems[${i}].description`] !== undefined) {
      offerItems.push({
        title: (rawData[`offerItems[${i}].title`] as string) || '',
        description: (rawData[`offerItems[${i}].description`] as string) || ''
      });
      delete rawData[`offerItems[${i}].title`];
      delete rawData[`offerItems[${i}].description`];
      i++;
    }
    if (offerItems.length > 0) {
      rawData.offerItems = offerItems;
    } else if (!rawData.offerItems) {
      rawData.offerItems = [];
    }
  }


  if (pageKey === 'guidelines' && rawData.keyAreasJSON && typeof rawData.keyAreasJSON === 'string') {
      try {
          const parsedKeyAreas = JSON.parse(rawData.keyAreasJSON);
          if (Array.isArray(parsedKeyAreas)) {
            rawData.keyAreas = parsedKeyAreas;
          } else {
             rawData.keyAreas = [];
          }
      } catch (e) {
          if(!rawData.keyAreas) rawData.keyAreas = [];
      }
  } else if (pageKey === 'guidelines' && !rawData.keyAreas) {
    rawData.keyAreas = [];
  }

  let teamDataForValidation = { ...rawData };
  if (pageKey === 'teamMembers') {
    const founderFile = formData.get('founderImageFile') as File | null;
    const coFounderFile = formData.get('coFounderImageFile') as File | null;
    
    teamDataForValidation.founderImageFile = founderFile && founderFile.size > 0 ? founderFile : undefined;
    teamDataForValidation.coFounderImageFile = coFounderFile && coFounderFile.size > 0 ? coFounderFile : undefined;

    teamDataForValidation.founder = {
      name: rawData['founder.name'], title: rawData['founder.title'], bio: rawData['founder.bio'],
      imageUrl: rawData['founder.existingImageUrl'],
      imageAlt: rawData['founder.imageAlt'], imageDataAiHint: rawData['founder.imageDataAiHint'],
      githubUrl: rawData['founder.githubUrl'], linkedinUrl: rawData['founder.linkedinUrl'], emailAddress: rawData['founder.emailAddress'],
    };
    teamDataForValidation.coFounder = {
      name: rawData['coFounder.name'], title: rawData['coFounder.title'], bio: rawData['coFounder.bio'],
      imageUrl: rawData['coFounder.existingImageUrl'],
      imageAlt: rawData['coFounder.imageAlt'], imageDataAiHint: rawData['coFounder.imageDataAiHint'],
      githubUrl: rawData['coFounder.githubUrl'], linkedinUrl: rawData['coFounder.linkedinUrl'], emailAddress: rawData['coFounder.emailAddress'],
    };
  }


  const validatedFields = schema.safeParse(teamDataForValidation);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors as any,
      message: 'Invalid fields. Please check your input.',
      success: false,
    };
  }
  
  const contentToSave = { ...validatedFields.data };

  if (pageKey === 'teamMembers') {
    const data = validatedFields.data as any;
    
    const founderFile = data.founderImageFile as File | undefined;
    if (founderFile && founderFile.size > 0) {
      const buffer = Buffer.from(await founderFile.arrayBuffer());
      const fileExtension = path.extname(founderFile.name);
      contentToSave.founder.imageUrl = await saveTeamMemberImage(buffer, 'founder', fileExtension);
    } else {
      contentToSave.founder.imageUrl = formData.get('founder.existingImageUrl') as string || contentToSave.founder.imageUrl;
    }
    delete contentToSave.founderImageFile;

    const coFounderFile = data.coFounderImageFile as File | undefined;
    if (coFounderFile && coFounderFile.size > 0) {
      const buffer = Buffer.from(await coFounderFile.arrayBuffer());
      const fileExtension = path.extname(coFounderFile.name);
      contentToSave.coFounder.imageUrl = await saveTeamMemberImage(buffer, 'coFounder', fileExtension);
    } else {
       contentToSave.coFounder.imageUrl = formData.get('coFounder.existingImageUrl') as string || contentToSave.coFounder.imageUrl;
    }
    delete contentToSave.coFounderImageFile;
    
    delete contentToSave['founder.existingImageUrl'];
    delete contentToSave['coFounder.existingImageUrl'];
  }


  try {
    await savePageContentToFile(pageKey, contentToSave);
    const publicPath = pageKey === 'topDesigners' ? '/designers' : (pageKey === 'teamMembers' ? '/about' : `/${pageKey}`);
    revalidatePath(publicPath);
    revalidatePath(`/admin/edit-content/${pageKey}`);

    return { message: `${pageKey.charAt(0).toUpperCase() + pageKey.slice(1)} content updated successfully!`, success: true, content: contentToSave as PageContentData[T] };
  } catch (error) {
    console.error(`Error updating page content for ${pageKey}:`, error);
    const typedError = error as {code?: string};
    if (typedError.code === 'ENOENT') {
       return { message: `Failed to save image. Please ensure storage is available and try again.`, success: false, errors: { general: ['File system error.'] } };
    }
    return { message: `Failed to update ${pageKey} content. Please try again.`, success: false, errors: { general: ['Server error.'] } };
  }
}

export async function updateSiteLogoAction(prevState: SiteLogoUploadState, formData: FormData): Promise<SiteLogoUploadState> {
  const validatedFields = SiteLogoSchema.safeParse({ logoFile: formData.get('logoFile') });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid file. Please check the requirements.',
      success: false,
    };
  }

  const { logoFile } = validatedFields.data;

  try {
    const buffer = Buffer.from(await logoFile.arrayBuffer());
    const fileExtension = path.extname(logoFile.name) || '.png';
    const fileName = `site_logo${fileExtension}`;
    const filePath = await saveSiteLogoToServer(buffer, fileName);

    revalidatePath('/');
    revalidatePath('/admin/edit-content/logo');

    return { message: 'Site logo updated successfully!', success: true, filePath };
  } catch (error) {
    console.error('Error uploading site logo:', error);
    return { message: 'Failed to upload logo. Please try again.', success: false, errors: { general: ['Server error during upload.'] } };
  }
}

export async function adminSetUser2FAStatusAction(
  prevState: AdminSetUser2FAStatusFormState,
  formData: FormData
): Promise<AdminSetUser2FAStatusFormState> {
  const adminToken = cookies().get(ADMIN_AUTH_COOKIE_NAME_FOR_ACTIONS)?.value;
  if (!adminToken) {
    return { message: "Admin authorization failed.", success: false, errors: { general: ["Not authorized."] } };
  }

  const validatedFields = AdminSetUser2FAStatusSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, message: 'Invalid input.', success: false };
  }

  const { userId, enable } = validatedFields.data;
  const users = await getUsersFromFile();
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return { message: 'User not found.', success: false, errors: { userId: ['User not found.'] } };
  }

  const userToUpdate = users[userIndex];
  userToUpdate.twoFactorEnabled = enable;
  if (!enable) {
    userToUpdate.twoFactorPinHash = undefined;
    userToUpdate.failedPinAttempts = 0;
    userToUpdate.isLocked = false;
  }

  try {
    await updateUserInFile(userToUpdate);
    revalidatePath('/admin/users');
    const { passwordHash, twoFactorPinHash, ...userToReturn } = userToUpdate;
    return { message: `User 2FA status ${enable ? 'enabled' : 'disabled'} successfully.`, success: true, updatedUser: {...userToReturn, canSetPrice: userToReturn.canSetPrice || false} };
  } catch (error) {
    console.error("Error setting user 2FA status by admin:", error);
    return { message: 'Failed to update user 2FA status.', success: false, errors: { general: ['Server error.'] } };
  }
}

export async function adminSetUserCanSetPriceAction(
  prevState: AdminSetUserCanSetPriceFormState,
  formData: FormData
): Promise<AdminSetUserCanSetPriceFormState> {
  const adminToken = cookies().get(ADMIN_AUTH_COOKIE_NAME_FOR_ACTIONS)?.value;
  if (!adminToken) {
    return { message: "Admin authorization failed.", success: false, errors: { general: ["Not authorized."] } };
  }

  const validatedFields = AdminSetUserCanSetPriceSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, message: 'Invalid input.', success: false };
  }

  const { userId, canSetPrice } = validatedFields.data;
  const users = await getUsersFromFile();
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return { message: 'User not found.', success: false, errors: { userId: ['User not found.'] } };
  }

  const userToUpdate = users[userIndex];
  userToUpdate.canSetPrice = canSetPrice;

  try {
    await updateUserInFile(userToUpdate);
    revalidatePath('/admin/users');
    revalidatePath('/dashboard/designs/submit'); // Revalidate for the user who might now be able to set prices
    revalidatePath(`/dashboard/designs/edit/[designId]`); // For existing designs
    const { passwordHash, twoFactorPinHash, ...userToReturn } = userToUpdate;
    return { message: `User's ability to set prices ${canSetPrice ? 'enabled' : 'disabled'} successfully.`, success: true, updatedUser: {...userToReturn, canSetPrice: userToReturn.canSetPrice || false} };
  } catch (error) {
    console.error("Error setting user's price setting ability by admin:", error);
    return { message: 'Failed to update user price setting ability.', success: false, errors: { general: ['Server error.'] } };
  }
}

export async function incrementDesignCopyCountAction(designId: string): Promise<IncrementCopyCountResult> {
  if (!designId) {
    return { success: false, message: 'Design ID is required.' };
  }

  try {
    const designs = await getDesignsFromFile();
    const designIndex = designs.findIndex(d => d.id === designId);

    if (designIndex === -1) {
      return { success: false, message: 'Design not found.' };
    }

    const designToUpdate = designs[designIndex];
    designToUpdate.copyCount = (designToUpdate.copyCount || 0) + 1;

    await saveDesignsToFile(designs);
    // Revalidate paths that might display copy counts or rankings
    revalidatePath('/');
    revalidatePath('/designers');
    // No need to revalidate specific design detail pages unless they show copy count
    
    return { success: true, newCount: designToUpdate.copyCount };
  } catch (error) {
    console.error(`Error incrementing copy count for design ${designId}:`, error);
    return { success: false, message: 'Server error while incrementing copy count.' };
  }
}


export async function toggleLikeDesignAction(designId: string, userId: string): Promise<ToggleLikeDesignResult> {
  if (!designId || !userId) {
    return { success: false, message: 'Design ID and User ID are required.' };
  }

  try {
    const designs = await getDesignsFromFile();
    const designIndex = designs.findIndex(d => d.id === designId);

    if (designIndex === -1) {
      return { success: false, message: 'Design not found.' };
    }

    const designToUpdate = designs[designIndex];
    if (!designToUpdate.likedBy) {
      designToUpdate.likedBy = [];
    }

    const userIndexInLikes = designToUpdate.likedBy.indexOf(userId);
    let isLikedByCurrentUser;

    if (userIndexInLikes > -1) {
      // User has already liked, so unlike
      designToUpdate.likedBy.splice(userIndexInLikes, 1);
      isLikedByCurrentUser = false;
    } else {
      // User has not liked, so like
      designToUpdate.likedBy.push(userId);
      isLikedByCurrentUser = true;
    }

    await saveDesignsToFile(designs);
    revalidatePath('/'); // Revalidate homepage if it shows likes
    revalidatePath(`/designers`); // Revalidate designers page for ranking
    revalidatePath(`/dashboard/designs`); // Revalidate user's designs
    // Consider revalidating specific design detail pages if they show live like counts

    return {
      success: true,
      newLikeCount: designToUpdate.likedBy.length,
      isLikedByCurrentUser,
    };
  } catch (error) {
    console.error(`Error toggling like for design ${designId} by user ${userId}:`, error);
    return { success: false, message: 'Server error while toggling like.' };
  }
}
