import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { nicknameSchema } from "./schema";

export const snsSignupSchema = z.object({
  nickname: nicknameSchema,
  newProductAgreed: z.boolean(),
  adAgreed: z.boolean(),
  recommendAgreed: z.boolean(),
});

export type SnsSignupFormValues = z.infer<typeof snsSignupSchema>;

export const snsSignupFormResolver = zodResolver(snsSignupSchema);
