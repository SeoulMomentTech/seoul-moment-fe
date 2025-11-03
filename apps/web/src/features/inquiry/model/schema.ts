import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export const inquirySchema = z.object({
  name: z.string().min(1, { message: "Please enter your name." }),
  email: z.email({ message: "Please enter a valid email address." }),
  code: z.string().min(1, { message: "Please enter the verification code" }),
  message: z
    .string()
    .min(30, { message: "Please enter at least 30 characters." }),
  isVerified: z.boolean().optional(),
  subject: z.string({ error: "Please enter the subject." }),
});

export type InquiryFormValues = z.infer<typeof inquirySchema>;

export const inquiryFormRezolver = zodResolver(inquirySchema);
