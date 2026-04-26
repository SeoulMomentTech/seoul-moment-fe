"use client";

import type { ClipboardEvent, FormEvent, KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";

import { Button, cn, Flex } from "@seoul-moment/ui";

import { RESEND_INITIAL_SECONDS, VERIFY_CODE_LENGTH } from "../model/schema";

const EMPTY_CODE = Array<string>(VERIFY_CODE_LENGTH).fill("");
const SLOT_IDS = ["a", "b", "c", "d", "e", "f"] as const;

export default function VerifyCodeForm() {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [code, setCode] = useState<string[]>(EMPTY_CODE);
  const [seconds, setSeconds] = useState(RESEND_INITIAL_SECONDS);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  const focusInput = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    setCode((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < VERIFY_CODE_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      focusInput(index - 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, VERIFY_CODE_LENGTH);
    if (!text) return;
    e.preventDefault();
    const next = [...EMPTY_CODE];
    for (let i = 0; i < text.length; i++) next[i] = text[i] ?? "";
    setCode(next);
    focusInput(Math.min(text.length, VERIFY_CODE_LENGTH - 1));
  };

  const isValid = code.every((c) => c.length === 1);
  const canResend = seconds <= 0;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    // TODO: API 연동 — 인증코드 검증
  };

  const handleResend = () => {
    // TODO: API 연동 — 인증코드 재발송
    setCode(EMPTY_CODE);
    setSeconds(RESEND_INITIAL_SECONDS);
    focusInput(0);
  };

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      <div className="w-full pt-10">
        <Flex align="center" className="w-full" gap={10} justify="center">
          {SLOT_IDS.map((slotId, index) => (
            <input
              autoComplete="one-time-code"
              className={cn(
                "aspect-square w-full min-w-0 max-w-12 rounded-[4px] border border-black/20",
                "text-body-2 text-center font-semibold text-black outline-none",
                "focus:border-black",
              )}
              inputMode="numeric"
              key={slotId}
              maxLength={1}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              value={code[index]}
            />
          ))}
        </Flex>
      </div>

      <div className="w-full pt-[30px]">
        <Button
          className={cn("h-12 w-full font-semibold")}
          disabled={!isValid}
          type="submit"
        >
          확인
        </Button>
      </div>

      <Flex
        align="center"
        className="w-full pt-[20px]"
        gap={8}
        justify="center"
      >
        <span className="text-body-3 leading-none text-black">
          인증코드를 받지 못하셨나요?
        </span>
        {canResend ? (
          <button
            className="text-body-3 cursor-pointer leading-none text-black underline"
            onClick={handleResend}
            type="button"
          >
            재발송
          </button>
        ) : (
          <span className="text-body-3 leading-none text-black/40">
            재발송 {seconds}초
          </span>
        )}
      </Flex>
    </form>
  );
}
