
// This file should only be imported by server-side code (e.g., server actions, API routes)
import type { StoredAdminUser, StoredUser, Design, SiteSettings } from './types';
import fs from 'fs/promises';
import path from 'path';

const USERS_FILE_PATH = path.join(process.cwd(), 'users.json');
const ADMIN_USERS_FILE_PATH = path.join(process.cwd(), 'admin.json');
const DESIGNS_FILE_PATH = path.join(process.cwd(), 'designs.json');
const SETTINGS_FILE_PATH = path.join(process.cwd(), 'settings.json');

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteTitle: "Reactiverse",
  allowNewUserRegistrations: true,
  themeColors: {
    primaryHSL: "271 100% 75.3%", // Default from globals.css dark theme
    accentHSL: "300 100% 70%",   // Default from globals.css dark theme
  }
};

export async function getAdminUsers(): Promise<StoredAdminUser[]> {
  try {
    const jsonData = await fs.readFile(ADMIN_USERS_FILE_PATH, 'utf-8');
    let admins = JSON.parse(jsonData) as StoredAdminUser[];
    // Ensure all admin users have the twoFactorEnabled field
    admins = admins.map(admin => ({
      ...admin,
      twoFactorEnabled: admin.twoFactorEnabled === undefined ? false : admin.twoFactorEnabled,
    }));
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

export async function saveFirstAdminUser(newAdmin: StoredAdminUser): Promise<void> {
  try {
    // This function assumes it's saving the *only* admin account.
    // The calling action should ensure admin.json is empty or handle errors.
    await fs.writeFile(ADMIN_USERS_FILE_PATH, JSON.stringify([{ ...newAdmin, twoFactorEnabled: false }], null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save first admin user to admin.json:', error);
    throw error;
  }
}

export async function updateAdminInFile(updatedAdmin: StoredAdminUser): Promise<boolean> {
  try {
    let admins = await getAdminUsers();
    const adminIndex = admins.findIndex(a => a.id === updatedAdmin.id);
    if (adminIndex === -1) {
      console.error('Admin user not found for update:', updatedAdmin.id);
      return false;
    }
    admins[adminIndex] = { ...admins[adminIndex], ...updatedAdmin };
    await fs.writeFile(ADMIN_USERS_FILE_PATH, JSON.stringify(admins, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Failed to update admin in admin.json:', error);
    throw error;
  }
}


export async function getUsersFromFile(): Promise<StoredUser[]> {
  try {
    const jsonData = await fs.readFile(USERS_FILE_PATH, 'utf-8');
    const users = JSON.parse(jsonData) as StoredUser[];
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

export async function saveUserToFile(newUser: StoredUser): Promise<void> {
  try {
    const users = await getUsersFromFile();
    users.push(newUser);
    await fs.writeFile(USERS_FILE_PATH, JSON.stringify(users, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save user to users.json:', error);
    throw error; // Re-throw to be caught by action
  }
}

export async function updateUserInFile(updatedUser: StoredUser): Promise<boolean> {
  try {
    let users = await getUsersFromFile();
    const userIndex = users.findIndex(u => u.id === updatedUser.id);
    if (userIndex === -1) {
      console.error('User not found for update:', updatedUser.id);
      return false;
    }
    users[userIndex] = { ...users[userIndex], ...updatedUser };
    await fs.writeFile(USERS_FILE_PATH, JSON.stringify(users, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Failed to update user in users.json:', error);
    throw error; // Re-throw
  }
}

export async function deleteUserFromFile(userId: string): Promise<boolean> {
  try {
    let users = await getUsersFromFile();
    const initialLength = users.length;
    users = users.filter(u => u.id !== userId);
    if (users.length === initialLength) {
      console.warn('User not found for deletion:', userId);
      return false; // User not found
    }
    await fs.writeFile(USERS_FILE_PATH, JSON.stringify(users, null, 2), 'utf-8');
    
    // Also remove designs submitted by this user
    let designs = await getDesignsFromFile();
    const designsByDeletedUser = designs.filter(d => d.submittedByUserId === userId);
    if (designsByDeletedUser.length > 0) {
        designs = designs.filter(d => d.submittedByUserId !== userId);
        await saveDesignsToFile(designs);
        console.log(`Deleted ${designsByDeletedUser.length} designs associated with user ${userId}`);
    }
    return true;
  } catch (error) {
    console.error('Failed to delete user from users.json or their designs:', error);
    throw error;
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
    throw error;
  }
}

export async function addDesignToFile(newDesign: Design): Promise<void> {
  try {
    const designs = await getDesignsFromFile();
    designs.push(newDesign);
    await saveDesignsToFile(designs);
  } catch (error) {
    console.error('Failed to add design to designs.json:', error);
    throw error;
  }
}

export async function updateDesignInFile(updatedDesign: Design): Promise<boolean> {
  try {
    let designs = await getDesignsFromFile();
    const designIndex = designs.findIndex(d => d.id === updatedDesign.id);
    if (designIndex === -1) {
      console.error('Design not found for update:', updatedDesign.id);
      return false;
    }
    designs[designIndex] = { ...designs[designIndex], ...updatedDesign };
    await saveDesignsToFile(designs);
    return true;
  } catch (error) {
    console.error('Failed to update design in designs.json:', error);
    throw error; 
  }
}

export async function deleteDesignFromFile(designId: string): Promise<boolean> {
  try {
    let designs = await getDesignsFromFile();
    const initialLength = designs.length;
    designs = designs.filter(d => d.id !== designId);
    if (designs.length === initialLength) {
      console.warn('Design not found for deletion:', designId);
      return false; // Design not found
    }
    await saveDesignsToFile(designs);
    return true;
  } catch (error) {
    console.error('Failed to delete design from designs.json:', error);
    throw error;
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const jsonData = await fs.readFile(SETTINGS_FILE_PATH, 'utf-8');
    return JSON.parse(jsonData) as SiteSettings;
  } catch (error) {
    console.warn('Failed to read settings.json or file not found, returning default settings:', error);
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // Create the file with default settings if it doesn't exist
      await fs.writeFile(SETTINGS_FILE_PATH, JSON.stringify(DEFAULT_SITE_SETTINGS, null, 2));
      return DEFAULT_SITE_SETTINGS;
    }
    // For other errors, still return default but log the error
    return DEFAULT_SITE_SETTINGS;
  }
}

export async function saveSiteSettings(settings: SiteSettings): Promise<void> {
  try {
    await fs.writeFile(SETTINGS_FILE_PATH, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save site settings to settings.json:', error);
    throw error;
  }
}

