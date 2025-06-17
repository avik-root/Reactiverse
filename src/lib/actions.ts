
'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import path from 'path';
import {
  pageContentSchemasMap,
  ValidImageFileSchema,
  AvatarFileSchema,
  HSLColorSchema,
  CodeBlockSchema as SharedCodeBlockSchema,
  FAQItemSchema,
  VerificationApplicationSchema
} from './form-schemas';
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
  saveUserAvatar,
  saveAdminAvatar,
  savePageContentImage,
  getForumCategoriesFromFile,
  addForumCategoryToFile as addForumCategoryToServerData,
  saveForumCategoriesToFile,
  getNewsletterSubscribersFromFile,
  addSubscriberToFile,
  getUsersForumData,
  saveUsersForumData,
  getAnnouncementsData,
  saveAnnouncementsData,
  getSupportForumData,
  saveSupportForumData,
  addForumTopicToFile as addForumTopicToServerFile,
  addPostToTopic,
  deleteTopic as deleteTopicFromServerData,
  deletePostFromTopic as deletePostFromServerData,
  updateAnnouncementInFile,
  getVerificationRequestsFromFile,
  addVerificationRequestToFile,
  updateVerificationRequestInFile,
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
  AdminSetUserVerificationStatusFormState,
  TeamMembersContent,
  TeamMember,
  UpdateProfileFormState as UserUpdateProfileFormState,
  IncrementCopyCountResult,
  ToggleLikeDesignResult,
  ForumCategory,
  AddForumCategoryFormState,
  NewsletterSubscriber,
  SubscribeToNewsletterFormState,
  ForumTopic,
  CreateTopicFormState,
  ForumPost,
  AdminDeleteTopicResult,
  CreatePostFormState,
  AdminDeletePostResult,
  UpdateAdminAnnouncementFormState,
  VerificationRequest,
  ApplyForVerificationFormState,
  AdminApproveVerificationFormState,
  AdminRejectVerificationFormState,
} from './types';
import { revalidatePath } from 'next/cache';
import { hashPassword, comparePassword, hashPin, comparePin } from './auth-utils';

const ADMIN_AUTH_COOKIE_NAME_FOR_ACTIONS = 'admin-auth-token';
const MAX_PIN_ATTEMPTS = 5;
const ADMIN_DEFAULT_AVATAR = 'https://placehold.co/40x40.png?text=A';

// Helper to get a map of admin IDs to their current avatar URLs
async function getAdminAvatarMap(): Promise<Map<string, string>> {
  const admins = await getAdminUsers();
  return new Map(admins.map(admin => [admin.id, admin.avatarUrl || ADMIN_DEFAULT_AVATAR]));
}


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
  const LoginSchema = z.object({
    identifier: z.string().min(1, { message: 'Username or email is required.' }).optional(), // Optional for PIN stage
    password: z.string().min(1, { message: 'Password is required.' }).optional(), // Optional for PIN stage
    pin: z.string().length(6, { message: 'PIN must be 6 digits.' }).regex(/^\d{6}$/, "PIN must be 6 digits.").optional(),
    userIdForPin: z.string().optional(),
  });
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

  if (userIdForPin && pin) { // PIN verification stage
    targetUser = users.find(u => u.id === userIdForPin);
    if (!targetUser) {
      return { message: 'User not found for PIN verification.', errors: { general: ['An error occurred. Please try logging in again.'] } };
    }

    if (targetUser.isLocked) {
      return { message: 'Your account is locked due to too many failed 2FA attempts. Please contact support.', accountLocked: true, errors: { general: ['Account locked.'] } };
    }

    if (!targetUser.twoFactorEnabled || !targetUser.twoFactorPinHash) {
      return { message: '2FA is not enabled for this user or PIN not set up.', errors: { general: ['2FA error. Please try logging in again.'] }, requiresPin: true, userIdForPin: targetUser.id };
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
    targetUser.failedPinAttempts = 0; // Reset on successful PIN
    await updateUserInFile(targetUser);
    const { passwordHash, twoFactorPinHash: removedPinHash, ...userToReturn } = targetUser;
    return { message: 'Login successful!', user: {...userToReturn, isAdmin: false, canSetPrice: userToReturn.canSetPrice || false} };

  } else if (identifier && password) { // Initial login (username/password) stage
    targetUser = users.find(u => (u.email === identifier || u.username === identifier));
    if (!targetUser || !targetUser.passwordHash) {
      return { message: 'Invalid credentials.', errors: { general: ['Invalid username/email or password.'] } };
    }

    if (targetUser.isLocked) {
      return { message: 'Your account is locked. Please contact support to unlock it.', accountLocked: true, errors: { general: ['Account locked.'] } };
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
      targetUser.failedPinAttempts = 0; // Reset just in case, though not strictly necessary if 2FA is off
      await updateUserInFile(targetUser);
      const { passwordHash, twoFactorPinHash: removedPinHash, ...userToReturn } = targetUser;
      return { message: 'Login successful!', user: {...userToReturn, isAdmin: false, canSetPrice: userToReturn.canSetPrice || false} };
    }
  } else {
    // This case should not be reached if form validation works for either stage
    return { message: 'Invalid login attempt.', errors: { general: ['Please provide credentials or PIN.']}};
  }
}

export async function signupUser(prevState: SignupFormState, formData: FormData): Promise<SignupFormState> {
  const SignupSchema = z.object({
    name: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
    username: z.string()
      .min(4, { message: 'Username must be at least 3 characters plus @.' })
      .regex(/^@[a-zA-Z0-9_]+$/, { message: 'Username must start with @ and contain only letters, numbers, or underscores.'}),
    email: z.string().email({ message: 'Invalid email address.' }).endsWith('@gmail.com', { message: 'Only @gmail.com addresses are allowed.' }),
    phone: z.string().min(10, { message: 'Please enter a valid phone number with country code.' })
      .regex(/^\+[1-9]\d{1,14}$/, { message: 'Phone number must start with + and country code (e.g., +1234567890).' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
  });
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
    isVerified: false, // New users are not verified by default
  };

  await saveUserToFile(newUser);
  const { passwordHash, twoFactorPinHash, ...userToReturnForState } = newUser;

  return { message: 'Signup successful! Please log in.', user: {...userToReturnForState, isAdmin: false, canSetPrice: newUser.canSetPrice} };
}

export async function loginAdmin(prevState: AdminLoginFormState, formData: FormData): Promise<AdminLoginFormState> {
  const AdminLoginSchema = z.object({
    username: z.string().min(1, { message: 'Username is required.' }).optional(),
    password: z.string().min(1, { message: 'Password is required.' }).optional(),
    pin: z.string().length(6, { message: 'PIN must be 6 digits.' }).regex(/^\d{6}$/, "PIN must be 6 digits.").optional(),
    adminIdForPin: z.string().optional(),
  });
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
    maxAge: 0, // Session cookie
    sameSite: 'lax',
  });

  const { passwordHash, twoFactorPinHash, ...adminUserToReturn } = targetAdmin;
  return { message: 'Admin login successful!', adminUser: { ...adminUserToReturn, isAdmin: true } };
}


