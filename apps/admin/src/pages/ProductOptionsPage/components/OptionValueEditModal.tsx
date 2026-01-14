import { useEffect, useState } from "react";

import { X } from "lucide-react";

import type { ProductOptionId } from "@shared/services/productOption";

import { Button, Input, Label } from "@seoul-moment/ui";

import type { LanguageOption, OptionValueForm } from "./OptionValueTable";
import { useUpdateAdminProductOptionValueMutation } from "../hooks";
import { isHexCode } from "../utils";

interface OptionValueEditModalProps {
  isOpen: boolean;
  isPending?: boolean;
  optionId: number;
  languages: LanguageOption[];
  initialValue: OptionValueForm | null;
  type: string;
  onClose(): void;
}

export function OptionValueEditModal({
  isOpen,
  isPending = false,
  optionId,
  languages,
  initialValue,
  type,
  onClose,
}: OptionValueEditModalProps) {
  const [texts, setTexts] = useState<OptionValueForm["text"]>(
    languages.map((lang) => ({ languageId: lang.id, value: "" })),
  );
  const [colorCode, setColorCode] = useState<
    OptionValueForm["colorCode"] | null
  >(null);
  const { mutateAsync: updateOptionValue, isPending: isUpdating } =
    useUpdateAdminProductOptionValueMutation();

  useEffect(() => {
    if (!isOpen) return;

    if (initialValue) {
      setTexts(
        languages.map((lang) => {
          const matched = initialValue.text.find(
            (text) => text.languageId === lang.id,
          );
          return { languageId: lang.id, value: matched?.value ?? "" };
        }),
      );
      setColorCode(initialValue.colorCode);
    } else {
      setTexts(languages.map((lang) => ({ languageId: lang.id, value: "" })));
      setColorCode(null);
    }
  }, [initialValue, isOpen, languages]);

  if (!isOpen) return null;

  const handleChange = (languageId: number, value: string) => {
    setTexts((prev) =>
      prev.map((text) =>
        text.languageId === languageId ? { ...text, value } : text,
      ),
    );
  };

  const handleChangeColorCode = (value: string) => {
    setColorCode(value);
  };

  const handleSubmit = () => {
    if (!initialValue) {
      onClose();
      return;
    }
    const optionValueId = initialValue.id;
    if (!optionValueId) {
      alert("저장된 옵션 값만 수정할 수 있습니다.");
      return;
    }

    for (let i = 0; i < texts.length; i++) {
      const text = texts[i];
      if (!text?.value.trim()) {
        alert(`${languages[i]?.label} 값을 입력해주세요.`);
        return;
      }
    }

    if (type === "COLOR" && !colorCode) {
      alert("ColorCode를 입력해주세요.");
      return;
    }

    if (type === "COLOR" && colorCode && !isHexCode(colorCode)) {
      alert("ColorCode 형식이 올바르지 않습니다.");
      return;
    }

    updateOptionValue({
      optionValueId,
      payload: {
        text: texts,
        colorCode,
        optionId: optionId as ProductOptionId,
      },
    })
      .then(() => onClose())
      .catch((error) => {
        console.error("옵션 값 수정 오류:", error);
        alert("옵션 값을 수정하는 중 오류가 발생했습니다.");
      });
  };

  const isDisabled = isPending || isUpdating || !initialValue?.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-[440px] max-w-[90vw] rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">옵션 값 수정</h3>
          <button
            className="rounded-sm p-1 text-gray-500 hover:bg-gray-100"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          {languages.map((language, index) => (
            <div className="space-y-2" key={language.id}>
              <Label
                className="text-sm text-gray-800"
                htmlFor={`edit-${language.id}`}
              >
                {language.label}
                {index === 0 ? " *" : ""}
              </Label>
              <Input
                className="bg-gray-100"
                disabled={isDisabled}
                id={`edit-${language.id}`}
                onChange={(e) => handleChange(language.id, e.target.value)}
                placeholder={language.label}
                value={
                  texts.find((text) => text.languageId === language.id)
                    ?.value ?? ""
                }
              />
            </div>
          ))}
          {type === "COLOR" && (
            <div className="space-y-2">
              <Label className="text-sm text-gray-800" htmlFor="edit-colorCode">
                ColorCode
              </Label>
              <Input
                className="bg-gray-100"
                disabled={isDisabled}
                id={`edit-colorCode`}
                maxLength={7}
                onChange={(e) => handleChangeColorCode(e.target.value)}
                placeholder="#000000"
                value={colorCode ?? ""}
              />
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button onClick={onClose} type="button" variant="outline">
            취소
          </Button>
          <Button
            className="bg-gray-900 text-white hover:bg-gray-800"
            disabled={isDisabled}
            onClick={handleSubmit}
            type="button"
          >
            수정
          </Button>
        </div>
      </div>
    </div>
  );
}
