// This file should only be imported by server-side code (e.g., server actions, API routes)
import type { AdminUser } from './types';
import fs from 'fs/promises';
import path from 'path';

export async function getAdminUsers(): Promise<AdminUser[]> {
  try {
    // For Vercel/Netlify, path.join needs to be handled carefully.
    // process.cwd() is the root of the project during build and runtime for serverless functions.
    const filePath = path.join(process.cwd(), 'admin.json');
    const jsonData = await fs.readFile(filePath, 'utf-8');
    const admins = JSON.parse(jsonData) as AdminUser[];
    return admins;
  } catch (error) {
    console.error('Failed to read admin.json:', error);
    // In a real app, you might want to throw an error or handle it more gracefully
    return []; 
  }
}