export async function logoutAdminAction(): Promise<{ success: boolean }> {
  try {
    cookies().set(ADMIN_AUTH_COOKIE_NAME_FOR_ACTIONS, '', {
      path: '/admin',
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return { success: true };
  } catch (error) {
    console.error('Error during admin logout action:', error);
    return { success: false };
  }
}

export async function submitDesignAction(prevState: AddDesignFormState, formData: FormData): Promise<AddDesignFormState> {
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
            (item) => SharedCodeBlockSchema.safeParse(item).success // CodeBlockSchema imported from form-schemas
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
           // Fall through to generic error
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
  const UpdateDesignSchema = z.object({
    title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
    filterCategory: z.string().min(3, {message: 'Filter category must be at least 3 characters.'}),
    description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
    codeBlocksJSON: z.string().refine(
      (val) => {
        try {
          const arr = JSON.parse(val);
          if (!Array.isArray(arr) || arr.length === 0) return false;
          return arr.every(
            (item) => SharedCodeBlockSchema.safeParse(item).success // CodeBlockSchema imported
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
    designId: z.string().min(1, { message: 'Design ID is required for update.' }),
  });
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
           // Fall through
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
    likedBy: existingDesign.likedBy || [],
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
  const UpdateProfileSchema = z.object({
    userId: z.string(),
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    avatarFile: AvatarFileSchema, // Imported from form-schemas
    githubUrl: z.string().url("Invalid GitHub URL format.").or(z.literal('')).optional(),
    linkedinUrl: z.string().url("Invalid LinkedIn URL format.").or(z.literal('')).optional(),
    figmaUrl: z.string().url("Invalid Figma URL format.").or(z.literal('')).optional(),
    isEmailPublic: z.preprocess((val) => String(val).toLowerCase() === 'on' || String(val).toLowerCase() === 'true', z.boolean().default(false)),
    isPhonePublic: z.preprocess((val) => String(val).toLowerCase() === 'on' || String(val).toLowerCase() === 'true', z.boolean().default(false)),
  });

  const rawData = Object.fromEntries(formData.entries());
  const avatarFile = formData.get('avatarFile') as File | null;

  const dataToValidate = {
    ...rawData,
    avatarFile: avatarFile && avatarFile.size > 0 ? avatarFile : undefined,
  };

  const validatedFields = UpdateProfileSchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields. Please check your input.',
      success: false,
    };
  }

  const { userId, name, githubUrl, linkedinUrl, figmaUrl, isEmailPublic, isPhonePublic } = validatedFields.data;
  const uploadedAvatarFile = validatedFields.data.avatarFile;

  const users = await getUsersFromFile();
  const userToUpdate = users.find(u => u.id === userId);

  if (!userToUpdate) {
    return { message: 'User not found.', success: false, errors: { general: ['User not found.'] } };
  }

  let newAvatarUrl = userToUpdate.avatarUrl;
  if (uploadedAvatarFile) {
    try {
      const buffer = Buffer.from(await uploadedAvatarFile.arrayBuffer());
      const fileExtension = path.extname(uploadedAvatarFile.name);
      newAvatarUrl = await saveUserAvatar(buffer, userId, fileExtension);
    } catch (error) {
      console.error("Error saving user avatar:", error);
      return { message: 'Failed to save avatar image.', success: false, errors: { avatarFile: ['Could not save image.'] } };
    }
  }

  const updatedUserData: StoredUser = {
    ...userToUpdate,
    name,
    avatarUrl: newAvatarUrl,
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

export async function changePasswordAction(prevState: ChangeAdminPasswordFormState, formData: FormData): Promise<ChangeAdminPasswordFormState> {
  const ChangePasswordSchema = z.object({
    userId: z.string(),
    currentPassword: z.string().min(1, {message: "Current password is required."}),
    newPassword: z.string().min(8, { message: 'New password must be at least 8 characters.' }),
    confirmPassword: z.string(),
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match.",
    path: ['confirmPassword'],
  });
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

export type TwoFactorAuthFormState = { // Ensure this is exported if used in components
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

export async function enableTwoFactorAction(prevState: TwoFactorAuthFormState, formData: FormData): Promise<TwoFactorAuthFormState> {
  const EnableTwoFactorSchema = z.object({
    userId: z.string(),
    pin: z.string().length(6, { message: 'PIN must be 6 digits.' }).regex(/^\d{6}$/, "PIN must be 6 digits."),
    confirmPin: z.string(),
    currentPasswordFor2FA: z.string().min(1, {message: "Current password is required to enable 2FA."}),
  }).refine(data => data.pin === data.confirmPin, {
    message: "PINs don't match.",
    path: ['confirmPin'],
  });
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

export async function disableTwoFactorAction(prevState: TwoFactorAuthFormState, formData: FormData): Promise<TwoFactorAuthFormState> {
  const DisableTwoFactorSchema = z.object({
    userId: z.string(),
    currentPasswordFor2FA: z.string().min(1, {message: "Current password is required to disable 2FA."}),
  });
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
    const users = await getUsersFromFile();
    const adminAvatarMap = await getAdminAvatarMap();
    const usersMap = new Map(users.map(u => [u.id, u]));

    const defaultDesigner: User = {
      id: 'unknown',
      name: 'Unknown Designer',
      username: '@unknown',
      avatarUrl: '',
      email: 'unknown@example.com',
      phone: '',
      twoFactorEnabled: false,
      failedPinAttempts: 0,
      isLocked: false,
      canSetPrice: false,
      githubUrl: '',
      linkedinUrl: '',
      figmaUrl: '',
      isEmailPublic: false,
      isPhonePublic: false,
      isVerified: false,
    };

    return designs.map(design => {
      const designerId = design.submittedByUserId || '';
      let finalDesigner: User;

      if (designerId.startsWith('admin-')) {
        finalDesigner = {
          ...defaultDesigner,
          id: designerId,
          name: "Admin",
          username: "@admin",
          avatarUrl: adminAvatarMap.get(designerId) || ADMIN_DEFAULT_AVATAR,
          isVerified: true, // Admins are implicitly "verified" in this context
        };
      } else {
        const storedDesigner = usersMap.get(designerId);
        if (storedDesigner) {
          const { passwordHash, twoFactorPinHash, ...rest } = storedDesigner;
          finalDesigner = {
              ...rest,
              failedPinAttempts: rest.failedPinAttempts || 0,
              isLocked: rest.isLocked || false,
              canSetPrice: rest.canSetPrice || false,
              twoFactorEnabled: rest.twoFactorEnabled || false,
              isEmailPublic: rest.isEmailPublic === undefined ? false : rest.isEmailPublic,
              isPhonePublic: rest.isPhonePublic === undefined ? false : rest.isPhonePublic,
              isVerified: rest.isVerified === undefined ? false : rest.isVerified,
          } as User;
        } else {
          finalDesigner = defaultDesigner;
        }
      }

      return {
        ...design,
        designer: finalDesigner,
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
      const users = await getUsersFromFile();
      const adminAvatarMap = await getAdminAvatarMap();
      const designerId = design.submittedByUserId || '';
      let finalDesigner: User;

      if (designerId.startsWith('admin-')) {
        finalDesigner = {
          id: designerId, name: "Admin", username: "@admin",
          avatarUrl: adminAvatarMap.get(designerId) || ADMIN_DEFAULT_AVATAR,
          email: 'admin@reactiverse.com', phone: '', twoFactorEnabled: true,
          failedPinAttempts: 0, isLocked: false, canSetPrice: true,
          githubUrl: '', linkedinUrl: '', figmaUrl: '',
          isEmailPublic: false, isPhonePublic: false,
          isVerified: true, // Admins are implicitly "verified"
        };
      } else {
        const storedDesigner = users.find(u => u.id === designerId);
        if (storedDesigner) {
          const { passwordHash, twoFactorPinHash, ...rest } = storedDesigner;
           finalDesigner = {
              ...rest,
              failedPinAttempts: rest.failedPinAttempts || 0,
              isLocked: rest.isLocked || false,
              canSetPrice: rest.canSetPrice || false,
              twoFactorEnabled: rest.twoFactorEnabled || false,
              isEmailPublic: rest.isEmailPublic === undefined ? false : rest.isEmailPublic,
              isPhonePublic: rest.isPhonePublic === undefined ? false : rest.isPhonePublic,
              isVerified: rest.isVerified === undefined ? false : rest.isVerified,
          } as User;
        } else {
          finalDesigner = {
            id: 'unknown', name: 'Unknown Designer', username: '@unknown', avatarUrl: '',
            email: 'unknown@example.com', phone: '', twoFactorEnabled: false,
            failedPinAttempts: 0, isLocked: false, canSetPrice: false,
            githubUrl: '', linkedinUrl: '', figmaUrl: '',
            isEmailPublic: false, isPhonePublic: false, isVerified: false,
          };
        }
      }
      return {
        ...design,
        designer: finalDesigner,
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
   const AdminCreateAccountSchema = z.object({
    name: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
    username: z.string().min(4, { message: 'Username must be at least 4 characters.' }).regex(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers, or underscores.'}),
    email: z.string().email({ message: 'Invalid email address.' }).endsWith('@gmail.com', { message: 'Only @gmail.com addresses are allowed.' }),
    phone: z.string().min(10, { message: 'Please enter a valid phone number with country code.' })
      .regex(/^\+[1-9]\d{1,14}$/, { message: 'Phone number must start with + and country code (e.g., +1234567890).' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
    confirmPassword: z.string(),
  }).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  });
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
        isVerified: user.isVerified === undefined ? false : user.isVerified, // Ensure isVerified is returned
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
  const SiteSettingsSchema = z.object({
    siteTitle: z.string().min(3, { message: 'Site title must be at least 3 characters.' }),
    allowNewUserRegistrations: z.preprocess((val) => val === 'on' || val === true, z.boolean()),
    primaryHSL: HSLColorSchema,
    accentHSL: HSLColorSchema,
  });
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
    revalidatePath('/');
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
  const UpdateAdminProfileSchema = z.object({
    adminId: z.string(),
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    avatarFile: AvatarFileSchema,
  });
  const rawData = Object.fromEntries(formData.entries());
  const avatarFile = formData.get('avatarFile') as File | null;

  const dataToValidate = {
    ...rawData,
    avatarFile: avatarFile && avatarFile.size > 0 ? avatarFile : undefined,
  };

  const validatedFields = UpdateAdminProfileSchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields. Please check your input.',
      success: false,
    };
  }

  const { adminId, name } = validatedFields.data;
  const uploadedAvatarFile = validatedFields.data.avatarFile;

  const admins = await getAdminUsers();
  const adminToUpdate = admins.find(a => a.id === adminId);

  if (!adminToUpdate) {
    return { message: 'Admin user not found.', success: false, errors: { general: ['Admin user not found.'] } };
  }

  let newAvatarUrl = adminToUpdate.avatarUrl;
  if (uploadedAvatarFile) {
     try {
      const buffer = Buffer.from(await uploadedAvatarFile.arrayBuffer());
      const fileExtension = path.extname(uploadedAvatarFile.name);
      newAvatarUrl = await saveAdminAvatar(buffer, adminId, fileExtension);
    } catch (error) {
      console.error("Error saving admin avatar:", error);
      return { message: 'Failed to save avatar image.', success: false, errors: { avatarFile: ['Could not save image.'] } };
    }
  }


  const updatedAdminData: StoredAdminUser = {
    ...adminToUpdate,
    name,
    avatarUrl: newAvatarUrl,
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
   const ChangeAdminPasswordSchema = z.object({
    adminId: z.string(),
    currentPassword: z.string().min(1, { message: "Current password is required." }),
    newPassword: z.string().min(8, { message: 'New password must be at least 8 characters.' }),
    confirmPassword: z.string(),
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match.",
    path: ['confirmPassword'],
  });
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
  const EnableAdminTwoFactorSchema = z.object({
    adminId: z.string(),
    pin: z.string().length(6, { message: 'PIN must be 6 digits.' }).regex(/^\d{6}$/, "PIN must be 6 digits."),
    confirmPin: z.string(),
    currentPasswordFor2FA: z.string().min(1, { message: "Current password is required to enable 2FA." }),
  }).refine(data => data.pin === data.confirmPin, {
    message: "PINs don't match.",
    path: ['confirmPin'],
  });
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
  const DisableAdminTwoFactorSchema = z.object({
    adminId: z.string(),
    currentPasswordFor2FA: z.string().min(1, { message: "Current password is required to disable 2FA." }),
  });
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
      case 'support': return { faqs: [] } as SupportPageContent;
      case 'guidelines': return { keyAreas: [] } as GuidelinesPageContent;
      case 'topDesigners': return {} as TopDesignersPageContent;
      case 'teamMembers': return { founder: {}, coFounder: {} } as TeamMembersContent;
      default: return null;
    }
  } catch (error) {
    console.error(`Error in getPageContentAction for key "${pageKey}":`, error);
    switch (pageKey) {
      case 'aboutUs': return {} as AboutUsContent;
      case 'support': return { faqs: [] } as SupportPageContent;
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
  let dataToValidate = { ...rawData };

  if (pageKey === 'aboutUs') {
    const offerItems: { title: string; description: string }[] = [];
    let i = 0;
    while(dataToValidate[`offerItems[${i}].title`] !== undefined || dataToValidate[`offerItems[${i}].description`] !== undefined) {
      offerItems.push({
        title: (dataToValidate[`offerItems[${i}].title`] as string) || '',
        description: (dataToValidate[`offerItems[${i}].description`] as string) || ''
      });
      delete dataToValidate[`offerItems[${i}].title`];
      delete dataToValidate[`offerItems[${i}].description`];
      i++;
    }
    if (offerItems.length > 0) {
      dataToValidate.offerItems = offerItems;
    } else if (!dataToValidate.offerItems) {
      dataToValidate.offerItems = [];
    }
  }

  if (pageKey === 'guidelines' && dataToValidate.keyAreasJSON && typeof dataToValidate.keyAreasJSON === 'string') {
      try {
          const parsedKeyAreas = JSON.parse(dataToValidate.keyAreasJSON as string);
          if (Array.isArray(parsedKeyAreas)) {
            dataToValidate.keyAreas = parsedKeyAreas;
          } else {
             dataToValidate.keyAreas = [];
          }
      } catch (e) {
          if(!dataToValidate.keyAreas) dataToValidate.keyAreas = [];
      }
  } else if (pageKey === 'guidelines' && !dataToValidate.keyAreas) {
    dataToValidate.keyAreas = [];
  }

  const imageFields: { formKey: string; contentKey: string; subfolder: string, baseName?: string, memberType?: 'founder' | 'coFounder' }[] = [];
  if (pageKey === 'aboutUs') {
    imageFields.push({ formKey: 'image1File', contentKey: 'image1Url', subfolder: 'about', baseName: 'mission_image' });
    imageFields.push({ formKey: 'image2File', contentKey: 'image2Url', subfolder: 'about', baseName: 'join_image' });
  } else if (pageKey === 'teamMembers') {
    imageFields.push({ formKey: 'founderImageFile', contentKey: 'founder.imageUrl', subfolder: 'team', baseName: 'founder_image', memberType: 'founder'});
    imageFields.push({ formKey: 'coFounderImageFile', contentKey: 'coFounder.imageUrl', subfolder: 'team', baseName: 'cofounder_image', memberType: 'coFounder' });
  }

  for (const imgField of imageFields) {
    const file = formData.get(imgField.formKey) as File | null;
    if (file && file.size > 0) {
      (dataToValidate as any)[imgField.formKey] = file;
    } else {
      delete (dataToValidate as any)[imgField.formKey];
    }
  }

  if (pageKey === 'teamMembers') {
    dataToValidate.founder = {
      name: rawData['founder.name'], title: rawData['founder.title'], bio: rawData['founder.bio'],
      imageUrl: rawData['founder.existingImageUrl'],
      imageAlt: rawData['founder.imageAlt'], imageDataAiHint: rawData['founder.imageDataAiHint'],
      githubUrl: rawData['founder.githubUrl'], linkedinUrl: rawData['founder.linkedinUrl'], emailAddress: rawData['founder.emailAddress'],
    };
    dataToValidate.coFounder = {
      name: rawData['coFounder.name'], title: rawData['coFounder.title'], bio: rawData['coFounder.bio'],
      imageUrl: rawData['coFounder.existingImageUrl'],
      imageAlt: rawData['coFounder.imageAlt'], imageDataAiHint: rawData['coFounder.imageDataAiHint'],
      githubUrl: rawData['coFounder.githubUrl'], linkedinUrl: rawData['coFounder.linkedinUrl'], emailAddress: rawData['coFounder.emailAddress'],
    };
  }


  const validatedFields = schema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors as any,
      message: 'Invalid fields. Please check your input.',
      success: false,
    };
  }

  const contentToSave: any = { ...validatedFields.data };

  try {
    for (const imgField of imageFields) {
        const file = (validatedFields.data as any)[imgField.formKey] as File | undefined;
        const existingUrlKey = pageKey === 'teamMembers' && imgField.memberType
                                ? `${imgField.memberType}.existingImageUrl`
                                : `existing${imgField.contentKey.charAt(0).toUpperCase() + imgField.contentKey.slice(1)}`;
        const existingUrl = formData.get(existingUrlKey) as string | null;


        let finalImageUrl = existingUrl || '';
        if (pageKey === 'teamMembers' && imgField.memberType) {
            finalImageUrl = existingUrl || (contentToSave as any)[imgField.memberType]?.imageUrl || '';
        } else if (pageKey === 'aboutUs') {
            finalImageUrl = existingUrl || (contentToSave as any)[imgField.contentKey] || '';
        }


        if (file) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const fileExtension = path.extname(file.name);
            finalImageUrl = await savePageContentImage(buffer, imgField.subfolder, imgField.baseName || imgField.formKey, fileExtension);
        }

        if (pageKey === 'teamMembers' && imgField.memberType) {
            if (!(contentToSave as any)[imgField.memberType]) (contentToSave as any)[imgField.memberType] = {};
            (contentToSave as any)[imgField.memberType].imageUrl = finalImageUrl;
            delete (contentToSave as any)[imgField.formKey];
        } else {
            (contentToSave as any)[imgField.contentKey] = finalImageUrl;
            delete (contentToSave as any)[imgField.formKey];
        }
    }
     if (pageKey === 'teamMembers') {
        delete (contentToSave as any)['founder.existingImageUrl'];
        delete (contentToSave as any)['coFounder.existingImageUrl'];
    }

  } catch(error) {
     console.error(`Error saving image for ${pageKey}:`, error);
     return { message: `Failed to save image. Please try again.`, success: false, errors: { general: ['Image saving error.'] } };
  }

  if (pageKey === 'support' && contentToSave.faqsJSON) {
    try {
      contentToSave.faqs = JSON.parse(contentToSave.faqsJSON) as FAQItem[];
      delete contentToSave.faqsJSON;
    } catch (e) {
      return { message: 'Invalid JSON format for FAQs.', success: false, errors: { faqsJSON: ['Invalid JSON.'] } };
    }
  }


  try {
    await savePageContentToFile(pageKey, contentToSave);
    const publicPath = pageKey === 'topDesigners' ? '/designers' : (pageKey === 'teamMembers' || pageKey === 'aboutUs' ? '/about' : `/${pageKey}`);
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
  const SiteLogoSchema = z.object({
    logoFile: ValidImageFileSchema.refine(file => file !== undefined, "Logo file is required."),
  });
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
  const AdminSetUser2FAStatusSchema = z.object({
    userId: z.string().min(1, "User ID is required."),
    enable: z.preprocess((val) => String(val).toLowerCase() === 'true', z.boolean()),
    adminId: z.string().min(1, "Admin ID is required for authorization."),
  });
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
    return { message: `User 2FA status ${enable ? 'enabled' : 'disabled'} successfully. ${!enable ? 'Account has been unlocked if it was locked.' : ''}`.trim(), success: true, updatedUser: {...userToReturn, canSetPrice: userToReturn.canSetPrice || false} };
  } catch (error) {
    console.error("Error setting user 2FA status by admin:", error);
    return { message: 'Failed to update user 2FA status.', success: false, errors: { general: ['Server error.'] } };
  }
}

export async function adminSetUserCanSetPriceAction(
  prevState: AdminSetUserCanSetPriceFormState,
  formData: FormData
): Promise<AdminSetUserCanSetPriceFormState> {
  const AdminSetUserCanSetPriceSchema = z.object({
    userId: z.string().min(1, "User ID is required."),
    canSetPrice: z.preprocess((val) => String(val).toLowerCase() === 'true', z.boolean()),
    adminId: z.string().min(1, "Admin ID is required for authorization."),
  });
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
    revalidatePath('/dashboard/designs/submit');
    revalidatePath(`/dashboard/designs/edit/[designId]`);
    const { passwordHash, twoFactorPinHash, ...userToReturn } = userToUpdate;
    return { message: `User's ability to set prices ${canSetPrice ? 'enabled' : 'disabled'} successfully.`, success: true, updatedUser: {...userToReturn, canSetPrice: userToReturn.canSetPrice || false} };
  } catch (error) {
    console.error("Error setting user's price setting ability by admin:", error);
    return { message: 'Failed to update user price setting ability.', success: false, errors: { general: ['Server error.'] } };
  }
}

export async function adminSetUserVerificationStatusAction(
  prevState: AdminSetUserVerificationStatusFormState,
  formData: FormData
): Promise<AdminSetUserVerificationStatusFormState> {
  const AdminSetUserVerificationStatusSchema = z.object({
    userId: z.string().min(1, "User ID is required."),
    isVerified: z.preprocess((val) => String(val).toLowerCase() === 'true', z.boolean()),
    adminId: z.string().min(1, "Admin ID is required for authorization."),
  });
  const adminToken = cookies().get(ADMIN_AUTH_COOKIE_NAME_FOR_ACTIONS)?.value;
  if (!adminToken) {
    return { message: "Admin authorization failed.", success: false, errors: { general: ["Not authorized."] } };
  }

  const validatedFields = AdminSetUserVerificationStatusSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, message: 'Invalid input.', success: false };
  }

  const { userId, isVerified } = validatedFields.data;
  const users = await getUsersFromFile();
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return { message: 'User not found.', success: false, errors: { userId: ['User not found.'] } };
  }

  const userToUpdate = users[userIndex];
  userToUpdate.isVerified = isVerified;

  try {
    await updateUserInFile(userToUpdate);
    revalidatePath('/admin/users');
    revalidatePath('/designers');
    revalidatePath('/'); // Revalidate home if verified users are featured
    const { passwordHash, twoFactorPinHash, ...userToReturn } = userToUpdate;
    return { message: `User verification status updated to ${isVerified ? 'Verified' : 'Not Verified'} successfully.`, success: true, updatedUser: {...userToReturn, isVerified} };
  } catch (error) {
    console.error("Error setting user verification status by admin:", error);
    return { message: 'Failed to update user verification status.', success: false, errors: { general: ['Server error.'] } };
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
    revalidatePath('/');
    revalidatePath('/designers');

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
      designToUpdate.likedBy.splice(userIndexInLikes, 1);
      isLikedByCurrentUser = false;
    } else {
      designToUpdate.likedBy.push(userId);
      isLikedByCurrentUser = true;
    }

    await saveDesignsToFile(designs);
    revalidatePath('/');
    revalidatePath(`/designers`);
    revalidatePath(`/dashboard/designs`);
    revalidatePath('/dashboard'); // Also revalidate user dashboard for most liked


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

export async function getForumCategoriesAction(): Promise<ForumCategory[]> {
  try {
    const categories = await getForumCategoriesFromFile();
    return categories;
  } catch (error) {
    console.error("Error fetching forum categories via action:", error);
    return [];
  }
}

export async function addForumCategoryAction(
  prevState: AddForumCategoryFormState,
  formData: FormData
): Promise<AddForumCategoryFormState> {
  const AddForumCategorySchema = z.object({
    name: z.string().min(3, "Category name must be at least 3 characters."),
    description: z.string().min(10, "Description must be at least 10 characters."),
    slug: z.string().min(3, "Slug must be at least 3 characters.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug can only contain lowercase letters, numbers, and hyphens."),
    iconName: z.enum(['MessagesSquare', 'Palette', 'Code2', 'Lightbulb', 'Megaphone', 'HelpCircle', 'Users', 'Info', 'Filter', 'LayoutList'], {
      errorMap: () => ({ message: "Please select a valid icon." })
    }),
  });
  const validatedFields = AddForumCategorySchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields. Please check your input.',
      success: false,
    };
  }

  const { name, description, slug, iconName } = validatedFields.data;
  const categories = await getForumCategoriesFromFile();

  if (categories.some(cat => cat.slug === slug)) {
    return {
      message: 'This slug is already in use. Please choose a unique slug.',
      success: false,
      errors: { slug: ['Slug already exists.'] }
    };
  }
  if (categories.some(cat => cat.name.toLowerCase() === name.toLowerCase())) {
    return {
      message: 'A category with this name already exists.',
      success: false,
      errors: { name: ['Category name already exists.'] }
    };
  }

  const newCategory: ForumCategory = {
    id: `cat-${Date.now()}`,
    name,
    description,
    slug,
    iconName,
    topicCount: 0,
    postCount: 0,
  };

  try {
    await addForumCategoryToServerData(newCategory);
    revalidatePath('/admin/forum-categories');
    revalidatePath('/community');
    return { message: 'Forum category added successfully!', success: true, category: newCategory };
  } catch (error) {
    console.error('Error adding forum category:', error);
    return {
      message: 'Failed to add category. Please try again.',
      success: false,
      errors: { general: ['Server error.'] }
    };
  }
}


export async function getCategoryBySlugAction(slug: string): Promise<ForumCategory | undefined> {
  try {
    const categories = await getForumCategoriesFromFile();
    return categories.find(category => category.slug.toLowerCase() === slug.toLowerCase());
  } catch (error) {
    console.error(`Error fetching category by slug "${slug}":`, error);
    return undefined;
  }
}

export async function getTopicsByCategoryIdAction(categoryId: string): Promise<ForumTopic[]> {
  const category = (await getForumCategoriesFromFile()).find(c => c.id === categoryId);
  if (!category) {
    console.error(`Category not found for ID: ${categoryId}`);
    return [];
  }

  let topics: ForumTopic[] = [];
  try {
    switch (category.slug) {
      case 'general-discussion':
        topics = await getUsersForumData();
        break;
      case 'announcements':
        topics = await getAnnouncementsData();
        break;
      case 'support-qa':
        topics = await getSupportForumData();
        break;
      default:
        console.warn(`No specific data source for category slug: ${category.slug}. Returning empty list.`);
        return [];
    }

    const adminAvatarMap = await getAdminAvatarMap();
    const users = await getUsersFromFile(); // Fetch all users to get verification status
    const usersMap = new Map(users.map(u => [u.id, u]));

    const processedTopics = topics.map(topic => {
      let finalTopic = { ...topic, viewCount: topic.viewCount || 0 }; // Ensure viewCount
      if (topic.createdByUserId.startsWith('admin-')) {
        finalTopic = {
          ...finalTopic,
          authorName: "Admin",
          authorAvatarUrl: adminAvatarMap.get(topic.createdByUserId) || ADMIN_DEFAULT_AVATAR,
          authorIsVerified: true, // Admins are "verified" by role
        };
      } else {
        const author = usersMap.get(topic.createdByUserId);
        finalTopic = {
          ...finalTopic,
          authorName: author?.name || topic.authorName,
          authorAvatarUrl: author?.avatarUrl || topic.authorAvatarUrl,
          authorIsVerified: author?.isVerified || false,
        };
      }
      return finalTopic;
    });

    return processedTopics.sort((a, b) => new Date(b.lastRepliedAt).getTime() - new Date(a.lastRepliedAt).getTime());
  } catch (error) {
    console.error(`Error fetching topics for category slug "${category.slug}":`, error);
    return [];
  }
}

export async function getTopicDetailsAction(topicId: string, categorySlug?: string): Promise<ForumTopic | undefined> {
  let topics: ForumTopic[] = [];
  let saveFunction: ((topics: ForumTopic[]) => Promise<void>) | null = null;
  let slugToUse = categorySlug;
  let determinedSlug = false;
  const adminAvatarMap = await getAdminAvatarMap();
  const users = await getUsersFromFile();
  const usersMap = new Map(users.map(u => [u.id, u]));

  if (!slugToUse) {
    const allCategories = await getForumCategoriesFromFile();
    for (const cat of allCategories) {
      let potentialTopics: ForumTopic[] = [];
      let currentSaveFunction: ((topics: ForumTopic[]) => Promise<void>) | null = null;
      switch (cat.slug) {
        case 'general-discussion': potentialTopics = await getUsersForumData(); currentSaveFunction = saveUsersForumData; break;
        case 'announcements': potentialTopics = await getAnnouncementsData(); currentSaveFunction = saveAnnouncementsData; break;
        case 'support-qa': potentialTopics = await getSupportForumData(); currentSaveFunction = saveSupportForumData; break;
      }
      const foundTopic = potentialTopics.find(t => t.id === topicId);
      if (foundTopic) {
        slugToUse = cat.slug;
        topics = potentialTopics;
        saveFunction = currentSaveFunction;
        determinedSlug = true;
        break;
      }
    }
    if (!determinedSlug) {
      console.warn(`getTopicDetailsAction: Topic with ID ${topicId} not found across all categories.`);
      return undefined;
    }
  }

  if (!slugToUse) {
    console.warn(`getTopicDetailsAction: Could not determine category slug for topic ID ${topicId}.`);
    return undefined;
  }

  if (!determinedSlug) { // Only fetch if not already fetched during slug determination
    try {
      switch (slugToUse) {
        case 'general-discussion': topics = await getUsersForumData(); saveFunction = saveUsersForumData; break;
        case 'announcements': topics = await getAnnouncementsData(); saveFunction = saveAnnouncementsData; break;
        case 'support-qa': topics = await getSupportForumData(); saveFunction = saveSupportForumData; break;
        default:
          console.warn(`Unknown category slug for fetching topic details: ${slugToUse}`);
          return undefined;
      }
    } catch (error) {
      console.error(`Error fetching topics for category slug "${slugToUse}" in getTopicDetailsAction:`, error);
      return undefined;
    }
  }

  const topicIndex = topics.findIndex(t => t.id === topicId);
  if (topicIndex === -1) return undefined;

  let topic = topics[topicIndex];
  
  // Increment view count
  topic.viewCount = (topic.viewCount || 0) + 1;
  if (saveFunction) {
    try {
      await saveFunction(topics); // Save the updated topics list with new view count
    } catch (error) {
      console.error(`Error saving updated view count for topic ${topicId} in category ${slugToUse}:`, error);
      // Continue even if save fails, to return the topic data
    }
  } else {
      console.warn(`No save function determined for category ${slugToUse} when incrementing view count.`);
  }


  // Process author details
  if (topic.createdByUserId.startsWith('admin-')) {
    topic = {
      ...topic,
      authorName: "Admin",
      authorAvatarUrl: adminAvatarMap.get(topic.createdByUserId) || ADMIN_DEFAULT_AVATAR,
      authorIsVerified: true,
    };
  } else {
    const author = usersMap.get(topic.createdByUserId);
    topic = {
      ...topic,
      authorName: author?.name || topic.authorName,
      authorAvatarUrl: author?.avatarUrl || topic.authorAvatarUrl,
      authorIsVerified: author?.isVerified || false,
    };
  }

  // Process post authors
  if (topic.posts && topic.posts.length > 0) {
    topic.posts = topic.posts.map(post => {
      if (post.createdByUserId.startsWith('admin-')) {
        return {
          ...post,
          authorName: "Admin",
          authorAvatarUrl: adminAvatarMap.get(post.createdByUserId) || ADMIN_DEFAULT_AVATAR,
          authorIsVerified: true,
        };
      } else {
        const postAuthor = usersMap.get(post.createdByUserId);
        return {
          ...post,
          authorName: postAuthor?.name || post.authorName,
          authorAvatarUrl: postAuthor?.avatarUrl || post.authorAvatarUrl,
          authorIsVerified: postAuthor?.isVerified || false,
        };
      }
    });
  }
  return topic;
}

export async function getPostsByTopicIdAction(topicId: string, categorySlug: string): Promise<ForumPost[]> {
  const topic = await getTopicDetailsAction(topicId, categorySlug); // This now handles admin avatar updates and verification
  return topic?.posts || [];
}


export async function subscribeToNewsletterAction(
  prevState: SubscribeToNewsletterFormState,
  formData: FormData
): Promise<SubscribeToNewsletterFormState> {
  const NewsletterSubscriptionSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email address.' }),
  });
  const validatedFields = NewsletterSubscriptionSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid email address.',
      success: false,
    };
  }

  const { email } = validatedFields.data;
  const subscribers = await getNewsletterSubscribersFromFile();

  if (subscribers.some(sub => sub.email === email)) {
    return {
      message: 'This email is already subscribed.',
      success: false,
      errors: { email: ['Already subscribed.'] }
    };
  }

  const newSubscriber: NewsletterSubscriber = {
    email,
    subscribedAt: new Date().toISOString(),
  };

  try {
    await addSubscriberToFile(newSubscriber);
    revalidatePath('/community');
    revalidatePath('/admin/subscribers');
    return { message: 'Successfully subscribed to the newsletter!', success: true };
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    return {
      message: 'Failed to subscribe. Please try again later.',
      success: false,
      errors: { general: ['Server error.'] }
    };
  }
}

export async function getNewsletterSubscribersAction(): Promise<NewsletterSubscriber[]> {
  try {
    const subscribers = await getNewsletterSubscribersFromFile();
    return subscribers.sort((a, b) => new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime());
  } catch (error) {
    console.error("Error fetching newsletter subscribers:", error);
    return [];
  }
}

export async function createForumTopicAction(
    prevState: CreateTopicFormState,
    formData: FormData,
    categoryId: string,
    categorySlug: string,
    userId: string,
    userName: string,
    userAvatarUrl?: string
): Promise<CreateTopicFormState> {
    const CreateTopicFormSchema = z.object({
      title: z.string().min(5, { message: "Title must be at least 5 characters long." }).max(150, { message: "Title cannot exceed 150 characters." }),
      content: z.string().min(10, { message: "Content must be at least 10 characters long." }).max(5000, { message: "Content cannot exceed 5000 characters." }),
    });
    const validatedFields = CreateTopicFormSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Invalid fields. Please check your input.',
            success: false,
        };
    }

    const { title, content } = validatedFields.data;

    const categories = await getForumCategoriesFromFile();
    const category = categories.find(cat => cat.id === categoryId);

    if (!category) {
        return { message: 'Category not found.', success: false, errors: { general: ['Category not found.'] } };
    }

    let finalAuthorName = userName;
    let finalAvatarUrl = userAvatarUrl;
    let authorIsVerified = false;

    if (userId.startsWith('admin-')) {
        finalAuthorName = "Admin";
        const adminAvatarMap = await getAdminAvatarMap();
        finalAvatarUrl = adminAvatarMap.get(userId) || ADMIN_DEFAULT_AVATAR;
        authorIsVerified = true; // Admins are "verified"
    } else {
        const user = (await getUsersFromFile()).find(u => u.id === userId);
        if (user) {
            authorIsVerified = user.isVerified || false;
            // Use the name and avatar from the user object if available,
            // falling back to passed params if needed (though usually user object is source of truth)
            finalAuthorName = user.name || userName;
            finalAvatarUrl = user.avatarUrl || userAvatarUrl || `https://placehold.co/40x40.png?text=${(user.name || userName).charAt(0).toUpperCase()}`;
        }
    }


    const newTopic: ForumTopic = {
        id: `topic-${Date.now()}`,
        categoryId,
        title,
        content,
        createdByUserId: userId,
        authorName: finalAuthorName,
        authorAvatarUrl: finalAvatarUrl,
        authorIsVerified,
        createdAt: new Date().toISOString(),
        lastRepliedAt: new Date().toISOString(),
        viewCount: 0, // Initialize viewCount
        replyCount: 0,
        posts: [],
    };

    try {
        await addForumTopicToServerFile(newTopic, category.slug);

        category.topicCount = (category.topicCount || 0) + 1;
        await saveForumCategoriesToFile(categories);

        revalidatePath(`/community/category/${categorySlug}`);
        revalidatePath('/community');
        if (category.slug === 'announcements') {
            revalidatePath('/admin/forum/announcements');
        }


        return { message: 'Topic created successfully!', success: true, newTopicId: newTopic.id };
    } catch (error) {
        console.error("Error creating forum topic:", error);
        return { message: 'Failed to create topic. Please try again.', success: false, errors: { general: ['Server error.'] } };
    }
}

