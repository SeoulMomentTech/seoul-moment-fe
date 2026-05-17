"use client";

import { useState } from "react";

import { Check, CheckCircle2, CircleAlert } from "lucide-react";

import { cn } from "@shared/lib/style";

import { Button, Label } from "@seoul-moment/ui";

import { useGetUserInfoQuery } from "../api/useGetUserInfoQuery";

interface LoginInfoSectionProps {
  className?: string;
}

const SECTION_TITLE_CLASS = "text-body-1 font-semibold text-black";
const FIELD_LABEL_CLASS = "text-body-3 text-black";

interface NotificationOption {
  key: string;
  title: string;
  description: string;
}

const NOTIFICATION_OPTIONS: ReadonlyArray<NotificationOption> = [
  {
    key: "new-arrival",
    title: "신상품 및 기획전 출시 알림",
    description: "개인 전용 혜택 및 관심 상품 가격 인하 알림",
  },
  {
    key: "promotion",
    title: "광고 및 이벤트 할인 이메일",
    description: "현재 진행 중인 프로모션 알림",
  },
  {
    key: "recommend",
    title: "개인 맞춤 상품 추천 알림",
    description: "개인 전용 혜택 및 관심 상품 가격 인하 알림",
  },
];

function AccountValueField({
  value,
  verified,
  unverifiedMessage,
  hideAction = false,
}: {
  value: string;
  verified: boolean;
  unverifiedMessage?: string;
  hideAction?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-[10px]">
        <div className="flex h-[48px] flex-1 items-center justify-between rounded-[4px] border border-black/20 px-[12px]">
          <span className="text-body-2 text-black">{value}</span>
          {verified ? (
            <CheckCircle2 className="text-info size-[18px] shrink-0" />
          ) : (
            <CircleAlert className="text-error size-[18px] shrink-0" />
          )}
        </div>
        {hideAction ? null : (
          <Button
            className="h-[48px] shrink-0 px-[16px]"
            type="button"
            variant={verified ? "outline" : "default"}
          >
            {verified ? "수정" : "인증"}
          </Button>
        )}
      </div>
      {verified || !unverifiedMessage ? null : (
        <span className="text-body-5 text-error">{unverifiedMessage}</span>
      )}
    </div>
  );
}

export function LoginInfoSection({ className }: LoginInfoSectionProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const { data: userInfo } = useGetUserInfoQuery();
  const email = userInfo?.email ?? "";
  const phone = userInfo?.phone ?? "";
  const phoneVerified = Boolean(userInfo?.phone);

  const isDirty = NOTIFICATION_OPTIONS.some(
    (option) => checked[option.key] === true,
  );

  return (
    <section
      className={cn(
        "flex w-[598px] flex-col gap-10 max-sm:w-full max-sm:gap-8",
        className,
      )}
    >
      <h2 className="text-title-4 sm:text-title-3 font-bold text-black">
        로그인 정보
      </h2>

      <div className="flex flex-col gap-5">
        <h3 className={SECTION_TITLE_CLASS}>내 계정</h3>
        <div className="flex flex-col gap-2">
          <Label className={FIELD_LABEL_CLASS}>휴대폰번호</Label>
          <AccountValueField
            unverifiedMessage="휴대폰 번호를 인증해주세요."
            value={phone}
            verified={phoneVerified}
          />
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <h3 className={SECTION_TITLE_CLASS}>혜택 정보</h3>
        <div className="flex flex-col gap-2">
          <Label className={FIELD_LABEL_CLASS}>이메일주소</Label>
          <AccountValueField hideAction value={email} verified />
        </div>

        <div className="flex flex-col gap-4">
          <span className="text-body-3 text-black/50">
            이메일 &amp; 유선 수신 설정
          </span>
          <div className="flex flex-col gap-5">
            {NOTIFICATION_OPTIONS.map((option) => {
              const active = checked[option.key] === true;

              return (
                <button
                  className="flex items-start gap-[10px] text-left"
                  key={option.key}
                  onClick={() =>
                    setChecked((prev) => ({
                      ...prev,
                      [option.key]: !prev[option.key],
                    }))
                  }
                  type="button"
                >
                  <span
                    className={cn(
                      "mt-[1px] flex size-[16px] shrink-0 items-center justify-center rounded-full border transition-colors",
                      active
                        ? "border-black bg-black text-white"
                        : "border-black/30 bg-white",
                    )}
                  >
                    {active ? <Check className="size-[12px]" /> : null}
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="text-body-3 text-black">
                      {option.title}
                    </span>
                    <span className="text-body-5 text-black/40">
                      {option.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <Button
        className="h-[56px] w-full"
        disabled={!isDirty}
        size="lg"
        type="button"
      >
        수정사항 저장
      </Button>
    </section>
  );
}
