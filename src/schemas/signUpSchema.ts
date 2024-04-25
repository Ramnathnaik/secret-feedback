import {z} from 'zod';

export const usernameValidation = z
    .string()
    .min(3, 'Username must have atleast 2 characters')
    .max(20, 'Username must not exceed 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username must not contain special characters');

export const passwordValidation = z
    .string()
    .min(6, {message: 'Password must be at least 6 characters'})
    .max(15, {message: 'Password length should not exceed 15 characters'});

export const emailValidation = z
    .string()
    .email({message: 'Email is invalid'});

export const signUpSchema = z.object({
    username: usernameValidation,
    password: passwordValidation,
    email: emailValidation
})