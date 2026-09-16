import { Link } from "react-router";

import { ChevronLeft } from "lucide-react";

import { ImageWithFallback } from "@shared/components/image-with-fallback";
import { PATH } from "@shared/constants/route";
import type { GetAdminMemberResponse } from "@shared/services/member";
import { formatDate } from "@shared/utils/format";

import { MemberProviderBadge } from "../../components";

interface MemberDetailHeaderProps {
  member: GetAdminMemberResponse;
}

export function MemberDetailHeader({ member }: MemberDetailHeaderProps) {
  const isWithdrawn = Boolean(member.withdrawnAt);
  const imageUrl = member.profile?.imageUrl;
  // sns 는 이메일 가입과 탈퇴 회원 모두 null 이다. 탈퇴 회원은 가입 경로를
  // 알 수 없으므로 배지를 생략하고, 활성 회원의 null 은 이메일 가입으로 읽는다.
  const provider = member.sns?.provider ?? (isWithdrawn ? null : "EMAIL");

  return (
    <header className="mb-6">
      <Link
        className="duration-normal mb-4 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-900"
        to={PATH.MEMBERS}
      >
        <ChevronLeft className="size-4" />
        회원 목록
      </Link>

      <div className="flex flex-wrap items-center gap-4">
        {imageUrl ? (
          <ImageWithFallback
            alt=""
            className="size-14 shrink-0 rounded-full object-cover"
            src={imageUrl}
          />
        ) : (
          <span
            aria-hidden
            className="flex size-14 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xl font-semibold text-gray-500"
          >
            {member.nickname.slice(0, 1).toUpperCase()}
          </span>
        )}

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-2xl font-bold text-gray-900">
              {member.nickname}
            </h1>
            {provider && <MemberProviderBadge provider={provider} />}
            {isWithdrawn && (
              <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                {formatDate(member.withdrawnAt)} 탈퇴
              </span>
            )}
          </div>
          <p className="mt-1 truncate text-sm text-gray-600">
            {member.email}
            <span className="text-gray-500"> · 회원 ID {member.id}</span>
          </p>
        </div>
      </div>
    </header>
  );
}
