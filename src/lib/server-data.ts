
// This file should only be imported by server-side code (e.g., server actions, API routes)
import type { StoredAdminUser, StoredUser, Design, SiteSettings, PageContentData, PageContentKeys } from './types';
import fs from 'fs/promises';
import path from 'path';
import { constants } from 'fs';


const USERS_FILE_PATH = path.join(process.cwd(), 'users.json');
const ADMIN_USERS_FILE_PATH = path.join(process.cwd(), 'admin.json');
const DESIGNS_FILE_PATH = path.join(process.cwd(), 'designs.json');
const SETTINGS_FILE_PATH = path.join(process.cwd(), 'settings.json');
const PAGE_CONTENT_FILE_PATH = path.join(process.cwd(), 'page_content.json');

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteTitle: "Reactiverse",
  allowNewUserRegistrations: true,
  themeColors: {
    primaryHSL: "271 100% 75.3%",
    accentHSL: "300 100% 70%",
  },
  logoPath: "/default-logo.png" // Example default, actual logo might be Layers3 icon
};

const DEFAULT_PAGE_CONTENT: PageContentData = {
  aboutUs: {
    title: "About Reactiverse",
    description: "Empowering designers and developers to share, discover, and implement stunning UI components.",
    missionTitle: "Our Mission",
    missionContentP1: "At Reactiverse, our mission is to foster a vibrant community where creativity thrives. We provide a platform for UI/UX designers and front-end developers to showcase their innovative components, share knowledge, and inspire one another. We believe in the power of open collaboration to push the boundaries of web design and development.",
    missionContentP2: "Whether you're looking for inspiration, ready-to-use code snippets, or a place to share your own masterpieces, Reactiverse is your go-to destination.",
    image1Url: "https://placehold.co/600x400.png",
    image1Alt: "Collaborative design process",
    image1DataAiHint: "collaboration team",
    offerTitle: "What We Offer",
    offerItems: [
      { title: "Diverse Component Showcase", description: "Explore a vast collection of UI components, from simple buttons to complex interactive elements." },
      { title: "Inspiration Hub", description: "Discover new design trends, techniques, and get inspired by the work of talented creators." },
      { title: "Community Driven", description: "Connect with fellow designers, share feedback, and contribute to a growing ecosystem of creativity." }
    ],
    joinTitle: "Join Our Universe",
    joinContent: "Reactiverse is more than just a platform; it's a community. We invite you to join us, share your work, learn from others, and help build the future of UI design.",
    image2Url: "https://placehold.co/600x300.png",
    image2Alt: "Community of designers",
    image2DataAiHint: "community digital"
  },
  support: {
    title: "Support Center",
    description: "Need help? We're here for you. Find answers or get in touch with our support team.",
    emailSupportTitle: "Email Support",
    emailSupportDescription: "Get in touch via email for any inquiries.",
    emailAddress: "support@reactiverse.com",
    forumTitle: "Community Forum",
    forumDescription: "Ask questions and find answers in our community.",
    forumLinkText: "Visit Forum (Coming Soon)",
    forumLinkUrl: "#",
    faqTitle: "Frequently Asked Questions",
    faqPlaceholder: "Our FAQ section is under construction. Please check back later for common questions and answers!"
  },
  guidelines: {
    title: "Design Guidelines",
    description: "Our principles and best practices for submitting designs to Reactiverse.",
    mainPlaceholderTitle: "Guidelines Coming Soon!",
    mainPlaceholderContent: "We are currently drafting our comprehensive design guidelines to ensure quality and consistency. Please check back soon for details on how to prepare your submissions.",
    keyAreasTitle: "Key Areas We'll Cover:",
    keyAreas: [
      "Code Quality and Readability",
      "Component Reusability and Modularity",
      "Accessibility Standards (WCAG)",
      "Performance Considerations",
      "Design Aesthetics and User Experience",
      "Submission Formatting and Preview Requirements"
    ]
  },
  topDesigners: {
    title: "Top Designers",
    description: "Meet the most influential and creative designers on Reactiverse.",
    mainPlaceholderTitle: "Coming Soon!",
    mainPlaceholderContent: "We're currently curating our list of top designers. Check back soon to see who's leading the pack in creativity and innovation!"
  }
};


async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function getAdminUsers(): Promise<StoredAdminUser[]> {
  try {
    if (!(await fileExists(ADMIN_USERS_FILE_PATH))) {
      await fs.writeFile(ADMIN_USERS_FILE_PATH, JSON.stringify([], null, 2));
      return [];
    }
    const jsonData = await fs.readFile(ADMIN_USERS_FILE_PATH, 'utf-8');
    let admins = JSON.parse(jsonData) as StoredAdminUser[];
    admins = admins.map(admin => ({
      ...admin,
      twoFactorEnabled: admin.twoFactorEnabled === undefined ? false : admin.twoFactorEnabled,
    }));
    return admins;
  } catch (error) {
    console.error('Failed to read admin.json:', error);
    return [];
  }
}

