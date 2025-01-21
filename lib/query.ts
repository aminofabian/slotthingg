// lib/query.ts
import { QueryClient } from '@tanstack/react-query'
import { z } from 'zod'

// Define the form schema
export const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Type inference
export type FormData = z.infer<typeof formSchema>;

// Validation function
export const validateForm = (data: unknown) => {
  try {
    const validatedData = formSchema.parse(data);
    return { success: true, data: validatedData, errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.reduce((acc: Record<string, string>, curr) => {
        const path = curr.path[0] as string;
        acc[path] = curr.message;
        return acc;
      }, {});
      return { success: false, data: null, errors };
    }
    return { success: false, data: null, errors: { form: 'An error occurred' } };
  }
};

// Add this login schema
export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z.string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  username: z.string()
    .min(5, 'Username must be at least 5 characters')
    .max(50, 'Username must be less than 50 characters'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .refine((email) => email.includes('.'), 'Please enter a complete email address'),
  password: z.string()
    .min(5, 'Password must be at least 5 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one symbol'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  dateOfBirth: z.object({
    month: z.string().min(1, 'Month is required'),
    day: z.string().min(1, 'Day is required'),
    year: z.string().min(1, 'Year is required')
  }).refine((data) => {
    const dob = new Date(Number(data.year), Number(data.month) - 1, Number(data.day));
    const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    return age >= 16;
  }, { message: 'You must be at least 16 years old', path: ['year'] }),
  phoneNumber: z.string()
    .min(1, 'Phone number is required')
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number')
    .transform((val) => val.replace(/\s+/g, '')), // Remove spaces for validation
  address: z.string().optional(),
  referralEmail: z.string().email('Invalid email format').optional().or(z.literal('')),
  games: z.array(z.string())
    .optional()
    .refine((val) => !val || val.length <= 5, {
      message: 'You can select up to 5 games'
    }),
  termsAccepted: z.boolean({
    required_error: 'You must accept the terms and conditions',
  }).refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type SignupFormData = z.infer<typeof signupSchema>;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
    },
  },
})