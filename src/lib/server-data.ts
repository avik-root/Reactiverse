
// This file should only be imported by server-side code (e.g., server actions, API routes)
import type { StoredAdminUser, StoredUser, Design, SiteSettings, PageContentData, PageContentKeys, TeamMembersContent, TeamMember, ForumCategory, NewsletterSubscriber } from './types';
import fs from 'fs/promises';
import path from 'path';
import { constants } from 'fs';


const USERS_FILE_PATH = path.join(process.cwd(), 'users.json');
const ADMIN_USERS_FILE_PATH = path.join(process.cwd(), 'admin.json');
const DESIGNS_FILE_PATH = path.join(process.cwd(), 'designs.json');
const SETTINGS_FILE_PATH = path.join(process.cwd(), 'settings.json');
const PAGE_CONTENT_FILE_PATH = path.join(process.cwd(), 'page_content.json');
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const AVATARS_DIR = path.join(PUBLIC_DIR, 'avatars');
const CONTENT_IMAGES_DIR = path.join(PUBLIC_DIR, 'content_images');
const FORUM_CATEGORIES_FILE_PATH = path.join(process.cwd(), 'forum_categories.json');
const NEWSLETTER_SUBSCRIBERS_FILE_PATH = path.join(process.cwd(), 'newsletter_subscribers.json');


const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteTitle: "Reactiverse",
  allowNewUserRegistrations: true,
  themeColors: {
    primaryHSL: "271 100% 75.3%",
    accentHSL: "300 100% 70%",
  },
  logoPath: "/default-logo.png"
};

const DEFAULT_TEAM_MEMBER_DATA: Omit<TeamMember, 'name' | 'title' | 'bio'> = {
  imageUrl: "",
  imageAlt: "",
  imageDataAiHint: "professional portrait",
  githubUrl: "",
  linkedinUrl: "",
  emailAddress: "",
};

const DEFAULT_TEAM_MEMBERS_CONTENT: TeamMembersContent = {
  title: "Meet Our Team",
  founder: {
    name: "Alex Johnson",
    title: "Founder & CEO",
    bio: "Visionary leader with a passion for innovative design and community building. Alex drives the strategic direction of Reactiverse, ensuring it remains a leading platform for UI/UX enthusiasts worldwide.",
    ...DEFAULT_TEAM_MEMBER_DATA,
    imageUrl: "/team_images/founder_image.png", 
    imageAlt: "Founder Alex Johnson",
  },
  coFounder: {
    name: "Maria Garcia",
    title: "Co-Founder & CTO",
    bio: "Expert technologist driving the platform's architecture and development. Maria focuses on creating a seamless and powerful experience for all Reactiverse users.",
    ...DEFAULT_TEAM_MEMBER_DATA,
    imageUrl: "/team_images/cofounder_image.png", 
    imageAlt: "Co-Founder Maria Garcia",
  }
};