export async function saveFirstAdminUser(newAdmin: StoredAdminUser): Promise<void> {
  try {
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
    if (!(await fileExists(USERS_FILE_PATH))) {
      await fs.writeFile(USERS_FILE_PATH, JSON.stringify([], null, 2));
      return [];
    }
    const jsonData = await fs.readFile(USERS_FILE_PATH, 'utf-8');
    const users = JSON.parse(jsonData) as StoredUser[];
    // Initialize new fields if they are missing
    return users.map(user => ({
      ...user,
      failedPinAttempts: user.failedPinAttempts === undefined ? 0 : user.failedPinAttempts,
      isLocked: user.isLocked === undefined ? false : user.isLocked,
      twoFactorEnabled: user.twoFactorEnabled === undefined ? false : user.twoFactorEnabled,
    }));
  } catch (error) {
    console.error('Failed to read users.json:', error);
    return [];
  }
}

export async function saveUserToFile(newUser: StoredUser): Promise<void> {
  try {
    const users = await getUsersFromFile();
    users.push({
        ...newUser,
        failedPinAttempts: newUser.failedPinAttempts || 0,
        isLocked: newUser.isLocked || false,
        twoFactorEnabled: newUser.twoFactorEnabled || false,
    });
    await fs.writeFile(USERS_FILE_PATH, JSON.stringify(users, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save user to users.json:', error);
    throw error;
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
    users[userIndex] = {
        ...users[userIndex],
        ...updatedUser,
        failedPinAttempts: updatedUser.failedPinAttempts === undefined ? users[userIndex].failedPinAttempts : updatedUser.failedPinAttempts,
        isLocked: updatedUser.isLocked === undefined ? users[userIndex].isLocked : updatedUser.isLocked,
    };
    await fs.writeFile(USERS_FILE_PATH, JSON.stringify(users, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Failed to update user in users.json:', error);
    throw error;
  }
}

export async function deleteUserFromFile(userId: string): Promise<boolean> {
  try {
    let users = await getUsersFromFile();
    const initialLength = users.length;
    users = users.filter(u => u.id !== userId);
    if (users.length === initialLength) {
      console.warn('User not found for deletion:', userId);
      return false;
    }
    await fs.writeFile(USERS_FILE_PATH, JSON.stringify(users, null, 2), 'utf-8');

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
     if (!(await fileExists(DESIGNS_FILE_PATH))) {
      await fs.writeFile(DESIGNS_FILE_PATH, JSON.stringify([], null, 2));
      return [];
    }
    const jsonData = await fs.readFile(DESIGNS_FILE_PATH, 'utf-8');
    const designs = JSON.parse(jsonData) as Design[];
    return designs;
  } catch (error) {
    console.error('Failed to read designs.json:', error);
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
      return false;
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
    if (!(await fileExists(SETTINGS_FILE_PATH))) {
      await fs.writeFile(SETTINGS_FILE_PATH, JSON.stringify(DEFAULT_SITE_SETTINGS, null, 2));
      return DEFAULT_SITE_SETTINGS;
    }
    const jsonData = await fs.readFile(SETTINGS_FILE_PATH, 'utf-8');
    // Merge with defaults to ensure all keys are present if file is manually edited
    const parsedSettings = JSON.parse(jsonData);
    return { ...DEFAULT_SITE_SETTINGS, ...parsedSettings, themeColors: { ...DEFAULT_SITE_SETTINGS.themeColors, ...parsedSettings.themeColors }};
  } catch (error) {
    console.warn('Failed to read settings.json, returning default settings:', error);
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

export async function getPageContent(): Promise<PageContentData> {
  try {
    if (!(await fileExists(PAGE_CONTENT_FILE_PATH))) {
      await fs.writeFile(PAGE_CONTENT_FILE_PATH, JSON.stringify(DEFAULT_PAGE_CONTENT, null, 2));
      return DEFAULT_PAGE_CONTENT;
    }
    const jsonData = await fs.readFile(PAGE_CONTENT_FILE_PATH, 'utf-8');
    const parsedContent = JSON.parse(jsonData);
    // Merge with defaults to ensure all keys are present
    return {
      aboutUs: { ...DEFAULT_PAGE_CONTENT.aboutUs, ...parsedContent.aboutUs },
      support: { ...DEFAULT_PAGE_CONTENT.support, ...parsedContent.support },
      guidelines: { ...DEFAULT_PAGE_CONTENT.guidelines, ...parsedContent.guidelines },
      topDesigners: { ...DEFAULT_PAGE_CONTENT.topDesigners, ...parsedContent.topDesigners },
    };
  } catch (error) {
    console.warn('Failed to read page_content.json, returning default content:', error);
    return DEFAULT_PAGE_CONTENT;
  }
}

export async function savePageContent(pageKey: PageContentKeys, content: any): Promise<void> {
  try {
    const allContent = await getPageContent();
    allContent[pageKey] = content;
    await fs.writeFile(PAGE_CONTENT_FILE_PATH, JSON.stringify(allContent, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Failed to save content for ${pageKey} to page_content.json:`, error);
    throw error;
  }
}

export async function saveSiteLogo(fileBuffer: Buffer, fileName: string): Promise<string> {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    // Ensure public directory exists
    try {
      await fs.access(publicDir);
    } catch {
      await fs.mkdir(publicDir, { recursive: true });
    }

    const filePath = path.join(publicDir, fileName);
    await fs.writeFile(filePath, fileBuffer);
    return `/${fileName}`; // Return the public path
  } catch (error) {
    console.error('Failed to save site logo:', error);
    throw error;
  }
}
