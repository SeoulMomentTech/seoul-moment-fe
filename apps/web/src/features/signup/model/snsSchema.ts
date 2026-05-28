import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export const snsSignupSchema = z.object({
  nickname: z.string().min(2).max(20),
  newProductAgreed: z.boolean(),
  adAgreed: z.boolean(),
  recommendAgreed: z.boolean(),
});

export type SnsSignupFormValues = z.infer<typeof snsSignupSchema>;

export const snsSignupFormResolver = zodResolver(snsSignupSchema);
