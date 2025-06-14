
'use server';

import { z } from 'zod';
import { getUsersFromFile, saveUserToFile, getAdminUsers, addDesignToFile, updateUserInFile, getDesignsFromFile } from './server-data';
import type { AdminUser, User, Design, AuthUser, StoredUser, StoredAdminUser } from './types';
import { revalidatePath } from 'next/cache';
import { hashPassword, comparePassword, hashPin, comparePin } from './auth-utils';

const LoginSchema = z.object({
  identifier: z.string().min(1, { message: 'Username or email is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }), // Min length check done by bcrypt comparison effectively
  pin: z.string().length(6, { message: 'PIN must be 6 digits.' }).regex(/^\d{6}$/, "PIN must be 6 digits.").optional(),
  userIdForPin: z.string().optional(), // To identify user during PIN verification stage
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

const AddDesignSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  imageUrl: z.string().url({ message: 'Please enter a valid image URL for visual preview.' }),
  language: z.string().min(1, { message: 'Please select a language/framework.' }),
  codeSnippet: z.string().min(10, { message: 'Code snippet must be at least 10 characters.' }),
  tags: z.string().min(1, {message: 'Please add at least one tag.'}),
  price: z.coerce.number().min(0, { message: 'Price cannot be negative.' }).default(0),
  submittedByUserId: z.string(),
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
  user?: AuthUser | null; // Sanitized user
  errors?: {
    identifier?: string[];
    password?: string[];
    pin?: string[];
    general?: string[];
  };
  requiresPin?: boolean;
  userIdForPin?: string; // To pass userId to PIN verification stage
};

export type SignupFormState = {
  message?: string | null;
  user?: AuthUser | null; // Sanitized user
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
  adminUser?: AuthUser | null; // Sanitized admin user
  errors?: {
    username?: string[];
    password?: string[];
    general?: string[];
  };
};

export type AddDesignFormState = {
  message?: string | null;
  success?: boolean;
  errors?: {
    title?: string[];
    description?: string[];
    imageUrl?: string[];
    language?: string[];
    codeSnippet?: string[];
    tags?: string[];
    price?: string[];
    general?: string[];
  };
};

export type UpdateProfileFormState = {
  message?: string | null;
  success?: boolean;
  user?: AuthUser | null; // Sanitized user
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


// User login
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

  if (userIdForPin && pin) { // PIN verification stage
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
    // PIN is correct, proceed to login
    const { passwordHash, twoFactorPinHash, ...userToReturn } = targetUser;
    return { message: 'Login successful!', user: userToReturn };

  } else { // Initial login: username/email + password stage
    targetUser = users.find(u => (u.email === identifier || u.username === identifier));
    if (!targetUser || !targetUser.passwordHash) {
      return { message: 'Invalid credentials.', errors: { general: ['Invalid username/email or password.'] } };
    }
    const passwordMatches = await comparePassword(password, targetUser.passwordHash);
    if (!passwordMatches) {
      return { message: 'Invalid credentials.', errors: { general: ['Invalid username/email or password.'] } };
    }

    // Password is correct, check for 2FA
    if (targetUser.twoFactorEnabled) {
      return {
        message: 'Please enter your 2FA PIN.',
        requiresPin: true,
        userIdForPin: targetUser.id
      };
    } else {
      // No 2FA, login directly
      const { passwordHash, twoFactorPinHash, ...userToReturn } = targetUser;
      return { message: 'Login successful!', user: userToReturn };
    }
  }
}

// User signup
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
    // twoFactorPinHash will be set when user enables 2FA
  };

  await saveUserToFile(newUser);
  const { passwordHash, twoFactorPinHash, ...userToReturnForState } = newUser;

  return { message: 'Signup successful! Please log in.', user: userToReturnForState };
}

// Admin login
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
  return { message: 'Admin login successful!', adminUser: adminUserToReturn };
}

// Submit new design
export async function submitDesignAction(prevState: AddDesignFormState, formData: FormData): Promise<AddDesignFormState> {
  const validatedFields = AddDesignSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields. Please check your input.',
      success: false,
    };
  }

  const { title, description, imageUrl, language, codeSnippet, tags, price, submittedByUserId } = validatedFields.data;

  const users = await getUsersFromFile();
  const storedDesigner = users.find(u => u.id === submittedByUserId);

  if (!storedDesigner) {
    return { message: 'Designer user not found.', success: false, errors: { general: ['Designer user not found.'] } };
  }
  const { passwordHash, twoFactorPinHash, ...designerInfo } = storedDesigner;


  const newDesign: Design = {
    id: `design-${Date.now()}`,
    title,
    description,
    imageUrl,
    language,
    codeSnippet,
    designer: designerInfo as User, // Cast as User (sanitized version)
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

// Update user profile
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
    return { message: 'Profile updated successfully!', success: true, user: userToReturn };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { message: 'Failed to update profile. Please try again.', success: false, errors: { general: ['Server error.'] } };
  }
}

// Change user password
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

// Enable 2FA
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

// Disable 2FA
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
    twoFactorPinHash: undefined, // Clear the PIN hash
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


// Action to get all designs
export async function getAllDesignsAction(): Promise<Design[]> {
  try {
    const designs = await getDesignsFromFile();
    // Sanitize designer info in each design
    return designs.map(design => {
      if (design.designer) {
        // Ensure designer is treated as StoredUser before destructuring
        const { passwordHash, twoFactorPinHash, ...sanitizedDesigner } = design.designer as StoredUser;
        return { ...design, designer: sanitizedDesigner as User };
      }
      return design;
    });
  } catch (error) {
    console.error("Error fetching all designs via action:", error);
    return [];
  }
}

// Action to get a single design by ID
export async function getDesignByIdAction(id: string): Promise<Design | undefined> {
  try {
    const designs = await getDesignsFromFile();
    const design = designs.find(d => d.id === id);
    if (design && design.designer) {
      // Ensure designer is treated as StoredUser before destructuring
      const { passwordHash, twoFactorPinHash, ...sanitizedDesigner } = design.designer as StoredUser;
      return { ...design, designer: sanitizedDesigner as User };
    }
    return design; // Return design as is if designer info is not there or already sanitized
  } catch (error) {
    console.error(`Error fetching design by ID (${id}) via action:`, error);
    return undefined;
  }
}
