import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

/**
 * SNS 가입에서 provider 가 이메일을 주지 않았을 때 직접 입력받는 값.
 * 인증 통과 여부는 서버가 발급하는 signupToken 으로 판정하므로
 * 이 스키마에는 isVerified 같은 플래그를 두지 않는다.
 */
export const snsEmailSchema = z.object({
  email: z.string().email(),
  verificationCode: z.string().min(1),
});

export type SnsEmailFormValues = z.infer<typeof snsEmailSchema>;

export const snsEmailFormResolver = zodResolver(snsEmailSchema);
