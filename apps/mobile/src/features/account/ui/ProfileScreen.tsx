import { useMemo, useState } from "react";

import { Image } from "expo-image";
import { Text, View } from "react-native";

import { useUserProfile } from "@entities/user/model/useUserProfile";
import { AuthField } from "@features/auth/ui/AuthField";
import { useUserAuthStore } from "@shared/lib/auth/useUserAuthStore";
import type { MessageKey } from "@shared/lib/i18n/translate";
import { useLanguage } from "@shared/lib/i18n/useLanguage";
import { useTranslations } from "@shared/lib/i18n/useTranslations";
import { getCityOptions, getDistrictOptions } from "@shared/lib/regions";
import type { UserProfile } from "@shared/services/user";
import { ChipRow } from "@shared/ui/chip-row";
import { DateField } from "@shared/ui/date-field";
import { EmptyState, ScreenError } from "@shared/ui/section-state";
import { SelectField } from "@shared/ui/select";
import { MY_AVATAR_SIZE, ProfileFormSkeleton } from "@shared/ui/skeleton";

import { Spacing } from "@/constants/theme";

import {
  AccountBody,
  AccountShell,
  Field,
  FormSection,
  FormSections,
  SubmitBar,
} from "./parts";
import {
  digitsOnly,
  formValuesToProfilePayload,
  GENDER_OPTIONS,
  NICKNAME_MAX_LENGTH,
  NICKNAME_RULE,
  POSTAL_CODE_MAX_LENGTH,
  type ProfileFormValues,
  profileToFormValues,
} from "../lib/profile";
import { type ProfileSaveStep, useSaveProfile } from "../model/useSaveProfile";

const FAILURE_MESSAGE: Record<ProfileSaveStep, MessageKey> = {
  "nickname-taken": "nickname_taken",
  nickname: "save_nickname_failed",
  // 닉네임은 이미 저장된 뒤라, 다시 누르면 남은 것만 다시 보낸다.
  name: "save_name_failed",
  profile: "save_details_failed",
};

/**
 * 프로필 관리. web ProfileSection 과 같은 칸을 같은 순서로 다룬다 —
 * 닉네임, 이름, 성별, 생년월일, 우편번호·縣市·區·상세 주소.
 *
 * 사진은 읽기 전용이다. web 은 잘라서 올리지만 그러려면 이미지 선택기가 있어야 하고,
 * 그것은 의존성을 하나 더 들이는 결정이라 이 화면이 혼자 내릴 일이 아니다.
 */
export function ProfileScreen() {
  const t = useTranslations();
  const isAuthenticated = useUserAuthStore((s) => s.isAuthenticated);
  const profile = useUserProfile();

  // 쿼리가 꺼져 있으면 isPending 이 영원히 유지되므로 데이터 갈래보다 먼저 거른다.
  if (!isAuthenticated) {
    return (
      <AccountShell>
        <EmptyState
          hint={t("sign_in_from_my_profile")}
          message={t("signed_out")}
        />
      </AccountShell>
    );
  }

  // 오프라인이면 요청이 paused 되어 isPending 이 유지된다.
  if (profile.isPending && profile.fetchStatus === "paused") {
    return (
      <AccountShell>
        <ScreenError offline onRetry={() => void profile.refetch()} />
      </AccountShell>
    );
  }

  if (profile.isPending) {
    return (
      <AccountShell>
        <AccountBody title={t("profile_settings")}>
          <ProfileFormSkeleton />
        </AccountBody>
      </AccountShell>
    );
  }

  if (profile.isError || !profile.data) {
    return (
      <AccountShell>
        <ScreenError onRetry={() => void profile.refetch()} />
      </AccountShell>
    );
  }

  return (
    <AccountShell>
      <AccountBody title={t("profile_settings")}>
        <ProfileForm profile={profile.data} />
      </AccountBody>
    </AccountShell>
  );
}

