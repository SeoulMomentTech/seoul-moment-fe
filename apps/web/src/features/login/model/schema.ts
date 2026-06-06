import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export const loginSchema = z.object({
  account: z.string().min(1),
  password: z.string().min(1),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const loginFormResolver = zodResolver(loginSchema);