const DEFAULT_PAGE_CONTENT: PageContentData = {
  aboutUs: {
    title: "About Reactiverse",
    description: "Empowering designers and developers to share, discover, and implement stunning UI components.",
    missionTitle: "Our Mission",
    missionContentP1: "At Reactiverse, our mission is to foster a vibrant community where creativity thrives. We provide a platform for UI/UX designers and front-end developers to showcase their innovative components, share knowledge, and inspire one another. We believe in the power of open collaboration to push the boundaries of web design and development.",
    missionContentP2: "Whether you're looking for inspiration, ready-to-use code snippets, or a place to share your own masterpieces, Reactiverse is your go-to destination.",
    image1Url: "/content_images/about/mission_image-1750057020985.png",
    image1Alt: "Team working collaboratively on a design project",
    image1DataAiHint: "collaboration team",
    offerTitle: "What We Offer",
    offerItems: [
      { title: "Diverse Component Showcase", description: "Explore a vast collection of UI components, from simple buttons to complex interactive elements." },
      { title: "Inspiration Hub", description: "Discover new design trends, techniques, and get inspired by the work of talented creators." },
      { title: "Community Driven", description: "Connect with fellow designers, share feedback, and contribute to a growing ecosystem of creativity." }
    ],
    joinTitle: "Join Our Universe",
    joinContent: "Reactiverse is more than just a platform; it's a community. We invite you to join us, share your work, learn from others, and help build the future of UI design.",
    image2Url: "/content_images/about/join_image-1750057020986.png",
    image2Alt: "Abstract representation of a digital community network",
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
    faqs: [
      {
        "question": "What is Reactiverse?",
        "answer": "Reactiverse is a community-driven platform for UI/UX designers and front-end developers to showcase their components, discover new ideas, and access code snippets for their projects. Our goal is to foster creativity and collaboration in web design."
      },
      {
        "question": "How do I submit a design?",
        "answer": "To submit a design, you need to create an account. Once logged in, navigate to your dashboard and look for the 'Submit New Design' option. You'll be asked to provide a title, description, relevant code snippets (HTML, CSS, JS, etc.), and tags for your component."
      },
      {
        "question": "Are there any guidelines for submissions?",
        "answer": "Yes, we have submission guidelines to ensure the quality and usability of components shared on Reactiverse. Please visit our 'Design Guidelines' page for detailed information on code quality, accessibility, performance, and more."
      },
      {
        "question": "Can I sell my designs on Reactiverse?",
        "answer": "Currently, Reactiverse primarily focuses on free and open-source component sharing. We are exploring options for premium components in the future. Users with specific permissions may be able to set prices for their designs if this feature is enabled for their account by an administrator."
      },
      {
        "question": "How is my personal information handled?",
        "answer": "We take your privacy seriously. You can manage the visibility of your email and phone number in your profile settings. Please review our Privacy Policy for more details on how we collect and use your data."
      },
      {
        "question": "Who can I contact for support?",
        "answer": "If you have questions or need assistance, you can reach out to us via email at support@reactiverse.com or visit our community forum (coming soon) to connect with other users and our team."
      }
    ]
  },
  guidelines: {
    title: "Design & Submission Guidelines",
    description: "Our principles and best practices for submitting high-quality UI components to Reactiverse.",
    mainPlaceholderTitle: "Crafting Exceptional Components for Reactiverse",
    mainPlaceholderContent: "Welcome, creators! To maintain a high standard of quality and ensure a great experience for all users, we've established these guidelines for submitting your UI components. Adhering to these principles will help your work shine and make it more accessible and useful to the community. Please review them carefully before submitting your designs.",
    keyAreasTitle: "Core Principles & Technical Standards",
    keyAreas: [
      "**Clarity & Usability:** Components must be intuitive and easy to understand. Ensure clear visual hierarchy, logical interaction patterns, and provide necessary context for use.",
      "**Code Quality & Maintainability:** Submit clean, well-structured, and commented code. Follow best practices for your chosen language/framework (HTML, CSS, JS, React, etc.). Ensure your code is readable and easy for others to integrate.",
      "**Accessibility (A11y):** Designs must be accessible to all users, including those with disabilities. Adhere to WCAG 2.1 AA standards where applicable. Use semantic HTML, provide ARIA attributes, and ensure keyboard navigability and sufficient color contrast.",
      "**Performance:** Components should be optimized for performance. Avoid unnecessary animations, large asset files, or inefficient code that could slow down a user's application.",
      "**Visual Appeal & Consistency:** While creativity is encouraged, components should exhibit a good sense of aesthetics and align with modern UI/UX trends. If part of a set, ensure visual consistency.",
      "**Responsiveness:** Components must be responsive and adapt gracefully to different screen sizes and devices (desktop, tablet, mobile).",
      "**Originality & Licensing:** Submit your own original work or ensure you have the right to share any assets used. Clearly state any licensing terms if applicable for premium components.",
      "**Documentation & Preview:** Provide a clear description of your component, its features, and how to use it. Your code snippets should be functional and produce a reasonable preview of the component in action.",
      "**No Malicious Code:** Submissions must not contain any malicious code, trackers (beyond basic analytics if declared), or harmful scripts.",
      "**Respectful Content:** Ensure your component, its description, and any associated text are respectful and inclusive. No offensive or discriminatory content will be tolerated."
    ]
  },
  topDesigners: {
    title: "Top Designers",
    description: "Meet the most influential and creative designers on Reactiverse.",
    mainPlaceholderTitle: "Coming Soon!",
    mainPlaceholderContent: "We're currently curating our list of top designers. Check back soon to see who's leading the pack in creativity and innovation!"
  },
  teamMembers: {
      title: "Meet Our Team",
      founder: {
        name: "Avik Samanta",
        title: "Founder & CEO",
        bio: "Cybersecurity Engineer | Blockchain Specialist | Bug Bounty Hunter.\r\nSkilled in vulnerability research, ethical hacking, and securing digital infrastructures. Passionate about advancing blockchain security, identifying threats, and building innovative security solutions.",
        imageUrl: "/content_images/team/founder_image-1750057132178.jpg",
        imageAlt: "Avik Samanta, Founder of Reactiverse",
        imageDataAiHint: "professional portrait",
        githubUrl: "https://github.com/avik-root",
        linkedinUrl: "https://www.linkedin.com/in/avik-samanta-root/",
        emailAddress: "aviksamantaofficial@gmail.com"
      },
      coFounder: {
        name: "Anusha Gupta",
        title: "Co-Founder & CTO",
        bio: "Software Developer | AI Web Developer | Cybersecurity Enthusiast.\r\nSkilled in software and web development, AI integration, Python automation, and secure application design. Focused on leveraging machine learning and vulnerability research to create innovative, secure solutions.",
        imageUrl: "/content_images/team/cofounder_image-1750057132178.jpg",
        imageAlt: "Anusha Gupta, Co-Founder of Reactiverse",
        imageDataAiHint: "professional tech",
        githubUrl: "https://github.com/anushagupta11",
        linkedinUrl: "https://www.linkedin.com/in/anusha-gupta-ofc/",
        emailAddress: "anusha73gupta@gmail.com"
      }
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

async function ensureDirExists(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
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
    return users.map(user => ({
      ...user,
      failedPinAttempts: user.failedPinAttempts === undefined ? 0 : user.failedPinAttempts,
      isLocked: user.isLocked === undefined ? false : user.isLocked,
      twoFactorEnabled: user.twoFactorEnabled === undefined ? false : user.twoFactorEnabled,
      canSetPrice: user.canSetPrice === undefined ? false : user.canSetPrice,
      githubUrl: user.githubUrl || "",
      linkedinUrl: user.linkedinUrl || "",
      figmaUrl: user.figmaUrl || "",
      isEmailPublic: user.isEmailPublic === undefined ? false : user.isEmailPublic,
      isPhonePublic: user.isPhonePublic === undefined ? false : user.isPhonePublic,
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
        canSetPrice: newUser.canSetPrice || false, 
        githubUrl: newUser.githubUrl || "",
        linkedinUrl: newUser.linkedinUrl || "",
        figmaUrl: newUser.figmaUrl || "",
        isEmailPublic: newUser.isEmailPublic === undefined ? false : newUser.isEmailPublic,
        isPhonePublic: newUser.isPhonePublic === undefined ? false : newUser.isPhonePublic,
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
        canSetPrice: updatedUser.canSetPrice === undefined ? users[userIndex].canSetPrice : updatedUser.canSetPrice,
        githubUrl: updatedUser.githubUrl === undefined ? users[userIndex].githubUrl : updatedUser.githubUrl,
        linkedinUrl: updatedUser.linkedinUrl === undefined ? users[userIndex].linkedinUrl : updatedUser.linkedinUrl,
        figmaUrl: updatedUser.figmaUrl === undefined ? users[userIndex].figmaUrl : updatedUser.figmaUrl,
        isEmailPublic: updatedUser.isEmailPublic === undefined ? users[userIndex].isEmailPublic : updatedUser.isEmailPublic,
        isPhonePublic: updatedUser.isPhonePublic === undefined ? users[userIndex].isPhonePublic : updatedUser.isPhonePublic,
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
    return designs.map(design => ({
      ...design,
      copyCount: design.copyCount === undefined ? 0 : design.copyCount,
      likedBy: design.likedBy === undefined ? [] : design.likedBy,
    }));
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
    designs.push({
      ...newDesign,
      copyCount: newDesign.copyCount || 0,
      likedBy: newDesign.likedBy || [],
    });
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
    designs[designIndex] = {
      ...designs[designIndex],
      ...updatedDesign,
      copyCount: updatedDesign.copyCount === undefined ? designs[designIndex].copyCount : updatedDesign.copyCount,
      likedBy: updatedDesign.likedBy === undefined ? designs[designIndex].likedBy : updatedDesign.likedBy,
    };
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
    // Merge ensuring all default keys exist
    const mergedContent: PageContentData = {
      aboutUs: { ...DEFAULT_PAGE_CONTENT.aboutUs, ...parsedContent.aboutUs },
      support: { ...DEFAULT_PAGE_CONTENT.support, ...parsedContent.support, faqs: parsedContent.support?.faqs || [] },
      guidelines: { ...DEFAULT_PAGE_CONTENT.guidelines, ...parsedContent.guidelines },
      topDesigners: { ...DEFAULT_PAGE_CONTENT.topDesigners, ...parsedContent.topDesigners },
      teamMembers: {
        ...DEFAULT_PAGE_CONTENT.teamMembers,
        ...(parsedContent.teamMembers || {}),
        founder: {
          ...DEFAULT_PAGE_CONTENT.teamMembers.founder,
          ...(parsedContent.teamMembers?.founder || {}),
        },
        coFounder: {
          ...DEFAULT_PAGE_CONTENT.teamMembers.coFounder,
          ...(parsedContent.teamMembers?.coFounder || {}),
        }
      }
    };
    return mergedContent;
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
    await ensureDirExists(PUBLIC_DIR);
    const filePath = path.join(PUBLIC_DIR, fileName);
    await fs.writeFile(filePath, fileBuffer);
    return `/${fileName}`; // Return relative path for web access
  } catch (error) {
    console.error('Failed to save site logo:', error);
    throw error;
  }
}

export async function savePageContentImage(fileBuffer: Buffer, subfolder: string, baseName: string, fileExtension: string): Promise<string> {
  try {
    const targetDir = path.join(CONTENT_IMAGES_DIR, subfolder);
    await ensureDirExists(targetDir);
    const fileName = `${baseName}-${Date.now()}${fileExtension}`;
    const filePath = path.join(targetDir, fileName);
    await fs.writeFile(filePath, fileBuffer);
    return `/content_images/${subfolder}/${fileName}`;
  } catch (error) {
    console.error(`Failed to save content image to ${subfolder}:`, error);
    throw error;
  }
}


export async function saveUserAvatar(fileBuffer: Buffer, userId: string, fileExtension: string): Promise<string> {
  try {
    await ensureDirExists(AVATARS_DIR);
    const fileName = `user-${userId}-${Date.now()}${fileExtension}`;
    const filePath = path.join(AVATARS_DIR, fileName);
    await fs.writeFile(filePath, fileBuffer);
    return `/avatars/${fileName}`;
  } catch (error) {
    console.error(`Failed to save user avatar for ${userId}:`, error);
    throw error;
  }
}

export async function saveAdminAvatar(fileBuffer: Buffer, adminId: string, fileExtension: string): Promise<string> {
  try {
    await ensureDirExists(AVATARS_DIR);
    const fileName = `admin-${adminId}-${Date.now()}${fileExtension}`;
    const filePath = path.join(AVATARS_DIR, fileName);
    await fs.writeFile(filePath, fileBuffer);
    return `/avatars/${fileName}`;
  } catch (error) {
    console.error(`Failed to save admin avatar for ${adminId}:`, error);
    throw error;
  }
}

export async function getForumCategoriesFromFile(): Promise<ForumCategory[]> {
  try {
    if (!(await fileExists(FORUM_CATEGORIES_FILE_PATH))) {
      const defaultCategories: ForumCategory[] = [
        { id: "cat-001", name: "General Discussion", description: "Talk about anything UI/UX.", iconName: "MessagesSquare", slug:"general", topicCount: 0, postCount: 0 },
        { id: "cat-002", name: "Showcase & Feedback", description: "Share your work.", iconName: "Palette", slug:"showcase", topicCount: 0, postCount: 0 },
      ];
      await fs.writeFile(FORUM_CATEGORIES_FILE_PATH, JSON.stringify(defaultCategories, null, 2));
      return defaultCategories;
    }
    const jsonData = await fs.readFile(FORUM_CATEGORIES_FILE_PATH, 'utf-8');
    return JSON.parse(jsonData) as ForumCategory[];
  } catch (error) {
    console.error('Failed to read forum_categories.json:', error);
    return [];
  }
}

export async function getNewsletterSubscribersFromFile(): Promise<NewsletterSubscriber[]> {
  try {
    if (!(await fileExists(NEWSLETTER_SUBSCRIBERS_FILE_PATH))) {
      await fs.writeFile(NEWSLETTER_SUBSCRIBERS_FILE_PATH, JSON.stringify([], null, 2));
      return [];
    }
    const jsonData = await fs.readFile(NEWSLETTER_SUBSCRIBERS_FILE_PATH, 'utf-8');
    return JSON.parse(jsonData) as NewsletterSubscriber[];
  } catch (error) {
    console.error('Failed to read newsletter_subscribers.json:', error);
    return [];
  }
}

export async function addSubscriberToFile(newSubscriber: NewsletterSubscriber): Promise<void> {
  try {
    const subscribers = await getNewsletterSubscribersFromFile();
    subscribers.push(newSubscriber);
    await fs.writeFile(NEWSLETTER_SUBSCRIBERS_FILE_PATH, JSON.stringify(subscribers, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to add subscriber to newsletter_subscribers.json:', error);
    throw error;
  }
}