function ProfileForm({ profile }: { profile: UserProfile }) {
  const t = useTranslations();
  const genderOptions = GENDER_OPTIONS.map(({ value, labelKey }) => ({
    value,
    label: t(labelKey),
  }));
  const locale = useLanguage();
  const save = useSaveProfile();

  const initial = useMemo(() => profileToFormValues(profile), [profile]);
  // 처음 받은 값에서 출발한다. 저장 뒤 다시 받아도 사용자가 고치던 것을 덮지 않는다.
  const [values, setValues] = useState<ProfileFormValues>(() => initial);

  const cityOptions = useMemo(() => getCityOptions(locale), [locale]);
  const districtOptions = useMemo(
    () => getDistrictOptions(values.city, locale),
    [values.city, locale],
  );

  /** 값을 고치면 지난 실패를 치운다 — 이미 고친 것을 아직 틀린 것처럼 말하지 않는다. */
  const edit = (patch: Partial<ProfileFormValues>) => {
    setValues((prev) => ({ ...prev, ...patch }));
    if (save.isError) save.reset();
  };

  const nickname = values.nickname.trim();
  const name = values.name.trim();

  const nicknameChanged = nickname !== initial.nickname;
  const nameChanged = name !== initial.name;
  const restChanged =
    values.gender !== initial.gender ||
    values.birthDate !== initial.birthDate ||
    values.postalCode !== initial.postalCode ||
    values.city !== initial.city ||
    values.district !== initial.district ||
    values.detailAddress.trim() !== initial.detailAddress;

  /**
   * 지금 저장을 막고 있는 한 가지. 폼 순서대로 처음 걸리는 것만 말한다 —
   * 모자란 것을 한꺼번에 늘어놓으면 혼내는 것처럼 읽힌다. 가입 화면과 같은 규칙이다.
   *
   * 검사는 **고친 칸에만** 건다. 서버에 이미 들어 있는 값이 규칙에 어긋난다고 해서
   * 상관없는 칸의 수정까지 막으면 안 된다 — 이름이 빈 계정에서는 주소만 고치려 해도
   * "Enter your name." 에 걸려 아무것도 저장할 수 없었다. 안 고친 칸은 요청에서
   * undefined 로 빠지므로 애초에 보내지도 않는다.
   */
  const blocker =
    nicknameChanged && !NICKNAME_RULE.test(nickname)
      ? t("nickname_rule_hint")
      : nameChanged && name === ""
        ? t("enter_name_required")
        : nicknameChanged || nameChanged || restChanged
          ? null
          : t("change_something_to_save");

  const submit = () =>
    save.mutate({
      nickname: nicknameChanged ? nickname : undefined,
      name: nameChanged ? name : undefined,
      profile: formValuesToProfilePayload(values),
    });

  return (
    <>
      <PhotoBlock nickname={profile.nickname} uri={profile.profileImageUrl} />

      <View style={{ marginTop: Spacing.section }}>
        <FormSections>
          <FormSection title={t("personal_info")}>
            <Field label={t("nickname")}>
              <AuthField
                maxLength={NICKNAME_MAX_LENGTH}
                onChangeText={(value) => edit({ nickname: value })}
                placeholder={t("allowed_input")}
                value={values.nickname}
              />
            </Field>

            <Field label={t("name")}>
              <AuthField
                onChangeText={(value) => edit({ name: value })}
                placeholder={t("input_name")}
                value={values.name}
              />
            </Field>

            <Field label={t("gender")}>
              <ChipRow
                accessibilityLabel={t("gender")}
                onChange={(next) =>
                  edit({ gender: next as UserProfile["gender"] | undefined })
                }
                options={genderOptions}
                value={values.gender}
              />
            </Field>

            <Field label={t("date_of_birth")}>
              {/*
                web 은 연·월·일을 각각 선택 상자로 받는다. 폰에서는 한 번에 고르는
                네이티브 피커가 낫다 — 2월 31일 같은 날이 아예 나오지 않아
                따로 막을 규칙도 필요 없다.
              */}
              <DateField
                onChange={(next) => edit({ birthDate: next })}
                placeholder={t("select_date_of_birth")}
                title={t("date_of_birth")}
                value={values.birthDate}
              />
            </Field>

            <Field label={t("region")}>
              <View style={{ gap: Spacing.tight }}>
                <AuthField
                  keyboardType="number-pad"
                  maxLength={POSTAL_CODE_MAX_LENGTH}
                  onChangeText={(value) =>
                    edit({
                      postalCode: digitsOnly(value, POSTAL_CODE_MAX_LENGTH),
                    })
                  }
                  placeholder={t("postal_code")}
                  value={values.postalCode}
                />
                <SelectField
                  onChange={(next) =>
                    // 縣市가 바뀌면 그 아래 區는 더 이상 그 도시의 것이 아니다.
                    edit({ city: next, district: undefined })
                  }
                  options={cityOptions}
                  placeholder={t("city")}
                  title={t("city")}
                  value={values.city}
                />
                <SelectField
                  disabled={!values.city}
                  onChange={(next) => edit({ district: next })}
                  options={districtOptions}
                  placeholder={t("district")}
                  title={t("district")}
                  value={values.district}
                />
                <AuthField
                  onChangeText={(value) => edit({ detailAddress: value })}
                  placeholder={t("detail_address")}
                  value={values.detailAddress}
                />
              </View>
            </Field>
          </FormSection>
        </FormSections>
      </View>

      <SubmitBar
        blocker={blocker}
        busy={save.isPending}
        busyLabel={t("saving")}
        failure={save.error ? t(FAILURE_MESSAGE[save.error.step]) : null}
        label={t("save_changes")}
        onPress={submit}
      />
    </>
  );
}

/**
 * 사진과 그 아래 한 줄. 누를 수 없다 — 바꾸려면 자르기 화면과 이미지 선택기가 있어야 하는데
 * 그것은 의존성을 들이는 결정이라 여기서 내리지 않았다. 누를 수 없는 것을 누를 수 있게
 * 보이게 두느니, 어디서 바꿀 수 있는지 한 줄로 말한다.
 */
function PhotoBlock({ uri, nickname }: { uri?: string; nickname: string }) {
  const t = useTranslations();

  return (
    <View>
      <View
        accessibilityLabel={t("profile_photo_of", { name: nickname })}
        className="bg-surface-muted overflow-hidden"
        style={{
          width: MY_AVATAR_SIZE,
          height: MY_AVATAR_SIZE,
          borderRadius: MY_AVATAR_SIZE / 2,
        }}
      >
        {uri ? (
          <Image
            contentFit="cover"
            source={uri}
            style={{ width: "100%", height: "100%" }}
            transition={200}
          />
        ) : null}
      </View>
      <Text
        className="text-body-5 text-neutral"
        style={{ marginTop: Spacing.tight }}
      >
        {t("profile_photo_web_only")}
      </Text>
    </View>
  );
}
