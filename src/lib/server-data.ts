
// This file is only imported by server-side code (e.g., server actions, API routes)
import type { StoredAdminUser, StoredUser, Design, SiteSettings, PageContentData, PageContentKeys, TeamMembersContent, TeamMember, ForumCategory, NewsletterSubscriber, ForumTopic, ForumPost, PrivacyPolicyContent, VerificationRequest } from './types';
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
const VERIFICATION_REQUESTS_FILE_PATH = path.join(process.cwd(), 'verification_requests.json');


// New Forum Data Files with consistent naming
const FORUM_GENERAL_DISCUSSION_FILE_PATH = path.join(process.cwd(), 'forum_general_discussion.json');
const FORUM_ANNOUNCEMENTS_FILE_PATH = path.join(process.cwd(), 'forum_announcements.json');
const FORUM_SUPPORT_QA_FILE_PATH = path.join(process.cwd(), 'forum_support_qa.json');


// Old files to be deprecated or re-purposed if necessary - for now, we'll mostly ignore them for new operations.
const DEPRECATED_FORUM_TOPICS_FILE_PATH = path.join(process.cwd(), 'forum_topics.json');
const DEPRECATED_FORUM_POSTS_FILE_PATH = path.join(process.cwd(), 'forum_posts.json');


const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteTitle: "Reactiverse",
  allowNewUserRegistrations: true,
  themeColors: {
    primaryHSL: "271 100% 75.3%",
    accentHSL: "300 100% 70%",
  },
  logoPath: "/default-logo.png"
};

const DEFAULT_TEAM_MEMBER_DATA: TeamMember = {
  name: "Default Name",
  title: "Default Title",
  bio: "Default bio.",
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
    ...DEFAULT_TEAM_MEMBER_DATA,
    name: "Avik Samanta",
    title: "Founder & CEO",
    bio: "Cybersecurity Engineer | Blockchain Specialist | Bug Bounty Hunter.\r\nSkilled in vulnerability research, ethical hacking, and securing digital infrastructures. Passionate about advancing blockchain security, identifying threats, and building innovative security solutions.",
    imageUrl: "/content_images/team/founder_image-1750057132178.jpg",
    imageAlt: "Avik Samanta, Founder of Reactiverse",
  },
  coFounder: {
    ...DEFAULT_TEAM_MEMBER_DATA,
    name: "Anusha Gupta",
    title: "Co-Founder & CTO",
    bio: "Software Developer | AI Web Developer | Cybersecurity Enthusiast.\r\nSkilled in software and web development, AI integration, Python automation, and secure application design. Focused on leveraging machine learning and vulnerability research to create innovative, secure solutions.",
    imageUrl: "/content_images/team/cofounder_image-1750057132178.jpg",
    imageAlt: "Anusha Gupta, Co-Founder of Reactiverse",
  }
};

