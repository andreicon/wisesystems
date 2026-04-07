import { z } from "zod";

export const registerQuerySchema = z.object({
    email: z.string().email(),
    fname: z.string().trim().min(1),
    lname: z.string().trim().min(1),
    password: z.string().min(8),
});

export type RegisterQuery = z.infer<typeof registerQuerySchema>;

export const loginQuerySchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export type LoginQuery = z.infer<typeof loginQuerySchema>;