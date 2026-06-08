"use client";

import { useMemo, useRef, useState, type ChangeEvent } from "react";

import { CircleUserRound } from "lucide-react";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useLanguage, useNicknameValidate } from "@shared/lib/hooks";
import { NICKNAME_MAX_LENGTH, sanitizeNickname } from "@shared/lib/nickname";
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

import { DeleteProfileImageDialog } from "./DeleteProfileImageDialog";
import { useCreateUserProfileImageMutation } from "../api/useCreateUserProfileImageMutation";
import { useGetUserProfileQuery } from "../api/useGetUserProfileQuery";
import { useUpdateUserProfileMutation } from "../api/useUpdateUserProfileMutation";
import { useUpdateUserProfileNameMutation } from "../api/useUpdateUserProfileNameMutation";
import { useUpdateUserProfileNicknameMutation } from "../api/useUpdateUserProfileNicknameMutation";
import { useUploadUserImageFileMutation } from "../api/useUploadUserImageFileMutation";
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
import { validateProfileImageFile } from "../lib/imageValidation";
import {
  type RegionOption,
  getCityOptions,
  getDistrictOptions,
} from "../lib/regions";

interface ProfileSectionProps {
  className?: string;
}

const FIELD_LABEL_CLASS = cn(FIELD_LABEL_BASE_CLASS, "text-black/60");

type Gender = "MALE" | "FEMALE" | "OTHER";

const GENDER_OPTIONS: ReadonlyArray<{ value: Gender; labelKey: string }> = [
  { value: "MALE", labelKey: "male" },
  { value: "FEMALE", labelKey: "female" },
  { value: "OTHER", labelKey: "other" },
];

const toPairOptions = (values: ReadonlyArray<string>): RegionOption[] =>
  values.map((v) => ({ value: v, label: v }));

const CURRENT_YEAR = 2026;
const YEAR_OPTIONS = toPairOptions(
  Array.from({ length: 77 }, (_, i) => String(CURRENT_YEAR - i)),
);
const MONTH_OPTIONS = toPairOptions(
  Array.from({ length: 12 }, (_, i) => String(i + 1)),
);
const DAY_OPTIONS = toPairOptions(
  Array.from({ length: 31 }, (_, i) => String(i + 1)),
);