const DEFAULT_PRIVACY_POLICY_CONTENT: PrivacyPolicyContent = {
  title: "Privacy Policy for Reactiverse",
  description: "Your privacy is important to us. This policy outlines how we collect, use, and protect your information.",
  lastUpdated: "June 17, 2025",
  sections: [
    {
      heading: "Information We Collect",
      content: "We collect information you provide directly to us, such as when you create an account, submit designs, or communicate with us. This may include:\n- Account Information: Name, username, email address, phone number, password.\n- User Content: Designs, code snippets, descriptions, tags, and any other content you submit.\n- Communications: Information you provide when you contact us for support or other inquiries."
    },
    {
      heading: "How We Use Your Information",
      content: "We use the information we collect to:\n- Provide, maintain, and improve our services.\n- Allow you to create and manage your account and designs.\n- Enable communication between users (where applicable and with consent).\n- Respond to your comments, questions, and requests.\n- Send you technical notices, updates, security alerts, and support messages.\n- Monitor and analyze trends, usage, and activities in connection with our services.\n- Personalize and improve the services and provide content or features that match user profiles or interests.\n- Comply with legal obligations."
    },
    {
      heading: "Sharing of Information",
      content: "We do not share your personal information with third parties except in the following circumstances or as otherwise described in this Privacy Policy:\n- With your consent or at your direction.\n- For legal reasons, such as to comply with a subpoena, or if we believe in good faith that disclosure is necessary to protect our rights, protect your safety or the safety of others, investigate fraud, or respond to a government request.\n- In connection with, or during negotiations of, any merger, sale of company assets, financing or acquisition of all or a portion of our business by another company."
    },
    {
      heading: "Your Choices",
      content: "Account Information: You may update, correct, or delete information about you at any time by logging into your online account or emailing us at mintfire.official@gmail.com.\nPublic Information: Your username and submitted designs are public. You can control the visibility of your email and phone number in your profile settings.\nCookies: Most web browsers are set to accept cookies by default. If you prefer, you can usually choose to set your browser to remove or reject browser cookies."
    },
    {
      heading: "Data Security",
      content: "We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction."
    },
    {
      heading: "Children's Privacy",
      content: "Reactiverse is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we learn that we have collected personal information from a child under 13, we will take steps to delete the information as soon as possible."
    },
    {
      heading: "Changes to This Policy",
      content: "We may change this Privacy Policy from time to time. If we make changes, we will notify you by revising the date at the top of the policy and, in some cases, we may provide you with additional notice (such as adding a statement to our homepage or sending you a notification)."
    },
    {
      heading: "Contact Us",
      content: "If you have any questions about this Privacy Policy, please contact us at: mintfire.official@gmail.com"
    }
  ]
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
    emailAddress: "mintfire.official@gmail.com",
    forumTitle: "Community Forum",
    forumDescription: "Ask questions and find answers in our community.",
    forumLinkText: "Visit Support & Q/A Forum",
    forumLinkUrl: "/community/category/support-qa",
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
        "answer": "We take your privacy seriously. You can manage the visibility of your email and phone number in your profile settings. Please review our Privacy Policy page for comprehensive details on how we collect, use, and protect your data."
      },
      {
        "question": "Who can I contact for support?",
        "answer": "If you have questions or need assistance, you can reach out to us via email at mintfire.official@gmail.com or visit our community forum to connect with other users and our team."
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
  teamMembers: DEFAULT_TEAM_MEMBERS_CONTENT,
  privacyPolicy: DEFAULT_PRIVACY_POLICY_CONTENT,
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

async function readJsonFile<T>(filePath: string, defaultValue: T): Promise<T> {
  try {
    if (!(await fileExists(filePath))) {
      await fs.writeFile(filePath, JSON.stringify(defaultValue, null, 2));
      return defaultValue;
    }
    const jsonData = await fs.readFile(filePath, 'utf-8');
    const parsedData = JSON.parse(jsonData);

    if (Array.isArray(defaultValue)) {
      return Array.isArray(parsedData) ? parsedData as T : defaultValue;
    }
    
    if (filePath === PAGE_CONTENT_FILE_PATH && typeof defaultValue === 'object' && defaultValue !== null) {
        const defaultTyped = defaultValue as PageContentData;
        const parsedTyped = parsedData as Partial<PageContentData>;

        const result: PageContentData = {
            aboutUs: { ...defaultTyped.aboutUs, ...(parsedTyped.aboutUs || {}) },
            support: {
                ...defaultTyped.support,
                ...(parsedTyped.support || {}),
                faqs: (parsedTyped.support?.faqs && Array.isArray(parsedTyped.support.faqs))
                      ? parsedTyped.support.faqs
                      : defaultTyped.support.faqs,
            },
            guidelines: {
                ...defaultTyped.guidelines,
                ...(parsedTyped.guidelines || {}),
                keyAreas: (parsedTyped.guidelines?.keyAreas && Array.isArray(parsedTyped.guidelines.keyAreas))
                          ? parsedTyped.guidelines.keyAreas
                          : defaultTyped.guidelines.keyAreas,
            },
            topDesigners: { ...defaultTyped.topDesigners, ...(parsedTyped.topDesigners || {}) },
            teamMembers: {
                ...defaultTyped.teamMembers,
                ...(parsedTyped.teamMembers || {}),
                founder: { ...defaultTyped.teamMembers.founder, ...(parsedTyped.teamMembers?.founder || {}) },
                coFounder: { ...defaultTyped.teamMembers.coFounder, ...(parsedTyped.teamMembers?.coFounder || {}) }
            },
            privacyPolicy: {
                ...defaultTyped.privacyPolicy,
                ...(parsedTyped.privacyPolicy || {}),
                sections: (parsedTyped.privacyPolicy?.sections && Array.isArray(parsedTyped.privacyPolicy.sections))
                          ? parsedTyped.privacyPolicy.sections
                          : defaultTyped.privacyPolicy.sections,
            }
        };
        return result as T;
    }
    
    if (typeof defaultValue === 'object' && defaultValue !== null && typeof parsedData === 'object' && parsedData !== null) {
      return { ...defaultValue, ...parsedData as Partial<T> } as T;
    }

    return parsedData as T;

  } catch (error) {
    console.error(`Failed to read or initialize ${filePath}:`, error);
    try {
        await fs.writeFile(filePath, JSON.stringify(defaultValue, null, 2));
        return defaultValue;
    } catch (writeError) {
        console.error(`Failed to write default value to ${filePath} after read error:`, writeError);
        return defaultValue;
    }
  }
}


async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Failed to write to ${filePath}:`, error);
    throw error;
  }
}


export async function getAdminUsers(): Promise<StoredAdminUser[]> {
  const admins = await readJsonFile<StoredAdminUser[]>(ADMIN_USERS_FILE_PATH, []);
  return admins.map(admin => ({
    ...admin,
    twoFactorEnabled: admin.twoFactorEnabled === undefined ? false : admin.twoFactorEnabled,
  }));
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
  const users = await readJsonFile<StoredUser[]>(USERS_FILE_PATH, []);
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
    isVerified: user.isVerified === undefined ? false : user.isVerified,
  }));
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
        isVerified: newUser.isVerified === undefined ? false : newUser.isVerified,
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
        isVerified: updatedUser.isVerified === undefined ? users[userIndex].isVerified : updatedUser.isVerified,
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
  const designs = await readJsonFile<Design[]>(DESIGNS_FILE_PATH, []);
  return designs.map(design => ({
    ...design,
    copyCount: design.copyCount === undefined ? 0 : design.copyCount,
    likedBy: design.likedBy === undefined ? [] : design.likedBy,
  }));
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
  return readJsonFile<SiteSettings>(SETTINGS_FILE_PATH, DEFAULT_SITE_SETTINGS);
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
    return readJsonFile<PageContentData>(PAGE_CONTENT_FILE_PATH, DEFAULT_PAGE_CONTENT);
}

export async function savePageContent(pageKey: PageContentKeys, content: any): Promise<void> {
  try {
    const allContent = await getPageContent(); // This will ensure defaults are loaded if file is new/corrupt
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
  const defaultCategories: ForumCategory[] = [
    { id: "cat-001", name: "General Discussion", description: "Talk about anything related to UI/UX design, development, and Reactiverse.", iconName: "MessagesSquare", slug:"general-discussion", topicCount: 0, postCount: 0 },
    { id: "cat-005", name: "Announcements", description: "Stay updated with the latest news and announcements from the Reactiverse team.", iconName: "Megaphone", slug: "announcements", topicCount: 0, postCount: 0 },
    { id: "cat-006", name: "Support & Q/A", description: "Got questions about using Reactiverse? Find answers and support.", iconName: "HelpCircle", slug: "support-qa", topicCount: 0, postCount: 0 }
  ];
  return readJsonFile<ForumCategory[]>(FORUM_CATEGORIES_FILE_PATH, defaultCategories);
}


export async function saveForumCategoriesToFile(categories: ForumCategory[]): Promise<void> {
  try {
    await fs.writeFile(FORUM_CATEGORIES_FILE_PATH, JSON.stringify(categories, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save forum_categories.json:', error);
    throw error;
  }
}

export async function addForumCategoryToFile(newCategory: ForumCategory): Promise<void> {
  try {
    const categories = await getForumCategoriesFromFile();
    categories.push(newCategory);
    await saveForumCategoriesToFile(categories);
  } catch (error) {
    console.error('Failed to add category to forum_categories.json:', error);
    throw error;
  }
}

// --- New Forum Data Functions ---

// General purpose function to get topics from a specific file
async function getTopicsFromFile(filePath: string): Promise<ForumTopic[]> {
  const topics = await readJsonFile<ForumTopic[]>(filePath, []);
  // Ensure viewCount defaults to 0 if missing
  return topics.map(topic => ({
    ...topic,
    viewCount: topic.viewCount === undefined ? 0 : topic.viewCount,
    posts: topic.posts || [], // Ensure posts array exists
  }));
}

// General purpose function to save topics to a specific file
async function saveTopicsToFile(filePath: string, topics: ForumTopic[]): Promise<void> {
  await writeJsonFile<ForumTopic[]>(filePath, topics);
}

export async function getUsersForumData(): Promise<ForumTopic[]> {
  return getTopicsFromFile(FORUM_GENERAL_DISCUSSION_FILE_PATH);
}
export async function saveUsersForumData(topics: ForumTopic[]): Promise<void> {
  await saveTopicsToFile(FORUM_GENERAL_DISCUSSION_FILE_PATH, topics);
}

export async function getAnnouncementsData(): Promise<ForumTopic[]> {
  return getTopicsFromFile(FORUM_ANNOUNCEMENTS_FILE_PATH);
}
export async function saveAnnouncementsData(topics: ForumTopic[]): Promise<void> {
  await saveTopicsToFile(FORUM_ANNOUNCEMENTS_FILE_PATH, topics);
}

export async function getSupportForumData(): Promise<ForumTopic[]> {
  return getTopicsFromFile(FORUM_SUPPORT_QA_FILE_PATH);
}
export async function saveSupportForumData(topics: ForumTopic[]): Promise<void> {
  await saveTopicsToFile(FORUM_SUPPORT_QA_FILE_PATH, topics);
}

// Deprecate old topic/post functions or adapt them if they have other uses.
// For this refactor, direct use of the new functions is preferred.
export async function getForumTopicsFromFile(): Promise<ForumTopic[]> {
    console.warn("getForumTopicsFromFile is deprecated. Use category-specific functions like getUsersForumData, getAnnouncementsData, or getSupportForumData.");
    return readJsonFile<ForumTopic[]>(DEPRECATED_FORUM_TOPICS_FILE_PATH, []);
}
export async function saveForumTopicsToFile(topics: ForumTopic[]): Promise<void> {
    console.warn("saveForumTopicsToFile is deprecated. Use category-specific functions like saveUsersForumData, saveAnnouncementsData, or saveSupportForumData.");
    await writeJsonFile<ForumTopic[]>(DEPRECATED_FORUM_TOPICS_FILE_PATH, topics);
}
export async function addForumTopicToFile(newTopic: ForumTopic, categorySlug: string): Promise<void> {
  let topics;
  let saveFunction;

  const topicWithViewCountAndPosts = { ...newTopic, viewCount: 0, posts: newTopic.posts || [] };

  switch (categorySlug) {
    case 'general-discussion':
      topics = await getUsersForumData();
      saveFunction = saveUsersForumData;
      break;
    case 'announcements':
      topics = await getAnnouncementsData();
      saveFunction = saveAnnouncementsData;
      break;
    case 'support-qa':
      topics = await getSupportForumData();
      saveFunction = saveSupportForumData;
      break;
    default:
      console.error(`Unknown category slug for adding topic: ${categorySlug}`);
      throw new Error(`Cannot add topic to unknown category: ${categorySlug}`);
  }
  topics.push(topicWithViewCountAndPosts);
  await saveFunction(topics);
}

export async function addPostToTopic(
  topicId: string,
  categorySlug: string,
  newPost: ForumPost
): Promise<{ success: boolean; updatedTopic?: ForumTopic }> {
  let topics: ForumTopic[];
  let saveFunction: (topics: ForumTopic[]) => Promise<void>;
  let filePath: string; // For debugging or direct access if needed, though saveFunction encapsulates it.

  switch (categorySlug) {
    case 'general-discussion':
      filePath = FORUM_GENERAL_DISCUSSION_FILE_PATH;
      topics = await getUsersForumData();
      saveFunction = saveUsersForumData;
      break;
    case 'announcements':
      filePath = FORUM_ANNOUNCEMENTS_FILE_PATH;
      topics = await getAnnouncementsData();
      saveFunction = saveAnnouncementsData;
      break;
    case 'support-qa':
      filePath = FORUM_SUPPORT_QA_FILE_PATH;
      topics = await getSupportForumData();
      saveFunction = saveSupportForumData;
      break;
    default:
      console.error(`Unknown category slug for adding post: ${categorySlug}`);
      return { success: false };
  }

  const topicIndex = topics.findIndex(t => t.id === topicId);
  if (topicIndex === -1) {
    console.error(`Topic with ID ${topicId} not found in category ${categorySlug} (file: ${filePath})`);
    return { success: false };
  }

  const topicToUpdate = topics[topicIndex];
  if (!topicToUpdate.posts) {
    topicToUpdate.posts = [];
  }
  topicToUpdate.posts.push(newPost);
  topicToUpdate.replyCount = (topicToUpdate.replyCount || 0) + 1;
  topicToUpdate.lastRepliedAt = newPost.createdAt;

  await saveFunction(topics);

  // Update category counts
  const categories = await getForumCategoriesFromFile();
  const categoryIndex = categories.findIndex(c => c.slug === categorySlug);
  if (categoryIndex !== -1) {
    categories[categoryIndex].postCount = (categories[categoryIndex].postCount || 0) + 1;
    await saveForumCategoriesToFile(categories);
  } else {
    console.warn(`Category with slug ${categorySlug} not found in forum_categories.json during post count update.`);
  }

  return { success: true, updatedTopic: topicToUpdate };
}


// Post data functions (posts are now embedded, so these are mainly for direct manipulation if needed)
export async function getForumPostsFromFile(): Promise<ForumPost[]> {
    console.warn("getForumPostsFromFile is deprecated as posts are now embedded in topics.");
    return readJsonFile<ForumPost[]>(DEPRECATED_FORUM_POSTS_FILE_PATH, []);
}
export async function saveForumPostsToFile(posts: ForumPost[]): Promise<void> {
    console.warn("saveForumPostsToFile is deprecated as posts are now embedded in topics.");
    await writeJsonFile<ForumPost[]>(DEPRECATED_FORUM_POSTS_FILE_PATH, posts);
}

export async function deleteTopic(topicId: string, categorySlug: string): Promise<{ success: boolean; postsDeleted: number }> {
  let topics: ForumTopic[];
  let saveFunction: (topics: ForumTopic[]) => Promise<void>;
  let filePath: string;

  switch (categorySlug) {
    case 'general-discussion':
      filePath = FORUM_GENERAL_DISCUSSION_FILE_PATH;
      topics = await getUsersForumData();
      saveFunction = saveUsersForumData;
      break;
    case 'announcements':
      filePath = FORUM_ANNOUNCEMENTS_FILE_PATH;
      topics = await getAnnouncementsData();
      saveFunction = saveAnnouncementsData;
      break;
    case 'support-qa':
      filePath = FORUM_SUPPORT_QA_FILE_PATH;
      topics = await getSupportForumData();
      saveFunction = saveSupportForumData;
      break;
    default:
      console.error(`Unknown category slug for deleting topic: ${categorySlug}`);
      return { success: false, postsDeleted: 0 };
  }

  const topicIndex = topics.findIndex(t => t.id === topicId);
  if (topicIndex === -1) {
    return { success: false, postsDeleted: 0 }; // Topic not found
  }

  const deletedTopic = topics[topicIndex];
  const postsDeleted = deletedTopic.posts?.length || 0;

  topics.splice(topicIndex, 1); // Remove the topic
  await saveFunction(topics); // Save the updated list of topics

  // Update category counts
  const categories = await getForumCategoriesFromFile();
  const categoryIndex = categories.findIndex(c => c.slug === categorySlug);
  if (categoryIndex !== -1) {
    categories[categoryIndex].topicCount = (categories[categoryIndex].topicCount || 1) - 1;
    categories[categoryIndex].postCount = (categories[categoryIndex].postCount || postsDeleted) - postsDeleted;
    if (categories[categoryIndex].topicCount! < 0) categories[categoryIndex].topicCount = 0;
    if (categories[categoryIndex].postCount! < 0) categories[categoryIndex].postCount = 0;
    await saveForumCategoriesToFile(categories);
  }

  return { success: true, postsDeleted };
}

export async function deletePostFromTopic(
  postId: string,
  topicId: string,
  categorySlug: string
): Promise<{ success: boolean; postDeletedCount: number }> {
  let topics: ForumTopic[];
  let saveFunction: (topics: ForumTopic[]) => Promise<void>;

  switch (categorySlug) {
    case 'general-discussion':
      topics = await getUsersForumData();
      saveFunction = saveUsersForumData;
      break;
    case 'announcements':
      topics = await getAnnouncementsData();
      saveFunction = saveAnnouncementsData;
      break;
    case 'support-qa':
      topics = await getSupportForumData();
      saveFunction = saveSupportForumData;
      break;
    default:
      console.error(`Unknown category slug for deleting post: ${categorySlug}`);
      return { success: false, postDeletedCount: 0 };
  }

  const topicIndex = topics.findIndex(t => t.id === topicId);
  if (topicIndex === -1) {
    console.error(`Topic with ID ${topicId} not found in category ${categorySlug} for post deletion.`);
    return { success: false, postDeletedCount: 0 };
  }

  const topicToUpdate = topics[topicIndex];
  if (!topicToUpdate.posts) {
    topicToUpdate.posts = [];
  }

  const postIndex = topicToUpdate.posts.findIndex(p => p.id === postId);
  if (postIndex === -1) {
    console.error(`Post with ID ${postId} not found in topic ${topicId}.`);
    return { success: false, postDeletedCount: 0 };
  }

  topicToUpdate.posts.splice(postIndex, 1);
  topicToUpdate.replyCount = (topicToUpdate.replyCount || 1) - 1;
  if (topicToUpdate.replyCount < 0) topicToUpdate.replyCount = 0;

  await saveFunction(topics);

  // Update category counts
  const categories = await getForumCategoriesFromFile();
  const categoryToUpdateIndex = categories.findIndex(c => c.slug === categorySlug);
  if (categoryToUpdateIndex !== -1) {
    categories[categoryToUpdateIndex].postCount = (categories[categoryToUpdateIndex].postCount || 1) - 1;
     if (categories[categoryToUpdateIndex].postCount! < 0) categories[categoryToUpdateIndex].postCount = 0;
    await saveForumCategoriesToFile(categories);
  }

  return { success: true, postDeletedCount: 1 };
}

export async function updateAnnouncementInFile(updatedTopic: ForumTopic): Promise<boolean> {
  try {
    let announcements = await getAnnouncementsData();
    const topicIndex = announcements.findIndex(t => t.id === updatedTopic.id);
    if (topicIndex === -1) {
      console.error('Announcement not found for update:', updatedTopic.id);
      return false;
    }
    // Preserve posts and other non-editable fields, only update title and content
    announcements[topicIndex] = {
      ...announcements[topicIndex], // Keep existing fields like posts, author, etc.
      title: updatedTopic.title,
      content: updatedTopic.content,
      // Potentially update a 'lastModifiedAt' field if you add one
    };
    await saveAnnouncementsData(announcements);
    return true;
  } catch (error) {
    console.error('Failed to update announcement in announcement.json:', error);
    throw error;
  }
}

// --- End New Forum Data Functions ---


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

export async function getVerificationRequestsFromFile(): Promise<VerificationRequest[]> {
  return readJsonFile<VerificationRequest[]>(VERIFICATION_REQUESTS_FILE_PATH, []);
}

export async function addVerificationRequestToFile(request: VerificationRequest): Promise<void> {
  const requests = await getVerificationRequestsFromFile();
  requests.push(request);
  await writeJsonFile<VerificationRequest[]>(VERIFICATION_REQUESTS_FILE_PATH, requests);
}

export async function updateVerificationRequestInFile(updatedRequest: VerificationRequest): Promise<boolean> {
  try {
    let requests = await getVerificationRequestsFromFile();
    const requestIndex = requests.findIndex(req => req.id === updatedRequest.id);
    if (requestIndex === -1) {
      console.error('Verification request not found for update:', updatedRequest.id);
      return false;
    }
    requests[requestIndex] = updatedRequest;
    await writeJsonFile<VerificationRequest[]>(VERIFICATION_REQUESTS_FILE_PATH, requests);
    return true;
  } catch (error) {
    console.error('Failed to update verification request:', error);
    throw error;
  }
}

