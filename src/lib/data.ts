// src/lib/data.ts
// This file is intended for client-safe data access or utility functions.
// Functions requiring server-side file system access should be implemented as Server Actions.
import type { Design } from './types';

// The original getDesigns and getDesignById functions that accessed fs via server-data.ts
// have been moved to server actions (getAllDesignsAction, getDesignByIdAction in actions.ts)
// to prevent fs module from being bundled with client-side code.

// If you have other client-safe data functions or utilities, they can go here.
// For example, if you were fetching from a public API:
// export async function getPublicApiData(): Promise<any[]> {
//   const response = await fetch('https://api.example.com/data');
//   if (!response.ok) {
//     throw new Error('Failed to fetch data');
//   }
//   return response.json();
// }
