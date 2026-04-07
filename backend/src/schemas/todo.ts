import { z } from "zod";

export const createTodoSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1).optional(),
  completed: z.boolean().optional(),
});

export const updateTodoSchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    description: z.string().trim().min(1).nullable().optional(),
    completed: z.boolean().optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field is required",
  });

export const todoIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const todoPaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});
