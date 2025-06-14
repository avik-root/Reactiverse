// This file should only be imported by server-side code (e.g., server actions, API routes)
import type { AdminUser, User, Design } from './types';
import fs from 'fs/promises';
import path from 'path';

const USERS_FILE_PATH = path.join(process.cwd(), 'users.json');
const ADMIN_USERS_FILE_PATH = path.join(process.cwd(), 'admin.json');
const DESIGNS_FILE_PATH = path.join(process.cwd(), 'designs.json');

export async function getAdminUsers(): Promise<AdminUser[]> {
  try {
    const jsonData = await fs.readFile(ADMIN_USERS_FILE_PATH, 'utf-8');
    const admins = JSON.parse(jsonData) as AdminUser[];
    return admins;
  } catch (error) {
    console.error('Failed to read admin.json:', error);
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      await fs.writeFile(ADMIN_USERS_FILE_PATH, JSON.stringify([], null, 2));
      return [];
    }
    return [];
  }
}

export async function getUsersFromFile(): Promise<User[]> {
  try {
    const jsonData = await fs.readFile(USERS_FILE_PATH, 'utf-8');
    const users = JSON.parse(jsonData) as User[];
    return users;
  } catch (error) {
    console.error('Failed to read users.json:', error);
     if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      await fs.writeFile(USERS_FILE_PATH, JSON.stringify([], null, 2));
      return [];
    }
    return [];
  }
}

export async function saveUserToFile(newUser: User): Promise<void> {
  try {
    const users = await getUsersFromFile();
    users.push(newUser);
    await fs.writeFile(USERS_FILE_PATH, JSON.stringify(users, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save user to users.json:', error);
  }
}

export async function updateUserInFile(updatedUser: User): Promise<boolean> {
  try {
    let users = await getUsersFromFile();
    const userIndex = users.findIndex(u => u.id === updatedUser.id);
    if (userIndex === -1) {
      console.error('User not found for update:', updatedUser.id);
      return false;
    }
    // Preserve existing password if not explicitly changed
    // The actions should handle password changes specifically by including it in updatedUser
    users[userIndex] = { ...users[userIndex], ...updatedUser };
    await fs.writeFile(USERS_FILE_PATH, JSON.stringify(users, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Failed to update user in users.json:', error);
    return false;
  }
}

export async function getDesignsFromFile(): Promise<Design[]> {
  try {
    const jsonData = await fs.readFile(DESIGNS_FILE_PATH, 'utf-8');
    const designs = JSON.parse(jsonData) as Design[];
    return designs;
  } catch (error) {
    console.error('Failed to read designs.json:', error);
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      await fs.writeFile(DESIGNS_FILE_PATH, JSON.stringify([], null, 2));
      return [];
    }
    return [];
  }
}

export async function saveDesignsToFile(designs: Design[]): Promise<void> {
  try {
    await fs.writeFile(DESIGNS_FILE_PATH, JSON.stringify(designs, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save designs to designs.json:', error);
  }
}

export async function addDesignToFile(newDesign: Design): Promise<void> {
  try {
    const designs = await getDesignsFromFile();
    designs.push(newDesign);
    await saveDesignsToFile(designs);
  } catch (error) {
    console.error('Failed to add design to designs.json:', error);
  }
}
