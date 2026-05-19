"use client";

import { useState } from "react";

import { toast } from "sonner";

import { cn } from "@shared/lib/style";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/select";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
} from "@seoul-moment/ui";

import { useCreateUserProfileMutation } from "../api/useCreateUserProfileMutation";
import { useGetUserProfileQuery } from "../api/useGetUserProfileQuery";
import { useUpdateUserProfileMutation } from "../api/useUpdateUserProfileMutation";
import {
  type ProfileFormValues,
  formValuesToProfilePayload,
  profileToFormValues,
} from "../lib/adapters";
import {
  FIELD_LABEL_CLASS as FIELD_LABEL_BASE_CLASS,
  INPUT_CLASS,
  SECTION_TITLE_CLASS,
} from "../lib/formClasses";

interface ProfileSectionProps {
  className?: string;
}

const FIELD_LABEL_CLASS = cn(FIELD_LABEL_BASE_CLASS, "text-black/60");

type Gender = "MALE" | "FEMALE" | "OTHER";

const GENDER_OPTIONS: ReadonlyArray<{ value: Gender; label: string }> = [
  { value: "MALE", label: "남성" },
  { value: "FEMALE", label: "여성" },
  { value: "OTHER", label: "기타/비공개" },
];

const CURRENT_YEAR = 2026;
const YEARS = Array.from({ length: 77 }, (_, i) => String(CURRENT_YEAR - i));
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));
const CITIES: ReadonlyArray<string> = [
  "台北市",
  "新北市",
  "桃園市",
  "台中市",
  "台南市",
  "高雄市",
];

