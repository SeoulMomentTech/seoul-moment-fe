import type {
  AdminMemberAgreement,
  AdminMemberFit,
  AdminMemberProfile,
  GetAdminMemberResponse,
} from "@shared/services/member";
import { EMPTY_VALUE, formatDate, formatDateTime } from "@shared/utils/format";

import { cn } from "@seoul-moment/ui";

import { MemberDetailCard, MemberDetailRow } from "./MemberDetailCard";
import { MEMBER_GENDER_LABEL, MEMBER_PROVIDER_LABEL } from "../../constants";

const composeAddress = (profile: AdminMemberProfile) => {
  const parts = [
    profile.postalCode && `(${profile.postalCode})`,
    profile.city,
    profile.district,
    profile.detailAddress,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" ") : null;
};

export function MemberAccountPanel({
  member,
}: {
  member: GetAdminMemberResponse;
}) {
  return (
    <MemberDetailCard title="계정">
      <MemberDetailRow label="이메일">{member.email}</MemberDetailRow>
      <MemberDetailRow label="전화번호">{member.phone}</MemberDetailRow>
      <MemberDetailRow label="가입일">
        {formatDateTime(member.createDate)}
      </MemberDetailRow>
      <MemberDetailRow label="SNS 연동">
        {member.sns ? (
          <>
            {MEMBER_PROVIDER_LABEL[member.sns.provider]}
            {member.sns.providerEmail && (
              <span className="text-gray-500">
                {" "}
                · {member.sns.providerEmail}
              </span>
            )}
          </>
        ) : (
          <span className="text-gray-500">
            {member.withdrawnAt ? "탈퇴로 연동 해제됨" : "연동 없음"}
          </span>
        )}
      </MemberDetailRow>
      {member.withdrawnAt && (
        <MemberDetailRow label="탈퇴일">
          {formatDateTime(member.withdrawnAt)}
        </MemberDetailRow>
      )}
    </MemberDetailCard>
  );
}

export function MemberProfilePanel({
  profile,
}: {
  profile: AdminMemberProfile | null;
}) {
  if (!profile) {
    return (
      <MemberDetailCard
        placeholder="회원이 프로필을 작성하지 않았습니다."
        title="프로필"
      />
    );
  }

  return (
    <MemberDetailCard title="프로필">
      <MemberDetailRow label="이름">{profile.name}</MemberDetailRow>
      <MemberDetailRow label="성별">
        {profile.gender ? MEMBER_GENDER_LABEL[profile.gender] : undefined}
      </MemberDetailRow>
      <MemberDetailRow label="생년월일">
        {profile.birthDate ? formatDate(profile.birthDate) : undefined}
      </MemberDetailRow>
      <MemberDetailRow label="주소">
        {composeAddress(profile) ?? undefined}
      </MemberDetailRow>
    </MemberDetailCard>
  );
}

export function MemberFitPanel({ fit }: { fit: AdminMemberFit | null }) {
  const hasAnyValue =
    fit &&
    Object.values(fit).some((value) => value !== null && value !== undefined);

  if (!hasAnyValue) {
    return (
      <MemberDetailCard
        placeholder="체형 정보를 입력하지 않았습니다."
        title="체형"
      />
    );
  }

  return (
    <MemberDetailCard title="체형">
      <MemberDetailRow className="tabular-nums" label="키·몸무게">
        {fit.height || fit.weight
          ? `${fit.height ? `${fit.height}cm` : EMPTY_VALUE} · ${
              fit.weight ? `${fit.weight}kg` : EMPTY_VALUE
            }`
          : undefined}
      </MemberDetailRow>
      <MemberDetailRow className="tabular-nums" label="신발">
        {fit.shoeSize ? `${fit.shoeSize}mm` : undefined}
      </MemberDetailRow>
      <MemberDetailRow label="아우터">{fit.outerSize}</MemberDetailRow>
      <MemberDetailRow label="상의">{fit.topSize}</MemberDetailRow>
      <MemberDetailRow label="하의">{fit.bottomSize}</MemberDetailRow>
    </MemberDetailCard>
  );
}

interface AgreementValueProps {
  agreedAt: string | null;
  /** 가입 시점의 법적 기록이라 해제될 수 없는 항목 */
  fixed?: boolean;
}

function AgreementValue({ agreedAt, fixed }: AgreementValueProps) {
  const isAgreed = Boolean(agreedAt);

  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5">
      <span className="inline-flex items-center gap-1.5">
        <span
          aria-hidden
          className={cn(
            "size-1.5 shrink-0 rounded-full",
            isAgreed ? "bg-green-500" : "bg-gray-300",
          )}
        />
        <span className={isAgreed ? "text-gray-900" : "text-gray-500"}>
          {isAgreed ? "동의" : "미동의"}
        </span>
      </span>
      {isAgreed && (
        <span className="text-xs text-gray-500">
          {formatDateTime(agreedAt)}
          {fixed && " · 변경 불가"}
        </span>
      )}
    </span>
  );
}

export function MemberAgreementPanel({
  agreement,
}: {
  agreement: AdminMemberAgreement;
}) {
  return (
    <MemberDetailCard title="약관·수신 동의">
      <MemberDetailRow label="이용약관">
        <AgreementValue agreedAt={agreement.termsOfServiceAgreeDate} fixed />
      </MemberDetailRow>
      <MemberDetailRow label="개인정보">
        <AgreementValue agreedAt={agreement.privacyPolicyAgreeDate} fixed />
      </MemberDetailRow>
      <MemberDetailRow label="신상품 알림">
        <AgreementValue agreedAt={agreement.newProductDate} />
      </MemberDetailRow>
      <MemberDetailRow label="광고·이벤트">
        <AgreementValue agreedAt={agreement.adAgreeDate} />
      </MemberDetailRow>
      <MemberDetailRow label="맞춤 추천">
        <AgreementValue agreedAt={agreement.recommendDate} />
      </MemberDetailRow>
    </MemberDetailCard>
  );
}