function FieldSelect({
  placeholder,
  options,
  value,
  onValueChange,
  className,
  disabled,
}: {
  placeholder: string;
  options: ReadonlyArray<RegionOption>;
  value?: string;
  onValueChange(value: string): void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <Select disabled={disabled} onValueChange={onValueChange} value={value}>
      <SelectTrigger className={cn("h-[48px] flex-1", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="h-[250px]">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

type HelperTone = "error" | "success";

function EditableTextField({
  id,
  label,
  value,
  placeholder,
  onChange,
  onConfirm,
  confirmDisabled = false,
  pending = false,
  maxLength,
  helperText,
  helperTone,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange(value: string): void;
  onConfirm?(value: string): Promise<void>;
  confirmDisabled?: boolean;
  pending?: boolean;
  maxLength?: number;
  helperText?: string | null;
  helperTone?: HelperTone;
}) {
  const t = useTranslations();
  const [editing, setEditing] = useState(false);
  const [backup, setBackup] = useState("");

  const handleConfirm = async () => {
    if (onConfirm && value !== backup) {
      try {
        await onConfirm(value);
      } catch {
        return;
      }
    }
    setEditing(false);
  };

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
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          readOnly={!editing}
          value={value}
        />
        {editing ? (
          <>
            <Button
              className="h-[48px] shrink-0 px-[16px]"
              disabled={confirmDisabled || pending}
              onClick={handleConfirm}
              size="sm"
              type="button"
            >
              {t("confirm")}
            </Button>
            <Button
              className="h-[48px] shrink-0 px-[16px]"
              disabled={pending}
              onClick={() => {
                onChange(backup);
                setEditing(false);
              }}
              size="sm"
              type="button"
              variant="outline"
            >
              {t("cancel")}
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
            {t("modify")}
          </Button>
        )}
      </div>
      {helperText && (
        <span
          className={cn(
            "text-body-4",
            helperTone === "error" ? "text-error" : "text-sent",
          )}
        >
          {helperText}
        </span>
      )}
    </div>
  );
}

interface ProfileFormProps {
  defaultValues?: ProfileFormValues;
  submitting?: boolean;
  onSubmit(values: ProfileFormValues): void;
  onUpdateNickname(nickname: string): Promise<void>;
  onUpdateName(name: string): Promise<void>;
  nicknamePending?: boolean;
  namePending?: boolean;
}

function ProfileForm({
  defaultValues,
  submitting = false,
  onSubmit,
  onUpdateNickname,
  onUpdateName,
  nicknamePending = false,
  namePending = false,
}: ProfileFormProps) {
  const t = useTranslations();
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

  const locale = useLanguage();
  const cityOptions = useMemo(() => getCityOptions(locale), [locale]);
  const districtOptions = useMemo(
    () => getDistrictOptions(city, locale),
    [city, locale],
  );

  const initialNickname = defaultValues?.nickname ?? "";
  const isNicknameUnchanged =
    nickname === initialNickname && initialNickname !== "";
  const { status: nicknameStatus, message: nicknameMessage } =
    useNicknameValidate({
      nickname,
      enabled: !isNicknameUnchanged,
    });
  const isNicknameValid = isNicknameUnchanged || nicknameStatus === "available";
  const nicknameHelperTone: HelperTone | undefined =
    nicknameStatus === "available"
      ? "success"
      : nicknameStatus === "duplicated" || nicknameStatus === "error"
        ? "error"
        : undefined;

  const handleCityChange = (next: string) => {
    setCity(next);
    setDistrict(undefined);
  };

  return (
    <>
      <div className="flex flex-col gap-5">
        <h3 className={SECTION_TITLE_CLASS}>{t("personal_info")}</h3>
        <div className="flex flex-col gap-6 pt-[12px]">
          <EditableTextField
            confirmDisabled={!isNicknameValid || nicknameStatus === "checking"}
            helperText={nicknameMessage}
            helperTone={nicknameHelperTone}
            id="profile-nickname"
            label={t("nickname")}
            maxLength={NICKNAME_MAX_LENGTH}
            onChange={(value) => setNickname(sanitizeNickname(value))}
            onConfirm={onUpdateNickname}
            pending={nicknamePending}
            placeholder={t("allowed_input")}
            value={nickname}
          />

          <EditableTextField
            confirmDisabled={name.trim() === ""}
            id="profile-name"
            label={t("name")}
            onChange={setName}
            onConfirm={onUpdateName}
            pending={namePending}
            placeholder={t("input_name")}
            value={name}
          />

          <div className="flex flex-col gap-2">
            <Label className={FIELD_LABEL_CLASS}>{t("gender")}</Label>
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
                    {t(option.labelKey)}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex flex-col gap-2">
            <Label className={FIELD_LABEL_CLASS}>{t("date_of_birth")}</Label>
            <div className="flex items-center gap-2">
              <FieldSelect
                onValueChange={setBirthYear}
                options={YEAR_OPTIONS}
                placeholder=" "
                value={birthYear}
              />
              <span className="text-body-3 shrink-0 text-black">
                {t("year")}
              </span>
              <FieldSelect
                onValueChange={setBirthMonth}
                options={MONTH_OPTIONS}
                placeholder=" "
                value={birthMonth}
              />
              <span className="text-body-3 shrink-0 text-black">
                {t("month")}
              </span>
              <FieldSelect
                onValueChange={setBirthDay}
                options={DAY_OPTIONS}
                placeholder=" "
                value={birthDay}
              />
              <span className="text-body-3 shrink-0 text-black">
                {t("day")}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label className={FIELD_LABEL_CLASS} htmlFor="profile-postal">
              {t("region")}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                className={cn(INPUT_CLASS, "flex-1")}
                id="profile-postal"
                inputMode="numeric"
                maxLength={6}
                onChange={(e) =>
                  setPostalCode(e.target.value.replace(/[^0-9]/g, ""))
                }
                placeholder={t("postal_code")}
                value={postalCode}
              />
              <FieldSelect
                onValueChange={handleCityChange}
                options={cityOptions}
                placeholder={t("city")}
                value={city}
              />
              <FieldSelect
                disabled={!city}
                key={city ?? "no-city"}
                onValueChange={setDistrict}
                options={districtOptions}
                placeholder={t("district")}
                value={district}
              />
            </div>
            <Input
              className={INPUT_CLASS}
              onChange={(e) => setDetailAddress(e.target.value)}
              placeholder={t("detail_address")}
              value={detailAddress}
            />
          </div>
        </div>
      </div>

      <Button
        className="h-[56px] w-full"
        disabled={submitting}
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
        {t("edit")}
      </Button>
    </>
  );
}

export function ProfileSection({ className }: ProfileSectionProps) {
  const t = useTranslations();
  const { data: profile, isLoading } = useGetUserProfileQuery();
  const { mutate: updateProfile, isPending: updating } =
    useUpdateUserProfileMutation();
  const { mutateAsync: updateNicknameAsync, isPending: updatingNickname } =
    useUpdateUserProfileNicknameMutation();
  const { mutateAsync: updateNameAsync, isPending: updatingName } =
    useUpdateUserProfileNameMutation();
  const { mutate: uploadImage, isPending: uploading } =
    useUploadUserImageFileMutation();
  const { mutate: registerProfileImage, isPending: registeringImage } =
    useCreateUserProfileImageMutation();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const isImageUpdating = uploading || registeringImage;
  const hasProfileImage = Boolean(profile?.profileImageUrl);

  const handleSubmit = (values: ProfileFormValues) => {
    const payload = formValuesToProfilePayload(values);

    updateProfile(payload, {
      onSuccess: () => toast.success(t("profile_saved")),
    });
  };

  const handleUpdateNickname = async (nickname: string) => {
    await updateNicknameAsync({ nickname });
    toast.success(t("nickname_updated"));
  };

  const handleUpdateName = async (name: string) => {
    await updateNameAsync({ name });
    toast.success(t("name_updated"));
  };

  const handleChangeImageClick = () => {
    if (isImageUpdating) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const errorKey = validateProfileImageFile(file);
    if (errorKey) {
      toast.error(t(errorKey));
      return;
    }

    uploadImage(file, {
      onSuccess: (res) => {
        registerProfileImage(
          { imageUrl: res.data.imageUrl },
          {
            onSuccess: () => toast.success(t("profile_image_updated")),
          },
        );
      },
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
        {t("profile_settings")}
      </h2>

      <div className="flex items-center justify-between border-b border-black/10 py-5 max-sm:flex-col max-sm:items-stretch max-sm:gap-4">
        <div className="flex items-center gap-[10px]">
          <Avatar className="size-14">
            <AvatarImage
              alt={profile?.nickname ?? ""}
              src={profile?.profileImageUrl}
            />
            <AvatarFallback>
              <CircleUserRound
                className="size-[60px] text-black/30"
                strokeWidth={0.75}
              />
            </AvatarFallback>
          </Avatar>
          <span className="text-body-1 font-medium text-black">
            {profile?.nickname ?? "nickname"}
          </span>
        </div>
        <div className="flex items-center gap-[10px] max-sm:grid max-sm:grid-cols-2">
          <input
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            ref={fileInputRef}
            type="file"
          />
          <Button
            className="h-[44px] px-[16px]"
            disabled={isImageUpdating}
            onClick={handleChangeImageClick}
            type="button"
            variant="outline"
          >
            {isImageUpdating ? t("uploading") : t("change_image")}
          </Button>
          <Button
            className="h-[44px] px-[16px]"
            disabled={!hasProfileImage || isImageUpdating}
            onClick={() => setIsDeleteDialogOpen(true)}
            type="button"
            variant="outline"
          >
            {t("delete")}
          </Button>
        </div>
      </div>

      <DeleteProfileImageDialog
        onOpenChange={setIsDeleteDialogOpen}
        open={isDeleteDialogOpen}
      />

      {isLoading ? (
        <p className="text-body-3 text-black/40">{t("loading")}</p>
      ) : (
        <ProfileForm
          defaultValues={profile ? profileToFormValues(profile) : undefined}
          key={profile ? "edit" : "create"}
          namePending={updatingName}
          nicknamePending={updatingNickname}
          onSubmit={handleSubmit}
          onUpdateName={handleUpdateName}
          onUpdateNickname={handleUpdateNickname}
          submitting={updating}
        />
      )}
    </section>
  );
}
