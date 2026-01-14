import { useState } from "react";

import { useNavigate } from "react-router";

import { ArrowLeft } from "lucide-react";

import { PATH } from "@shared/constants/route";
import {
  type CreateAdminProductOptionRequest,
  type ProductOptionType,
  type ProductOptionUiType,
} from "@shared/services/productOption";

import { Button, Flex, Input, Label } from "@seoul-moment/ui";

import { OptionTypeInput, OptionUITypeSelector } from "../components";
import { useCreateAdminProductOptionMutation } from "../hooks";

const LANGUAGE_OPTIONS = [
  { id: 1, label: "한국어" },
  { id: 2, label: "영어" },
  { id: 3, label: "중국어(번체)" },
];

export default function ProductOptionAddPage() {
  const navigate = useNavigate();
  const [optionType, setOptionType] = useState<ProductOptionType>("");
  const [uiType, setUiType] = useState<ProductOptionUiType>("GRID");
  const [textList, setTextList] = useState<
    CreateAdminProductOptionRequest["text"]
  >(
    LANGUAGE_OPTIONS.map((lang) => ({
      languageId: lang.id,
      name: "",
    })),
  );

  const { mutateAsync: createOption, isPending } =
    useCreateAdminProductOptionMutation({
      onSuccess: () => {
        navigate(PATH.PRODUCT_OPTIONS);
      },
    });

  const handleChangeName = (index: number, value: string) => {
    setTextList((prev) =>
      prev.map((text, i) => (i === index ? { ...text, name: value } : text)),
    );
  };

  const handleSubmit = async () => {
    const allFilled = textList.every((text) => text.name.trim());

    if (!allFilled) {
      alert("모든 언어의 옵션 이름을 입력해주세요.");
      return;
    }

    const payload: CreateAdminProductOptionRequest = {
      text: textList,
      type: optionType,
      uiType,
    };

    try {
      await createOption(payload);
    } catch (error) {
      console.error("옵션 생성 오류:", error);
      alert("옵션을 생성하는 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="p-8 pt-24">
      <div className="max-w-4xl">
        <div className="mb-6">
          <Button
            className="-ml-2 mb-4"
            disabled={isPending}
            onClick={() => navigate(PATH.PRODUCT_OPTIONS)}
            variant="ghost"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록으로
          </Button>
          <h2 className="mb-2">새 상품 옵션 추가</h2>
          <p className="text-gray-600">
            옵션 정보를 입력하세요. 옵션 등록 후 수정을 통해 옵션 값을 추가할 수
            있습니다.
          </p>
        </div>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4">옵션 기본 정보</h2>
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {textList.map((text, index) => (
              <div className="space-y-2" key={text.languageId}>
                <Label htmlFor={`optionName-${text.languageId}`}>
                  옵션 이름({LANGUAGE_OPTIONS[index].label}) *
                </Label>
                <Input
                  className="h-[40px] rounded-md bg-white"
                  disabled={isPending}
                  id={`optionName-${text.languageId}`}
                  onChange={(e) => handleChangeName(index, e.target.value)}
                  placeholder="옵션 이름을 입력하세요"
                  required
                  value={text.name}
                />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <OptionTypeInput
              isPending={isPending}
              optionType={optionType}
              setOptionType={setOptionType}
            />
            <OptionUITypeSelector
              isPending={isPending}
              setUiType={setUiType}
              uiType={uiType}
            />
          </div>
        </div>
      </div>
      <Flex className="pt-6" gap={4} justify="flex-end">
        <Button
          className="w-[120px]"
          disabled={
            isPending || textList.some((text) => !text.name.trim().length)
          }
          onClick={handleSubmit}
        >
          {isPending ? "등록 중..." : "저장"}
        </Button>
        <Button
          className="w-[120px]"
          disabled={isPending}
          onClick={() => navigate(PATH.PRODUCT_OPTIONS)}
          variant="outline"
        >
          취소
        </Button>
      </Flex>
    </div>
  );
}
