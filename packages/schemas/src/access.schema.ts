import { z } from "zod";

export const accessSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
})

export type RequestAccess = z.infer<typeof accessSchema>;