export async function createForumPostAction(
    prevState: CreatePostFormState,
    formData: FormData,
    topicId: string,
    categorySlug: string,
    userId: string,
    userName: string,
    userAvatarUrl?: string
): Promise<CreatePostFormState> {
    const CreatePostFormSchema = z.object({
      content: z.string().min(1, { message: "Reply content cannot be empty." }).max(2000, { message: "Reply cannot exceed 2000 characters." }),
    });
    const validatedFields = CreatePostFormSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Invalid reply. Please check your input.',
            success: false,
        };
    }

    const { content } = validatedFields.data;

    let finalAuthorName = userName;
    let finalAvatarUrl = userAvatarUrl;
    let authorIsVerified = false;

    if (userId.startsWith('admin-')) {
        finalAuthorName = "Admin";
        const adminAvatarMap = await getAdminAvatarMap();
        finalAvatarUrl = adminAvatarMap.get(userId) || ADMIN_DEFAULT_AVATAR;
        authorIsVerified = true; // Admins are "verified"
    } else {
        const user = (await getUsersFromFile()).find(u => u.id === userId);
        if (user) {
            authorIsVerified = user.isVerified || false;
            finalAuthorName = user.name || userName;
            finalAvatarUrl = user.avatarUrl || userAvatarUrl || `https://placehold.co/40x40.png?text=${(user.name || userName).charAt(0).toUpperCase()}`;
        }
    }


    const newPost: ForumPost = {
        id: `post-${Date.now()}`,
        topicId,
        content,
        createdByUserId: userId,
        authorName: finalAuthorName,
        authorAvatarUrl: finalAvatarUrl,
        authorIsVerified,
        createdAt: new Date().toISOString(),
    };

    try {
        const result = await addPostToTopic(topicId, categorySlug, newPost);
        if (!result.success || !result.updatedTopic) {
            return { message: 'Failed to save reply. Topic not found or error saving.', success: false, errors: { general: ['Failed to save reply.'] } };
        }

        revalidatePath(`/community/topic/${topicId}?categorySlug=${categorySlug}`);
        revalidatePath(`/community/category/${categorySlug}`);
        revalidatePath('/community');

        if (categorySlug === 'announcements' && userId.startsWith('admin-')) {
            revalidatePath('/admin/forum/announcements');
        } else if (categorySlug === 'general-discussion' && userId.startsWith('admin-')) {
            revalidatePath('/admin/forum/general-discussion');
        } else if (categorySlug === 'support-qa' && userId.startsWith('admin-')) {
             revalidatePath('/admin/forum/support-qa');
        }


        return { message: 'Reply posted successfully!', success: true, newPost };
    } catch (error) {
        console.error("Error creating forum post:", error);
        return { message: 'Failed to post reply. Please try again.', success: false, errors: { general: ['Server error.'] } };
    }
}


