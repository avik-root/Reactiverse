

'use server';

import { z } from 'zod';
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
  saveFirstAdminUser
} from './server-data';
import type { AdminUser, User, Design, AuthUser, StoredUser, StoredAdminUser, CodeBlockItem, DeleteDesignResult, AdminCreateAccountFormState } from './types';
import { revalidatePath } from 'next/cache';
import { hashPassword, comparePassword, hashPin, comparePin } from './auth-utils';

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
  username: z.string().min(1, { message: 'Username is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
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
    general?: string[];
  };
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

export type UpdateProfileFormState = {
  message?: string | null;
  success?: boolean;
  user?: AuthUser | null; 
  errors?: {
    name?: string[];
    avatarUrl?: string[];
    general?: string[];
  };
};

export type ChangePasswordFormState = {
  message?: string | null;
  success?: boolean;
  errors?: {
    currentPassword?: string[];
    newPassword?: string[];
    confirmPassword?: string[];
    general?: string[];
  };
};

export type TwoFactorAuthFormState = {
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
    if (!targetUser.twoFactorEnabled || !targetUser.twoFactorPinHash) {
      return { message: '2FA is not enabled for this user or PIN not set up.', errors: { general: ['2FA error. Please try logging in again.'] } };
    }
    const pinMatches = await comparePin(pin, targetUser.twoFactorPinHash);
    if (!pinMatches) {
      return {
        message: 'Invalid PIN.',
        errors: { pin: ['Incorrect PIN.'] },
        requiresPin: true,
        userIdForPin: targetUser.id
      };
    }
    
    const { passwordHash, twoFactorPinHash, ...userToReturn } = targetUser;
    return { message: 'Login successful!', user: {...userToReturn, isAdmin: false} };

  } else { 
    targetUser = users.find(u => (u.email === identifier || u.username === identifier));
    if (!targetUser || !targetUser.passwordHash) {
      return { message: 'Invalid credentials.', errors: { general: ['Invalid username/email or password.'] } };
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
      const { passwordHash, twoFactorPinHash, ...userToReturn } = targetUser;
      return { message: 'Login successful!', user: {...userToReturn, isAdmin: false} };
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
  };

  await saveUserToFile(newUser);
  const { passwordHash, twoFactorPinHash, ...userToReturnForState } = newUser;

  return { message: 'Signup successful! Please log in.', user: {...userToReturnForState, isAdmin: false} };
}

export async function loginAdmin(prevState: AdminLoginFormState, formData: FormData): Promise<AdminLoginFormState> {
  const validatedFields = AdminLoginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields. Please check your input.',
    };
  }

  const { username, password } = validatedFields.data;
  const adminUsers = await getAdminUsers();
  const adminUser = adminUsers.find(admin => admin.username === username);

  if (!adminUser || !adminUser.passwordHash) {
    return { message: 'Invalid username or password.', errors: { general: ['Invalid username or password.'] } };
  }

  const passwordMatches = await comparePassword(password, adminUser.passwordHash);
  if (!passwordMatches) {
    return { message: 'Invalid username or password.', errors: { general: ['Invalid username or password.'] } };
  }

  const { passwordHash, ...adminUserToReturn } = adminUser;
  return { message: 'Admin login successful!', adminUser: {...adminUserToReturn, isAdmin: true} };
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
            // JSON parsing failed, keep original error
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

  const newDesign: Design = {
    id: `design-${Date.now()}`,
    title,
    filterCategory,
    description,
    codeBlocks,
    designer: designerInfo as User, 
    tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
    price,
    submittedByUserId,
  };

  try {
    await addDesignToFile(newDesign);
    revalidatePath('/');
    revalidatePath('/dashboard/designs');
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
            // JSON parsing failed, keep original error
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
    id: cb.id || `cb-${Date.now()}-${index}`, // Preserve existing ID if available, otherwise generate new
    language: cb.language,
    code: cb.code,
  }));

  const updatedDesign: Design = {
    ...existingDesign,
    title,
    filterCategory,
    description,
    codeBlocks,
    designer: designerInfo as User,
    tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
    price,
  };

  try {
    await updateDesignInFile(updatedDesign);
    revalidatePath('/');
    revalidatePath('/dashboard/designs');
    revalidatePath(`/dashboard/designs/edit/${designId}`);
    return { message: 'Design updated successfully!', success: true };
  } catch (error) {
    console.error("Error updating design:", error);
    return { message: 'Failed to update design. Please try again.', success: false, errors: { general: ['Server error.'] } };
  }
}


export async function updateProfileAction(prevState: UpdateProfileFormState, formData: FormData): Promise<UpdateProfileFormState> {
  const validatedFields = UpdateProfileSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields. Please check your input.',
      success: false,
    };
  }

  const { userId, name, avatarUrl } = validatedFields.data;

  const users = await getUsersFromFile();
  const userToUpdate = users.find(u => u.id === userId);

  if (!userToUpdate) {
    return { message: 'User not found.', success: false, errors: { general: ['User not found.'] } };
  }

  const updatedUserData: StoredUser = {
    ...userToUpdate,
    name,
    avatarUrl: avatarUrl || userToUpdate.avatarUrl,
  };

  try {
    const success = await updateUserInFile(updatedUserData);
    if (!success) throw new Error("Update operation failed at server-data");

    const { passwordHash, twoFactorPinHash, ...userToReturn } = updatedUserData;
    revalidatePath('/dashboard/profile');
    revalidatePath('/dashboard');
    revalidatePath('/');
    return { message: 'Profile updated successfully!', success: true, user: {...userToReturn, isAdmin: false} };
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

export async function enableTwoFactorAction(prevState: TwoFactorAuthFormState, formData: FormData): Promise<TwoFactorAuthFormState> {
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
        : { id: 'unknown', name: 'Unknown Designer', username: '@unknown', avatarUrl: '', email: 'unknown@example.com', phone: '', twoFactorEnabled: false }; 

      return { 
        ...design, 
        designer: sanitizedDesigner,
        codeBlocks: design.codeBlocks || [] 
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
        : { id: 'unknown', name: 'Unknown Designer', username: '@unknown', avatarUrl: '', email: 'unknown@example.com', phone: '', twoFactorEnabled: false };
      return { 
        ...design, 
        designer: sanitizedDesigner,
        codeBlocks: design.codeBlocks || [] 
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
    revalidatePath('/'); // Revalidate home page as well
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
    return { adminExists: false }; // Default to false on error, forcing creation flow
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


