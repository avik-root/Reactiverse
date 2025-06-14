'use server';

import { z } from 'zod';
import { getUsersFromFile, saveUserToFile, getAdminUsers } from './server-data';
import type { AdminUser, User } from './types';

const LoginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

const SignupSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

const AdminLoginSchema = z.object({
  username: z.string().min(1, { message: 'Username is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export type LoginFormState = {
  message?: string | null;
  user?: User | null;
  errors?: {
    email?: string[];
    password?: string[];
    general?: string[];
  };
};

export type SignupFormState = {
  message?: string | null;
  user?: User | null;
  errors?: {
    name?: string[];
    email?: string[];
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

// User login
export async function loginUser(prevState: LoginFormState, formData: FormData): Promise<LoginFormState> {
  const validatedFields = LoginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields. Please check your input.',
    };
  }

  const { email, password } = validatedFields.data;
  const users = await getUsersFromFile();
  const foundUser = users.find(u => u.email === email);

  if (!foundUser) {
    return { message: 'Invalid email or password.', errors: { general: ['Invalid email or password.'] } };
  }

  // Plain text password check, as stored in users.json
  if (foundUser.password === password) {
    const { password: _, ...userToReturn } = foundUser; // Exclude password from returned object
    return { message: 'Login successful!', user: userToReturn };
  }

  return { message: 'Invalid email or password.', errors: { general: ['Invalid email or password.'] } };
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

  const { name, email, password } = validatedFields.data;
  const users = await getUsersFromFile();

  if (users.some(u => u.email === email)) {
    return { message: 'User with this email already exists.', errors: { email: ['Email already in use.'] } };
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    name,
    email,
    password, // Store plain text password
    avatarUrl: `https://placehold.co/100x100.png?text=${name.charAt(0).toUpperCase()}`
  };
  
  await saveUserToFile(newUser);
  
  const { password: _, ...userToReturnForState } = newUser; // Exclude password from returned object for state

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
