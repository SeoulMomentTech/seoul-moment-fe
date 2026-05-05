import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export const requestSchema = z.object({
  account: z.string().min(1),
});

export type RequestFormValues = z.infer<typeof requestSchema>;

export const requestFormResolver = zodResolver(requestSchema);

export const VERIFY_CODE_LENGTH = 6;
export const RESEND_INITIAL_SECONDS = 28;
