
import { z } from 'zod';

export const MAX_IMAGE_SIZE_MB = 5;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

export const ValidImageFileSchema = z.instanceof(File, { message: "Image file is required." })
  .refine(file => file.size > 0, "Image file cannot be empty.")
  .refine(file => file.size <= MAX_IMAGE_SIZE_BYTES, `Image must be ${MAX_IMAGE_SIZE_MB}MB or less.`)
  .refine(file => ALLOWED_IMAGE_TYPES.includes(file.type), 'Invalid file type. Must be JPG, JPEG, or PNG.')
  .optional();

export const AvatarFileSchema = ValidImageFileSchema;

export const HSLColorSchema = z.string()
  .regex(
    /^\d{1,3}\s+\d{1,3}%\s+\d{1,3}(?:\.\d+)?%$/,
    "Invalid HSL format. Example: '271 100% 75.3%'"
  )
  .optional();

export const CodeBlockSchema = z.object({
  language: z.string().min(1, "Language is required."),
  code: z.string().min(10, "Code must be at least 10 characters.")
});

export const AboutUsContentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  missionTitle: z.string().min(1, "Mission title is required"),
  missionContentP1: z.string().min(1, "Mission paragraph 1 is required"),
  missionContentP2: z.string().min(1, "Mission paragraph 2 is required"),
  image1File: ValidImageFileSchema,
  existingImage1Url: z.string().optional(),
  image1Alt: z.string().optional(),
  image1DataAiHint: z.string().max(30, "AI hint too long").optional(),
  offerTitle: z.string().min(1, "Offer title is required"),
  offerItems: z.preprocess(
    (val) => {
      const items: { title: string; description: string }[] = [];
      const data = val as Record<string, any>;
      let i = 0;
      while(data[`offerItems[${i}].title`] !== undefined || data[`offerItems[${i}].description`] !== undefined) {
        items.push({
          title: data[`offerItems[${i}].title`] || '',
          description: data[`offerItems[${i}].description`] || ''
        });
        delete data[`offerItems[${i}].title`];
        delete data[`offerItems[${i}].description`];
        i++;
      }
      if (items.length > 0) return items;
      if (Array.isArray(val)) return val;
      return [];
    },
    z.array(
      z.object({
        title: z.string().min(1, "Offer item title is required"),
        description: z.string().min(1, "Offer item description is required")
      })
    ).min(1, "At least one offer item is required")
  ),
  joinTitle: z.string().min(1, "Join title is required"),
  joinContent: z.string().min(1, "Join content is required"),
  image2File: ValidImageFileSchema,
  existingImage2Url: z.string().optional(),
  image2Alt: z.string().optional(),
  image2DataAiHint: z.string().max(30, "AI hint too long").optional(),
});

export const FAQItemSchema = z.object({
  question: z.string().min(1, "FAQ question cannot be empty."),
  answer: z.string().min(1, "FAQ answer cannot be empty.")
});

export const SupportPageContentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  emailSupportTitle: z.string().min(1, "Email support title is required"),
  emailSupportDescription: z.string().min(1, "Email support description is required"),
  emailAddress: z.string().email("Invalid email address"),
  forumTitle: z.string().min(1, "Forum title is required"),
  forumDescription: z.string().min(1, "Forum description is required"),
  forumLinkText: z.string().min(1, "Forum link text is required"),
  forumLinkUrl: z.string().url("Invalid URL for forum link").or(z.literal('#')),
  faqTitle: z.string().min(1, "FAQ title is required"),
  faqsJSON: z.string().refine(val => {
    try {
      const parsed = JSON.parse(val);
      return z.array(FAQItemSchema).min(1, "At least one FAQ item is required.").safeParse(parsed).success;
    } catch {
      return false;
    }
  }, "Invalid JSON format for FAQs or FAQs array is empty. Ensure it's an array of objects with 'question' and 'answer'.")
});

export const GuidelinesPageContentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  mainPlaceholderTitle: z.string().min(1, "Placeholder title is required"),
  mainPlaceholderContent: z.string().min(1, "Placeholder content is required"),
  keyAreasTitle: z.string().min(1, "Key areas title is required"),
  keyAreas: z.array(z.string().min(1, "Key area item cannot be empty"))
              .min(1, "At least one key area is required"),
  keyAreasJSON: z.string().optional(),
}).transform(data => {
  if (data.keyAreasJSON) {
    try {
      const parsedKeyAreas = JSON.parse(data.keyAreasJSON);
      if (Array.isArray(parsedKeyAreas) && parsedKeyAreas.every(item => typeof item === 'string')) {
        data.keyAreas = parsedKeyAreas;
      }
    } catch (e) {
      // If parsing fails, keep original data.keyAreas or it will be an empty array if not present
    }
  }
  const { keyAreasJSON, ...rest } = data;
  return rest;
});


export const TopDesignersPageContentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  mainPlaceholderTitle: z.string().min(1, "Placeholder title is required"),
  mainPlaceholderContent: z.string().min(1, "Placeholder content is required"),
});

export const TeamMemberSchemaClient = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  imageUrl: z.string().optional(),
  imageAlt: z.string().optional(),
  imageDataAiHint: z.string().max(30, "AI hint too long").optional(),
  githubUrl: z.string().url("Invalid GitHub URL").or(z.literal("")).optional(),
  linkedinUrl: z.string().url("Invalid LinkedIn URL").or(z.literal("")).optional(),
  emailAddress: z.string().email("Invalid Email Address").or(z.literal("")).optional(),
});

export const TeamMembersContentSchemaClient = z.object({
  title: z.string().min(1, "Section title is required"),
  founder: TeamMemberSchemaClient,
  coFounder: TeamMemberSchemaClient,
  founderImageFile: ValidImageFileSchema,
  coFounderImageFile: ValidImageFileSchema,
  "founder.existingImageUrl": z.string().optional(),
  "coFounder.existingImageUrl": z.string().optional(),
});

export const pageContentSchemasMap = {
  aboutUs: AboutUsContentSchema,
  support: SupportPageContentSchema,
  guidelines: GuidelinesPageContentSchema,
  topDesigners: TopDesignersPageContentSchema,
  teamMembers: TeamMembersContentSchemaClient,
};

export const VerificationApplicationSchema = z.object({
    fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
    username: z.string()
      .min(3, { message: "Username must be at least 2 characters plus @." })
      .regex(/^@[a-zA-Z0-9_]+$/, { message: "Username must start with @ and contain only letters, numbers, or underscores." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    phone: z.string().min(10, { message: "Please enter a valid phone number with country code." })
      .regex(/^\+[1-9]\d{1,14}$/, { message: "Phone number must start with + and country code (e.g., +1234567890)." }),
    terms: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms and conditions." }),
    }),
    userId: z.string().optional(), // If user is logged in
});

