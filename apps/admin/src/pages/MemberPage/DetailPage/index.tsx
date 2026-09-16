import { Link, useParams } from "react-router";

import { ChevronLeft } from "lucide-react";

import { PATH } from "@shared/constants/route";
import type { AdminMemberId } from "@shared/services/member";

import { Skeleton } from "@seoul-moment/ui";

import { useAdminMemberQuery } from "../hooks";
import {
  MemberAccountPanel,
  MemberActivityTabs,
  MemberAgreementPanel,
  MemberDetailHeader,
  MemberFitPanel,
  MemberProfilePanel,
} from "./components";

const SKELETON_CARD_KEYS = ["account", "profile", "fit", "agreement"] as const;

function MemberDetailSkeleton() {
  return (
    <>
      <div className="mb-6 flex items-center gap-4">
        <Skeleton className="size-14 rounded-full" />
        <div>
          <Skeleton className="h-7 w-40" rounded />
          <Skeleton className="mt-2 h-4 w-60" rounded />
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(320px,380px)_1fr]">
        <div className="space-y-6">
          {SKELETON_CARD_KEYS.map((key) => (
            <Skeleton className="h-40 rounded-lg" key={key} />
          ))}
        </div>
        <Skeleton className="h-96 rounded-lg" />
      </div>
    </>
  );
}

function MemberNotFound() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-6 py-20 text-center shadow-sm">
      <p className="font-medium text-gray-900">회원을 찾을 수 없습니다</p>
      <p className="mt-1 text-sm text-gray-500">
        이미 삭제됐거나 잘못된 주소일 수 있습니다.
      </p>
      <Link
        className="duration-normal mt-4 inline-flex items-center gap-1 text-sm font-medium text-gray-900 underline underline-offset-4 transition-colors hover:text-gray-600"
        to={PATH.MEMBERS}
      >
        <ChevronLeft className="size-4" />
        회원 목록으로
      </Link>
    </div>
  );
}

export function MemberDetailPage() {
  const { memberId: memberIdParam } = useParams();
  const parsedId = Number(memberIdParam);
  const isValidId = Number.isInteger(parsedId) && parsedId > 0;
  const memberId = parsedId as AdminMemberId;

  const { data, isLoading, isError } = useAdminMemberQuery(memberId, {
    enabled: isValidId,
    retry: false,
  });

  const member = data?.data;

  return (
    <div className="p-8 pt-24">
      {!isValidId || isError ? (
        <MemberNotFound />
      ) : isLoading || !member ? (
        <MemberDetailSkeleton />
      ) : (
        <>
          <MemberDetailHeader member={member} />

          <div className="grid gap-6 xl:grid-cols-[minmax(320px,380px)_1fr]">
            <div className="space-y-6">
              <MemberAccountPanel member={member} />
              <MemberProfilePanel profile={member.profile} />
              <MemberFitPanel fit={member.fit} />
              <MemberAgreementPanel agreement={member.agreement} />
            </div>

            <MemberActivityTabs memberId={member.id} />
          </div>
        </>
      )}
    </div>
  );
}