export async function getUserByIdAction(userId: string): Promise<User | null> {
    try {
        const users = await getUsersFromFile();
        const user = users.find(u => u.id === userId);
        if (!user) return null;
        const { passwordHash, twoFactorPinHash, ...safeUser } = user;
        return safeUser as User;
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        return null;
    }
}

export async function adminDeleteTopicAction(topicId: string, categorySlug: string): Promise<AdminDeleteTopicResult> {
  const adminToken = cookies().get(ADMIN_AUTH_COOKIE_NAME_FOR_ACTIONS)?.value;
  if (!adminToken) {
    return { success: false, message: "Admin authorization failed." };
  }

  if (!topicId || !categorySlug) {
    return { success: false, message: 'Topic ID and Category Slug are required.' };
  }

  try {
    const result = await deleteTopicFromServerData(topicId, categorySlug);
    if (!result.success) {
      return { success: false, message: 'Topic not found or already deleted.' };
    }

    revalidatePath(`/admin/forum/${categorySlug}`);
    revalidatePath(`/community/category/${categorySlug}`);
    revalidatePath('/community');

    return { success: true, message: 'Topic deleted successfully.' };
  } catch (error) {
    console.error('Error deleting topic via admin action:', error);
    return { success: false, message: 'Failed to delete topic due to a server error.' };
  }
}

