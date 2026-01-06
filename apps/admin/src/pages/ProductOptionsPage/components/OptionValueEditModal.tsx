import { useEffect, useState } from "react";

import { X } from "lucide-react";

import { Button, Input, Label } from "@seoul-moment/ui";

import type { LanguageOption, OptionValueForm } from "./OptionValueTable";

interface OptionValueEditModalProps {
  isOpen: boolean;
  isPending?: boolean;
  languages: LanguageOption[];
  initialValue: OptionValueForm | null;
  onClose(): void;
  onSubmit(texts: OptionValueForm["text"]): void;
}

export function OptionValueEditModal({
  isOpen,
  isPending = false,
  languages,
  initialValue,
  onClose,
  onSubmit,
}: OptionValueEditModalProps) {
  const [texts, setTexts] = useState<OptionValueForm["text"]>(
    languages.map((lang) => ({ languageId: lang.id, value: "" })),
  );

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
    } else {
      setTexts(languages.map((lang) => ({ languageId: lang.id, value: "" })));
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

  const handleSubmit = () => {
    if (!initialValue) {
      onClose();
      return;
    }
    const firstLangLabel = languages[0]?.label ?? "첫번째 언어";
    if (!texts[0]?.value.trim()) {
      alert(`${firstLangLabel} 값을 입력해주세요.`);
      return;
    }
    onSubmit(texts);
  };

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
              <Label className="text-sm text-gray-800" htmlFor={`edit-${language.id}`}>
                {language.label}
                {index === 0 ? " *" : ""}
              </Label>
              <Input
                className="bg-gray-100"
                disabled={isPending}
                id={`edit-${language.id}`}
                onChange={(e) => handleChange(language.id, e.target.value)}
                placeholder={language.label}
                value={
                  texts.find((text) => text.languageId === language.id)?.value ??
                  ""
                }
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button onClick={onClose} type="button" variant="outline">
            취소
          </Button>
          <Button
            className="bg-gray-900 text-white hover:bg-gray-800"
            disabled={isPending || !initialValue}
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
