import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  NICKNAME_MAX_LENGTH,
  NICKNAME_MIN_LENGTH,
  NICKNAME_PATTERN,
} from "@shared/lib/nickname";

export const snsSignupSchema = z.object({
  nickname: z
    .string()
    .min(NICKNAME_MIN_LENGTH)
    .max(NICKNAME_MAX_LENGTH)
    .regex(NICKNAME_PATTERN),
  newProductAgreed: z.boolean(),
  adAgreed: z.boolean(),
  recommendAgreed: z.boolean(),
});

export type SnsSignupFormValues = z.infer<typeof snsSignupSchema>;

export const snsSignupFormResolver = zodResolver(snsSignupSchema);