export async function adminDeleteForumPostAction(
  postId: string,
  topicId: string,
  categorySlug: string
): Promise<AdminDeletePostResult> {
  const adminToken = cookies().get(ADMIN_AUTH_COOKIE_NAME_FOR_ACTIONS)?.value;
  if (!adminToken) {
    return { success: false, message: "Admin authorization failed. Please log in as an admin." };
  }

  if (!postId || !topicId || !categorySlug) {
    return { success: false, message: 'Post ID, Topic ID, and Category Slug are required.' };
  }

  try {
    const result = await deletePostFromServerData(postId, topicId, categorySlug);
    if (!result.success) {
      return { success: false, message: 'Post not found or already deleted.' };
    }

    revalidatePath(`/community/topic/${topicId}?categorySlug=${categorySlug}`);
    revalidatePath(`/community/category/${categorySlug}`);
    revalidatePath('/community');
    revalidatePath(`/admin/forum/${categorySlug}`);


    return { success: true, message: 'Post deleted successfully.' };
  } catch (error) {
    console.error('Error deleting forum post via admin action:', error);
    return { success: false, message: 'Failed to delete post due to a server error.' };
  }
}


export async function updateAdminAnnouncementAction(
  prevState: UpdateAdminAnnouncementFormState,
  formData: FormData
): Promise<UpdateAdminAnnouncementFormState> {
  const UpdateAnnouncementSchema = z.object({
    topicId: z.string().min(1, "Topic ID is required."),
    adminId: z.string().min(1, "Admin ID is required for authorization."),
    title: z.string().min(5, "Title must be at least 5 characters.").max(150, "Title cannot exceed 150 characters."),
    content: z.string().min(10, "Content must be at least 10 characters.").max(5000, "Content cannot exceed 5000 characters."),
  });

  const adminToken = cookies().get(ADMIN_AUTH_COOKIE_NAME_FOR_ACTIONS)?.value;
  if (!adminToken) {
    return { success: false, message: "Admin authorization failed.", errors: {general: ["Not authorized."]} };
  }

  const validatedFields = UpdateAnnouncementSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields. Please check your input.',
      success: false,
    };
  }

  const { topicId, adminId, title, content } = validatedFields.data;

  const adminUsers = await getAdminUsers();
  if (!adminUsers.some(admin => admin.id === adminId)) {
    return { message: "Admin authorization failed.", success: false, errors: {general: ["Invalid admin."]} };
  }

  try {
    const announcements = await getAnnouncementsData();
    const topicIndex = announcements.findIndex(t => t.id === topicId);

    if (topicIndex === -1) {
      return { message: "Announcement not found.", success: false, errors: { topicId: ["Announcement not found."] } };
    }

    const topicToUpdate = announcements[topicIndex];

    topicToUpdate.title = title;
    topicToUpdate.content = content;
    topicToUpdate.lastRepliedAt = new Date().toISOString(); // Indicate edit by updating last activity

    await saveAnnouncementsData(announcements);

    revalidatePath('/admin/forum/announcements');
    revalidatePath(`/community/topic/${topicId}?categorySlug=announcements`);
    revalidatePath('/community/category/announcements');

    return { message: 'Announcement updated successfully!', success: true, updatedTopic: topicToUpdate };
  } catch (error) {
    console.error("Error updating announcement:", error);
    return { message: 'Failed to update announcement. Please try again.', success: false, errors: { general: ['Server error.'] } };
  }
}

