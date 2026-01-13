import { useEffect, useRef, useState } from "react";

import { Navigate, useNavigate, useParams } from "react-router";

import { ArrowLeft } from "lucide-react";

import { PATH } from "@shared/constants/route";
import type {
  ProductOptionId,
  ProductOptionType,
  ProductOptionUiType,
} from "@shared/services/productOption";
import { useFormik } from "formik";

import { Button, Input, Label } from "@seoul-moment/ui";

import {
  OptionTypeSelector,
  OptionUITypeSelector,
  OptionValueTable,
  OptionValueAddModal,
  OptionValueEditModal,
  type OptionValueForm,
} from "../components";
import {
  useAdminProductOptionQuery,
  useUpdateAdminProductOptionMutation,
} from "../hooks";

const LANGUAGE_OPTIONS = [
  { id: 1, label: "한국어" },
  { id: 2, label: "영어" },
  { id: 3, label: "중국어(번체)" },
];

export default function ProductOptionEditPage() {
  const navigate = useNavigate();
  const params = useParams();
  const optionId = Number(params.id);

  if (isNaN(optionId)) {
    return <Navigate replace to={PATH.PRODUCT_OPTIONS} />;
  }

  return (
    <div className="p-8 pt-24">
      <div className="max-w-4xl">
        <div className="mb-6">
          <Button
            className="-ml-2 mb-4"
            onClick={() => navigate(PATH.PRODUCT_OPTIONS)}
            variant="ghost"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록으로
          </Button>
          <h2 className="mb-2">상품 옵션 수정</h2>
          <p className="text-gray-600">옵션 정보와 옵션 값을 수정하세요.</p>
        </div>
      </div>
      <ProductOptionContents optionId={optionId as ProductOptionId} />
    </div>
  );
}

interface ProductOptionContentsProps {
  optionId: ProductOptionId;
}

function ProductOptionContents({ optionId }: ProductOptionContentsProps) {
  const [optionValues, setOptionValues] = useState<OptionValueForm[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const hydratedOptionIdRef = useRef<number | null>(null);

  const navigate = useNavigate();

  const { mutateAsync: updateOption, isPending: isUpdatingOption } =
    useUpdateAdminProductOptionMutation();

  // useAdminProductOptionQuery 호출
  const { data, isPending } = useAdminProductOptionQuery(optionId);
  const formik = useFormik({
    initialValues: {
      text: LANGUAGE_OPTIONS.map((lang) => ({
        languageId: lang.id,
        name: "",
      })),
      type: "COLOR" as ProductOptionType,
      uiType: "GRID" as ProductOptionUiType,
    },
    enableReinitialize: false,
    onSubmit: async (values, { setSubmitting }) => {
      const allFilled = values.text.every(
        (text) => text.name.trim().length > 0,
      );
      if (!allFilled) {
        alert("모든 언어의 옵션 이름을 입력해주세요.");
        return;
      }

      try {
        await updateOption({
          optionId,
          payload: {
            text: values.text,
            type: values.type,
            uiType: values.uiType,
          },
        });
        alert("옵션 정보가 수정되었습니다.");
      } catch (error) {
        console.error("옵션 수정 오류:", error);
        alert("옵션을 수정하는 중 오류가 발생했습니다.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const { dirty, resetForm, values } = formik;
  const type = values.type;

  useEffect(() => {
    if (data) {
      const LANGUAGE_CODE_TO_ID: Record<string, number> = {
        ko: 1,
        en: 2,
        "zh-TW": 3,
      };

      const nextTextList = LANGUAGE_OPTIONS.map((lang) => {
        const matchedName = data.nameDto.find(
          (dto) => LANGUAGE_CODE_TO_ID[dto.languageCode] === lang.id,
        );
        return { languageId: lang.id, name: matchedName?.name ?? "" };
      });

      const nextOptionValues = data.optionValueList.map((value) => ({
        id: value.id,
        text: LANGUAGE_OPTIONS.map((lang) => ({
          languageId: lang.id,
          value:
            value.nameDto.find(
              (dto) => LANGUAGE_CODE_TO_ID[dto.languageCode] === lang.id,
            )?.value ?? "",
        })),
        colorCode: value.colorCode,
      }));

      setOptionValues(nextOptionValues);
      const isDifferentOption = hydratedOptionIdRef.current !== optionId;

      const derivedValues = {
        text: nextTextList,
        type: data.type,
        uiType: data.uiType,
      };

      if (isDifferentOption) {
        resetForm({ values: derivedValues });
        setEditingIndex(null);
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        hydratedOptionIdRef.current = optionId;
        return;
      }

      if (!dirty) {
        resetForm({ values: derivedValues });
      }
    }
  }, [data, resetForm, dirty, optionId]);

  const handleOpenAddModal = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => setIsAddModalOpen(false);

  const handleEditOptionValue = (index: number) => {
    setEditingIndex(index);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditingIndex(null);
    setIsEditModalOpen(false);
  };

  const handleRemoveOptionValue = (index: number) => {
    setOptionValues((prev) => prev.filter((_, i) => i !== index));
    setEditingIndex((current) => {
      if (current === null) return current;
      if (current === index) return null;
      if (current > index) return current - 1;
      return current;
    });
    if (editingIndex === index) {
      setIsEditModalOpen(false);
    }
  };

  const handleCancel = () => {
    navigate(PATH.PRODUCT_OPTIONS, { replace: true });
  };

  const isFormDisabled = isPending || isUpdatingOption || formik.isSubmitting;

  console.log();

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4">옵션 기본 정보</h2>
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {formik.values.text.map((text, index) => (
              <div className="space-y-2" key={text.languageId}>
                <Label htmlFor={`optionName-${text.languageId}`}>
                  옵션 이름({LANGUAGE_OPTIONS[index].label}) *
                </Label>
                <Input
                  className="h-[40px] rounded-md bg-white"
                  disabled={isFormDisabled}
                  id={`optionName-${text.languageId}`}
                  name={`text.${index}.name`}
                  onChange={formik.handleChange}
                  placeholder="옵션 이름을 입력하세요"
                  required
                  value={text.name}
                />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <OptionTypeSelector
              isPending={isFormDisabled}
              optionType={formik.values.type}
              setOptionType={(value) => formik.setFieldValue("type", value)}
            />
            <OptionUITypeSelector
              isPending={isFormDisabled}
              setUiType={(value) => formik.setFieldValue("uiType", value)}
              uiType={formik.values.uiType}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button
              disabled={isFormDisabled}
              onClick={handleCancel}
              type="button"
              variant="outline"
            >
              취소
            </Button>
            <Button
              className="w-[96px]"
              disabled={isFormDisabled}
              onClick={() => formik.handleSubmit()}
              type="button"
            >
              수정
            </Button>
          </div>
        </div>
      </div>

      <OptionValueTable
        isPending={isPending}
        languages={LANGUAGE_OPTIONS}
        onAdd={handleOpenAddModal}
        onEdit={handleEditOptionValue}
        onRemove={handleRemoveOptionValue}
        optionId={optionId}
        type={type}
        values={optionValues}
      />

      <OptionValueAddModal
        isOpen={isAddModalOpen}
        isPending={isPending}
        languages={LANGUAGE_OPTIONS}
        onClose={handleCloseAddModal}
        optionId={optionId}
        type={type}
      />
      <OptionValueEditModal
        initialValue={editingIndex !== null ? optionValues[editingIndex] : null}
        isOpen={isEditModalOpen}
        isPending={isPending}
        languages={LANGUAGE_OPTIONS}
        onClose={handleCloseEditModal}
        optionId={optionId}
        type={type}
      />
    </div>
  );
}
