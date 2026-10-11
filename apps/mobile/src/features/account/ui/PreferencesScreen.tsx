import { useMemo, useState } from "react";

import { useUserFit } from "@entities/user/model/useUserFit";
import { AuthField } from "@features/auth/ui/AuthField";
import { useUserAuthStore } from "@shared/lib/auth/useUserAuthStore";
import { useTranslations } from "@shared/lib/i18n/useTranslations";
import type { GetUserFitRes } from "@shared/services/user";
import { EmptyState, ScreenError } from "@shared/ui/section-state";
import { SelectField } from "@shared/ui/select";
import { PreferencesSkeleton } from "@shared/ui/skeleton";

import {
  AccountBody,
  AccountShell,
  Field,
  FormSection,
  FormSections,
  SubmitBar,
} from "./parts";
import {
  clampNumeric,
  type FitFormValues,
  fitToFormValues,
  fitValuesEqual,
  formValuesToFitPayload,
  hasAnyFitValue,
  MAX_HEIGHT,
  MAX_WEIGHT,
  SIZE_FIELDS,
} from "../lib/fit";
import { useSaveFit } from "../model/useSaveFit";

/**
 * 맞춤 정보. web CustomInfoForm 과 같은 칸이다 — 키·몸무게, 그리고 신발·아우터·상의·하의 사이즈.
 *
 * web 은 사이즈마다 모달을 열어 목록에서 고르게 한다. 여기서는 칩 한 줄로 바꿨다:
 * 보기가 많아야 열다섯 개이고 전부 서너 글자라, 모달을 열고 고르고 닫는 세 번의 동작이
 * 한 번의 탭으로 줄어든다. 줄이 넘치면 그 줄 안에서 가로로 스크롤하므로 줄 수가
 * 기기 폭에 따라 달라지지도 않는다 — 상품 목록 위 카테고리 줄과 같은 물건이다.
 */
export function PreferencesScreen() {
  const t = useTranslations();
  const isAuthenticated = useUserAuthStore((s) => s.isAuthenticated);
  const fit = useUserFit();

  // 쿼리가 꺼져 있으면 isPending 이 영원히 유지되므로 데이터 갈래보다 먼저 거른다.
  if (!isAuthenticated) {
    return (
      <AccountShell>
        <EmptyState
          hint={t("sign_in_from_my_preferences")}
          message={t("signed_out")}
        />
      </AccountShell>
    );
  }

  // 오프라인이면 요청이 paused 되어 isPending 이 유지된다.
  if (fit.isPending && fit.fetchStatus === "paused") {
    return (
      <AccountShell>
        <ScreenError offline onRetry={() => void fit.refetch()} />
      </AccountShell>
    );
  }

  if (fit.isPending) {
    return (
      <AccountShell>
        <AccountBody title={t("personalized_info")}>
          <PreferencesSkeleton />
        </AccountBody>
      </AccountShell>
    );
  }

  if (fit.isError) {
    return (
      <AccountShell>
        <ScreenError onRetry={() => void fit.refetch()} />
      </AccountShell>
    );
  }

  // data 가 null 인 것은 실패가 아니라 "아직 저장한 적 없다"는 뜻이다. 빈 폼으로 연다.
  return (
    <AccountShell>
      <AccountBody title={t("personalized_info")}>
        <PreferencesForm fit={fit.data ?? null} />
      </AccountBody>
    </AccountShell>
  );
}

function PreferencesForm({ fit }: { fit: GetUserFitRes | null }) {
  const t = useTranslations();
  const initial = useMemo(() => fitToFormValues(fit), [fit]);
  const [values, setValues] = useState<FitFormValues>(() => initial);
  const save = useSaveFit({ exists: fit != null });

  /** 값을 고치면 지난 실패를 치운다 — 이미 고친 것을 아직 틀린 것처럼 말하지 않는다. */
  const edit = (next: FitFormValues) => {
    setValues(next);
    if (save.isError) save.reset();
  };

  const filled = hasAnyFitValue(values);
  const changed = !fitValuesEqual(values, initial);

  /** 저장을 막고 있는 한 가지. 아무것도 적지 않은 사람에게는 "바뀐 게 없다"가 아니라 무엇을 하라고 말한다. */
  const blocker = !filled
    ? t("enter_one_measurement")
    : changed
      ? null
      : t("change_something_to_save");

  return (
    <>
      <FormSections>
        <FormSection title={t("body_info")}>
          <Field label={t("height")}>
            <AuthField
              keyboardType="number-pad"
              onChangeText={(value) =>
                edit({ ...values, height: clampNumeric(value, MAX_HEIGHT) })
              }
              placeholder={t("enter_height")}
              value={values.height}
            />
          </Field>
          <Field label={t("weight")}>
            <AuthField
              keyboardType="number-pad"
              onChangeText={(value) =>
                edit({ ...values, weight: clampNumeric(value, MAX_WEIGHT) })
              }
              placeholder={t("enter_weight")}
              value={values.weight}
            />
          </Field>
        </FormSection>

        <FormSection title={t("size_info")}>
          {SIZE_FIELDS.map((field) => (
            <Field key={field.key} label={t(field.labelKey)}>
              <SelectField
                clearable
                onChange={(next) => {
                  // 시트의 "Not set" 은 빈 문자열로 온다. 그때는 칸 자체를 지운다 —
                  // 빈 문자열을 남겨 두면 저장할 때 null 이 아니라 "" 가 올라간다.
                  const sizes = { ...values.sizes };
                  if (next === "") delete sizes[field.key];
                  else sizes[field.key] = next;
                  edit({ ...values, sizes });
                }}
                options={field.options}
                placeholder={t("select_size_for", {
                  name: t(field.labelKey),
                })}
                title={t(field.labelKey)}
                value={values.sizes[field.key]}
              />
            </Field>
          ))}
        </FormSection>
      </FormSections>

      <SubmitBar
        blocker={blocker}
        busy={save.isPending}
        busyLabel={t("saving")}
        failure={save.isError ? t("save_preferences_failed") : null}
        label={t("save_changes")}
        onPress={() => save.mutate(formValuesToFitPayload(values))}
      />
    </>
  );
}