export async function searchAllForumTopicsAction(term: string): Promise<ForumTopic[]> {
  if (!term || term.trim() === '') {
    return [];
  }
  const lowerTerm = term.toLowerCase();
  const adminAvatarMap = await getAdminAvatarMap();
  const users = await getUsersFromFile(); // Fetch users for verification status
  const usersMap = new Map(users.map(u => [u.id, u]));

  try {
    const generalTopics = await getUsersForumData();
    const announcementTopics = await getAnnouncementsData();
    const supportTopics = await getSupportForumData();

    const allTopics = [...generalTopics, ...announcementTopics, ...supportTopics];

    const processedTopics = allTopics.map(topic => {
      let finalTopic = { ...topic, viewCount: topic.viewCount || 0 }; // Ensure viewCount
      if (topic.createdByUserId.startsWith('admin-')) {
        finalTopic = {
          ...finalTopic,
          authorName: "Admin",
          authorAvatarUrl: adminAvatarMap.get(topic.createdByUserId) || ADMIN_DEFAULT_AVATAR,
          authorIsVerified: true, // Admins are "verified"
        };
      } else {
        const author = usersMap.get(topic.createdByUserId);
        finalTopic = {
          ...finalTopic,
          authorName: author?.name || topic.authorName,
          authorAvatarUrl: author?.avatarUrl || topic.authorAvatarUrl,
          authorIsVerified: author?.isVerified || false,
        };
      }
       return finalTopic;
    });

    const filteredTopics = processedTopics.filter(topic =>
      topic.title.toLowerCase().includes(lowerTerm) ||
      topic.content.toLowerCase().includes(lowerTerm) ||
      topic.authorName.toLowerCase().includes(lowerTerm)
    );

    return filteredTopics.sort((a, b) => new Date(b.lastRepliedAt).getTime() - new Date(a.lastRepliedAt).getTime());
  } catch (error) {
    console.error('Error searching forum topics:', error);
    return [];
  }
}

