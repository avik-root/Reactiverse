// This file should only be imported by server-side code (e.g., server actions, API routes)
import type { AdminUser, User } from './types';
import fs from 'fs/promises';
import path from 'path';

export async function getAdminUsers(): Promise<AdminUser[]> {
  try {
    const filePath = path.join(process.cwd(), 'admin.json');
    const jsonData = await fs.readFile(filePath, 'utf-8');
    const admins = JSON.parse(jsonData) as AdminUser[];
    return admins;
  } catch (error) {
    console.error('Failed to read admin.json:', error);
    return [];
  }
}

export async function getUsersFromFile(): Promise<User[]> {
  try {
    const filePath = path.join(process.cwd(), 'users.json');
    const jsonData = await fs.readFile(filePath, 'utf-8');
    const users = JSON.parse(jsonData) as User[];
    return users;
  } catch (error) {
    console.error('Failed to read users.json:', error);
    return [];
  }
}

export async function saveUserToFile(newUser: User): Promise<void> {
  try {
    const filePath = path.join(process.cwd(), 'users.json');
    const users = await getUsersFromFile();
    users.push(newUser);
    await fs.writeFile(filePath, JSON.stringify(users, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save user to users.json:', error);
    // In a real app, you might want to throw an error or handle it more gracefully
  }
}
