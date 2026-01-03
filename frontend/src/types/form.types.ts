import { z } from 'zod';

// ============================================================================
// AUTH FORM SCHEMAS
// ============================================================================

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Full name must be at least 2 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be less than 100 characters'),
});

// ============================================================================
// PROJECT FORM SCHEMAS
// ============================================================================

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .min(3, 'Project name must be at least 3 characters')
    .max(100, 'Project name must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
});

export const updateProjectSettingsSchema = z.object({
  name: z
    .string()
    .min(3, 'Project name must be at least 3 characters')
    .max(100, 'Project name must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  system_prompt: z
    .string()
    .max(2000, 'System prompt must be less than 2000 characters')
    .optional(),
  welcome_message: z
    .string()
    .max(500, 'Welcome message must be less than 500 characters')
    .optional(),
  fallback_message: z
    .string()
    .max(500, 'Fallback message must be less than 500 characters')
    .optional(),
});

// ============================================================================
// API KEY FORM SCHEMAS
// ============================================================================

export const createApiKeySchema = z.object({
  name: z
    .string()
    .min(1, 'API key name is required')
    .min(3, 'API key name must be at least 3 characters')
    .max(100, 'API key name must be less than 100 characters'),
});

// ============================================================================
// CHAT FORM SCHEMAS
// ============================================================================

export const chatMessageSchema = z.object({
  query: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message must be less than 2000 characters'),
});

// ============================================================================
// FEEDBACK FORM SCHEMAS
// ============================================================================

export const feedbackSchema = z.object({
  rating: z
    .number()
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5')
    .optional(),
  comment: z
    .string()
    .max(1000, 'Comment must be less than 1000 characters')
    .optional(),
});

// ============================================================================
// INFERRED TYPES FROM SCHEMAS
// ============================================================================

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type CreateProjectFormData = z.infer<typeof createProjectSchema>;
export type UpdateProjectSettingsFormData = z.infer<typeof updateProjectSettingsSchema>;
export type CreateApiKeyFormData = z.infer<typeof createApiKeySchema>;
export type ChatMessageFormData = z.infer<typeof chatMessageSchema>;
export type FeedbackFormData = z.infer<typeof feedbackSchema>;