export async function getVerificationRequestsAction(): Promise<VerificationRequest[]> {
  try {
    const requests = await getVerificationRequestsFromFile();
    return requests.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
  } catch (error) {
    console.error("Error fetching verification requests via action:", error);
    return [];
  }
}

export async function applyForVerificationAction(
  prevState: ApplyForVerificationFormState,
  formData: FormData
): Promise<ApplyForVerificationFormState> {
  const validatedFields = VerificationApplicationSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields. Please check your input.',
      success: false,
    };
  }

  const { fullName, username, email, phone, userId } = validatedFields.data;

  const newRequest: VerificationRequest = {
    id: `vr-${Date.now()}`,
    userId: userId || undefined,
    submittedName: fullName,
    submittedUsername: username,
    submittedEmail: email,
    submittedPhone: phone,
    requestDate: new Date().toISOString(),
    status: 'pending',
  };

  try {
    await addVerificationRequestToFile(newRequest);
    revalidatePath('/admin/verifications');
    revalidatePath('/community'); 
    return {
      message: 'Verification application submitted successfully! We will review it shortly.',
      success: true,
    };
  } catch (error) {
    console.error('Error submitting verification application:', error);
    return {
      message: 'Failed to submit application. Please try again later.',
      success: false,
      errors: { general: ['Server error.'] },
    };
  }
}

