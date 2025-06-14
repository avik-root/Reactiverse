
'use server';

import { z } from 'zod';
import { getUsersFromFile, saveUserToFile, getAdminUsers, addDesignToFile, updateUserInFile, getDesignsFromFile } from './server-data';
import type { AdminUser, User, Design } from './types';
import { revalidatePath } from 'next/cache';

const LoginSchema = z.object({
  identifier: z.string().min(1, { message: 'Username or email is required.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
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
  imageUrl: z.string().url({ message: 'Please enter a valid image URL.' }),
  htmlCode: z.string().optional(),
  cssCode: z.string().optional(),
  jsCode: z.string().optional(),
  tags: z.string().min(1, {message: 'Please add at least one tag.'}),
  price: z.coerce.number().min(0, { message: 'Price cannot be negative.' }).default(0),
  submittedByUserId: z.string(), 
});

const UpdateProfileSchema = z.object({
  userId: z.string(),
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  avatarUrl: z.string().url({ message: 'Please enter a valid URL for your avatar.' }).or(z.literal('')),
  // username and phone are not updated here, could be a separate "Account Settings" form if needed
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


export type LoginFormState = {
  message?: string | null;
  user?: User | null;
  errors?: {
    identifier?: string[];
    password?: string[];
    general?: string[];
  };
};

export type SignupFormState = {
  message?: string | null;
  user?: User | null;
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
  adminUser?: AdminUser | null;
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
    htmlCode?: string[];
    cssCode?: string[];
    jsCode?: string[];
    tags?: string[];
    price?: string[];
    general?: string[];
  };
};

export type UpdateProfileFormState = {
  message?: string | null;
  success?: boolean;
  user?: User | null;
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


// User login
export async function loginUser(prevState: LoginFormState, formData: FormData): Promise<LoginFormState> {
  const validatedFields = LoginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields. Please check your input.',
    };
  }

  const { identifier, password } = validatedFields.data;
  const users = await getUsersFromFile();
  
  const foundUser = users.find(u => 
    (u.email === identifier || u.username === identifier)
  );

  if (!foundUser) {
    return { message: 'Invalid credentials.', errors: { general: ['Invalid username/email or password.'] } };
  }

  if (foundUser.password === password) { // In a real app, use password hashing (e.g., bcrypt.compare)
    const { password: _, ...userToReturn } = foundUser;
    return { message: 'Login successful!', user: userToReturn };
  }

  return { message: 'Invalid credentials.', errors: { general: ['Invalid username/email or password.'] } };
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


  const newUser: User = {
    id: `user-${Date.now()}`,
    name,
    username,
    email,
    phone,
    password, // In a real app, hash the password before saving (e.g., bcrypt.hash)
    avatarUrl: `https://placehold.co/100x100.png?text=${name.charAt(0).toUpperCase()}`
  };
  
  await saveUserToFile(newUser);
  const { password: _, ...userToReturnForState } = newUser;

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

  if (!adminUser || adminUser.password !== password) {
    return { message: 'Invalid username or password.', errors: { general: ['Invalid username or password.'] } };
  }
  
  const { password: _, ...adminUserToReturn } = adminUser;
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

  const { title, description, imageUrl, htmlCode, cssCode, jsCode, tags, price, submittedByUserId } = validatedFields.data;
  
  const users = await getUsersFromFile();
  const designer = users.find(u => u.id === submittedByUserId);

  if (!designer) {
    return { message: 'Designer user not found.', success: false, errors: { general: ['Designer user not found.'] } };
  }
  const { password, ...designerInfo } = designer;


  const newDesign: Design = {
    id: `design-${Date.now()}`,
    title,
    description,
    imageUrl,
    code: {
      html: htmlCode || '',
      css: cssCode || '',
      js: jsCode || '',
    },
    designer: designerInfo, 
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

  const updatedUserData: User = {
    ...userToUpdate,
    name,
    avatarUrl: avatarUrl || userToUpdate.avatarUrl, 
  };

  try {
    const success = await updateUserInFile(updatedUserData);
    if (!success) throw new Error("Update operation failed at server-data");
    
    const { password, ...userToReturn } = updatedUserData;
    revalidatePath('/dashboard/profile');
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

  if (!userToUpdate) {
    return { message: 'User not found.', success: false, errors: { general: ['User not found.'] } };
  }

  if (userToUpdate.password !== currentPassword) { // In a real app, use password hashing
    return { message: 'Incorrect current password.', success: false, errors: { currentPassword: ['Incorrect current password.'] } };
  }

  const updatedUserData: User = {
    ...userToUpdate,
    password: newPassword, 
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

// Action to get all designs
export async function getAllDesignsAction(): Promise<Design[]> {
  try {
    const designs = await getDesignsFromFile();
    return designs;
  } catch (error) {
    console.error("Error fetching all designs via action:", error);
    return []; 
  }
}

// Action to get a single design by ID
export async function getDesignByIdAction(id: string): Promise<Design | undefined> {
  try {
    const designs = await getDesignsFromFile();
    return designs.find(design => design.id === id);
  } catch (error) {
    console.error(`Error fetching design by ID (${id}) via action:`, error);
    return undefined;
  }
}
