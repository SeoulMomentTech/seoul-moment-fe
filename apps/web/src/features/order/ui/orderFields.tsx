import { cn } from "@shared/lib/style";

import { Label } from "@seoul-moment/ui";

export const FIELD_LABEL_CLASS = "text-body-3 text-black";
export const INPUT_CLASS = "h-12 py-0";

/** 읽기 전용 모드와 편집 폼이 같은 자리를 쓰도록 두 격자를 공유한다 */
export const TWO_COLUMN_CLASS = cn(
  "grid grid-cols-2 gap-3",
  "max-sm:grid-cols-1",
);
export const ADDRESS_COLUMN_CLASS = cn(
  "grid grid-cols-[96px_1fr_1fr] gap-2",
  "max-sm:grid-cols-1",
);

/**
 * 필수 필드 라벨. `htmlFor` 가 없으면 읽기 전용 값이라 가리킬 폼 요소가 없다 — `label` 대신
 * `span` 으로 낸다.
 */
export function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: string;
}) {
  const content = (
    <>
      {children}
      <span className="text-danger ml-0.5">*</span>
    </>
  );

  if (!htmlFor) {
    return <span className={FIELD_LABEL_CLASS}>{content}</span>;
  }

  return (
    <Label className={FIELD_LABEL_CLASS} htmlFor={htmlFor}>
      {content}
    </Label>
  );
}

/** 편집 폼의 `Input` 과 같은 크기의 읽기 전용 칸. 채움색으로 못 고치는 값임을 알린다. */
export function ReadOnlyValue({
  className,
  children,
}: {
  className?: string;
  children?: string;
}) {
  return (
    <p
      className={cn(
        "text-body-3 flex h-12 items-center rounded-[4px] border border-black/20 bg-black/5 px-3",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function ReadOnlyField({
  label,
  valueClassName,
  children,
}: {
  label: string;
  valueClassName?: string;
  children?: string;
}) {
  return (
    <div className="grid gap-2">
      <FieldLabel>{label}</FieldLabel>
      <ReadOnlyValue className={valueClassName}>{children}</ReadOnlyValue>
    </div>
  );
}

/**
 * 에러 자리는 문구가 없어도 비워 둔다 — 검증이 `onBlur` 라, 포커스를 뗄 때마다 아래 필드가
 * 밀렸다 돌아오면 입력하던 자리를 놓친다. `aria-describedby` 가 가리킬 대상도 늘 있어야 한다.
 */
export function FieldError({
  id,
  children,
}: {
  id: string;
  children?: string;
}) {
  return (
    <p
      className="text-body-5 text-danger min-h-4 leading-4"
      id={id}
      role="alert"
    >
      {children}
    </p>
  );
}