function FieldSelect({
  placeholder,
  options,
  value,
  onValueChange,
  className,
}: {
  placeholder: string;
  options: ReadonlyArray<string>;
  value?: string;
  onValueChange(value: string): void;
  className?: string;
}) {
  return (
    <Select onValueChange={onValueChange} value={value}>
      <SelectTrigger className={cn("h-[48px] flex-1", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="h-[250px]">
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function EditableTextField({
  id,
  label,
  value,
  placeholder,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange(value: string): void;
}) {
  const [editing, setEditing] = useState(false);
  const [backup, setBackup] = useState("");

  return (
    <div className="flex flex-col gap-2">
      <Label className={FIELD_LABEL_CLASS} htmlFor={id}>
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <Input
          className={cn(
            INPUT_CLASS,
            "flex-1 read-only:bg-black/5 read-only:text-black/60",
          )}
          id={id}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          readOnly={!editing}
          value={value}
        />
        {editing ? (
          <>
            <Button
              className="h-[48px] shrink-0 px-[16px]"
              onClick={() => setEditing(false)}
              size="sm"
              type="button"
            >
              확인
            </Button>
            <Button
              className="h-[48px] shrink-0 px-[16px]"
              onClick={() => {
                onChange(backup);
                setEditing(false);
              }}
              size="sm"
              type="button"
              variant="outline"
            >
              취소
            </Button>
          </>
        ) : (
          <Button
            className="h-[48px] shrink-0 px-[16px]"
            onClick={() => {
              setBackup(value);
              setEditing(true);
            }}
            size="sm"
            type="button"
            variant="outline"
          >
            수정
          </Button>
        )}
      </div>
    </div>
  );
}

interface ProfileFormProps {
  defaultValues?: ProfileFormValues;
  submitting?: boolean;
  onSubmit(values: ProfileFormValues): void;
}

function ProfileForm({
  defaultValues,
  submitting = false,
  onSubmit,
}: ProfileFormProps) {
  const [nickname, setNickname] = useState(() => defaultValues?.nickname ?? "");
  const [name, setName] = useState(() => defaultValues?.name ?? "");
  const [gender, setGender] = useState<Gender | undefined>(
    () => defaultValues?.gender,
  );
  const [birthYear, setBirthYear] = useState(() => defaultValues?.birthYear);
  const [birthMonth, setBirthMonth] = useState(() => defaultValues?.birthMonth);
  const [birthDay, setBirthDay] = useState(() => defaultValues?.birthDay);
  const [postalCode, setPostalCode] = useState(
    () => defaultValues?.postalCode ?? "",
  );
  const [city, setCity] = useState(() => defaultValues?.city);
  const [district, setDistrict] = useState(() => defaultValues?.district);
  const [detailAddress, setDetailAddress] = useState(
    () => defaultValues?.detailAddress ?? "",
  );

  const isComplete =
    nickname.trim() !== "" &&
    name.trim() !== "" &&
    Boolean(gender) &&
    Boolean(birthYear && birthMonth && birthDay) &&
    postalCode.trim() !== "" &&
    Boolean(city) &&
    Boolean(district) &&
    detailAddress.trim() !== "";

  return (
    <>
      <div className="flex flex-col gap-5">
        <h3 className={SECTION_TITLE_CLASS}>개인 정보</h3>
        <div className="flex flex-col gap-6 pt-[12px]">
          <EditableTextField
            id="profile-nickname"
            label="닉네임"
            onChange={setNickname}
            placeholder="닉네임을 입력하세요"
            value={nickname}
          />

          <EditableTextField
            id="profile-name"
            label="이름"
            onChange={setName}
            placeholder="이름을 입력하세요"
            value={name}
          />

          <div className="flex flex-col gap-2">
            <Label className={FIELD_LABEL_CLASS}>성별</Label>
            <RadioGroup
              className="flex gap-5 py-[10px] max-sm:flex-col max-sm:gap-3"
              onValueChange={(value) => setGender(value as Gender)}
              value={gender}
            >
              {GENDER_OPTIONS.map((option) => (
                <div className="flex items-center gap-1" key={option.value}>
                  <RadioGroupItem
                    id={`gender-${option.value}`}
                    value={option.value}
                  />
                  <Label
                    className="text-body-2 text-black"
                    htmlFor={`gender-${option.value}`}
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex flex-col gap-2">
            <Label className={FIELD_LABEL_CLASS}>생일</Label>
            <div className="flex items-center gap-2">
              <FieldSelect
                onValueChange={setBirthYear}
                options={YEARS}
                placeholder=" "
                value={birthYear}
              />
              <span className="text-body-3 shrink-0 text-black">년</span>
              <FieldSelect
                onValueChange={setBirthMonth}
                options={MONTHS}
                placeholder=" "
                value={birthMonth}
              />
              <span className="text-body-3 shrink-0 text-black">월</span>
              <FieldSelect
                onValueChange={setBirthDay}
                options={DAYS}
                placeholder=" "
                value={birthDay}
              />
              <span className="text-body-3 shrink-0 text-black">일</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label className={FIELD_LABEL_CLASS} htmlFor="profile-postal">
              지역
            </Label>
            <div className="flex items-center gap-2">
              <Input
                className={cn(INPUT_CLASS, "flex-1")}
                id="profile-postal"
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="우편번호"
                value={postalCode}
              />
              <FieldSelect
                onValueChange={setCity}
                options={CITIES}
                placeholder="시/도"
                value={city}
              />
              <FieldSelect
                onValueChange={setDistrict}
                options={CITIES}
                placeholder="구/군"
                value={district}
              />
            </div>
            <Input
              className={INPUT_CLASS}
              onChange={(e) => setDetailAddress(e.target.value)}
              placeholder="상세 주소"
              value={detailAddress}
            />
          </div>
        </div>
      </div>

      <Button
        className="h-[56px] w-full"
        disabled={!isComplete || submitting}
        onClick={() =>
          onSubmit({
            nickname,
            name,
            gender,
            birthYear,
            birthMonth,
            birthDay,
            postalCode,
            city,
            district,
            detailAddress,
          })
        }
        size="lg"
        type="button"
      >
        수정하기
      </Button>
    </>
  );
}

export function ProfileSection({ className }: ProfileSectionProps) {
  const { data: profile, isLoading } = useGetUserProfileQuery();
  const { mutate: createProfile, isPending: creating } =
    useCreateUserProfileMutation();
  const { mutate: updateProfile, isPending: updating } =
    useUpdateUserProfileMutation();

  const handleSubmit = (values: ProfileFormValues) => {
    const payload = formValuesToProfilePayload(values, profile ?? undefined);
    const run = profile ? updateProfile : createProfile;

    run(payload, {
      onSuccess: () => toast.success("프로필이 저장되었습니다."),
    });
  };

  return (
    <section
      className={cn(
        "flex w-[598px] flex-col gap-10 max-sm:w-full max-sm:gap-8",
        className,
      )}
    >
      <h2 className="text-title-4 sm:text-title-3 font-bold text-black">
        프로필 관리
      </h2>

      <div className="flex items-center justify-between border-b border-black/10 py-5 max-sm:flex-col max-sm:items-stretch max-sm:gap-4">
        <div className="flex items-center gap-[10px]">
          <Avatar className="size-[60px]">
            <AvatarImage
              alt="프로필 이미지"
              src={profile?.profileImageUrl ?? ""}
            />
            <AvatarFallback className="bg-black/5" />
          </Avatar>
          <span className="text-body-1 font-medium text-black">
            {profile?.nickname ?? "nickname"}
          </span>
        </div>
        <div className="flex items-center gap-[10px] max-sm:grid max-sm:grid-cols-2">
          <Button
            className="h-[44px] px-[16px]"
            type="button"
            variant="outline"
          >
            이미지 변경
          </Button>
          <Button
            className="h-[44px] px-[16px]"
            type="button"
            variant="outline"
          >
            삭제
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-body-3 text-black/40">불러오는 중...</p>
      ) : (
        <ProfileForm
          defaultValues={profile ? profileToFormValues(profile) : undefined}
          key={profile ? "edit" : "create"}
          onSubmit={handleSubmit}
          submitting={creating || updating}
        />
      )}
    </section>
  );
}