export async function adminApproveVerificationAction(
  prevState: AdminApproveVerificationFormState,
  formData: FormData
): Promise<AdminApproveVerificationFormState> {
  const ApproveVerificationSchema = z.object({
    requestId: z.string().min(1, "Request ID is required."),
    adminId: z.string().min(1, "Admin ID is required for authorization."),
  });

  const adminToken = cookies().get(ADMIN_AUTH_COOKIE_NAME_FOR_ACTIONS)?.value;
  if (!adminToken) { // Basic auth check
    return { message: "Admin authorization failed.", success: false, errors: { general: ["Not authorized."] } };
  }

  const validatedFields = ApproveVerificationSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, message: 'Invalid input.', success: false };
  }

  const { requestId } = validatedFields.data;

  try {
    const requests = await getVerificationRequestsFromFile();
    const requestIndex = requests.findIndex(req => req.id === requestId);

    if (requestIndex === -1) {
      return { message: 'Verification request not found.', success: false, errors: { requestId: ['Request not found.'] } };
    }

    const requestToUpdate = requests[requestIndex];
    if (requestToUpdate.status !== 'pending') {
      return { message: `Request is already ${requestToUpdate.status}.`, success: false, errors: { general: [`Request already ${requestToUpdate.status}.`] } };
    }

    requestToUpdate.status = 'approved';
    await updateVerificationRequestInFile(requestToUpdate);

    let updatedUser: User | null = null;
    if (requestToUpdate.userId) {
      const users = await getUsersFromFile();
      const userToVerify = users.find(u => u.id === requestToUpdate.userId);
      if (userToVerify) {
        userToVerify.isVerified = true;
        await updateUserInFile(userToVerify);
        const { passwordHash, twoFactorPinHash, ...userToReturn } = userToVerify;
        updatedUser = userToReturn as User;
      } else {
        console.warn(`User with ID ${requestToUpdate.userId} not found for verification approval.`);
      }
    }

    revalidatePath('/admin/verifications');
    if (updatedUser) revalidatePath('/admin/users');
    revalidatePath('/designers');

    return { message: 'Verification request approved successfully.', success: true, updatedRequest: requestToUpdate, updatedUser };
  } catch (error) {
    console.error("Error approving verification request:", error);
    return { message: 'Failed to approve request.', success: false, errors: { general: ['Server error.'] } };
  }
}

export async function adminRejectVerificationAction(
  prevState: AdminRejectVerificationFormState,
  formData: FormData
): Promise<AdminRejectVerificationFormState> {
  const RejectVerificationSchema = z.object({
    requestId: z.string().min(1, "Request ID is required."),
    adminId: z.string().min(1, "Admin ID is required for authorization."),
  });

  const adminToken = cookies().get(ADMIN_AUTH_COOKIE_NAME_FOR_ACTIONS)?.value;
   if (!adminToken) {
    return { message: "Admin authorization failed.", success: false, errors: { general: ["Not authorized."] } };
  }

  const validatedFields = RejectVerificationSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, message: 'Invalid input.', success: false };
  }

  const { requestId } = validatedFields.data;

  try {
    const requests = await getVerificationRequestsFromFile();
    const requestIndex = requests.findIndex(req => req.id === requestId);

    if (requestIndex === -1) {
      return { message: 'Verification request not found.', success: false, errors: { requestId: ['Request not found.'] } };
    }

    const requestToUpdate = requests[requestIndex];
     if (requestToUpdate.status !== 'pending') {
      return { message: `Request is already ${requestToUpdate.status}.`, success: false, errors: { general: [`Request already ${requestToUpdate.status}.`] } };
    }

    requestToUpdate.status = 'rejected';
    await updateVerificationRequestInFile(requestToUpdate);

    revalidatePath('/admin/verifications');

    return { message: 'Verification request rejected.', success: true, updatedRequest: requestToUpdate };
  } catch (error) {
    console.error("Error rejecting verification request:", error);
    return { message: 'Failed to reject request.', success: false, errors: { general: ['Server error.'] } };
  }
}

