import { useNavigate } from "react-router";


import { PATH } from "@shared/constants/route";
import type {
  PostAdminProductLanguage,
  PostAdminProductRequest,
} from "@shared/services/adminProduct";
import { useFormik, type FormikErrors } from "formik";

import { Button } from "@seoul-moment/ui";

import { BrandSelector } from "./form/BrandSelector";
import { CategorySelector } from "./form/CategorySelector";
import { DetailImageUploader } from "./form/DetailImageUploader";
import { MultiLanguageInputs } from "./form/MultiLanguageInputs";
import { ProductCategorySelector } from "./form/ProductCategorySelector";

interface FormError {
  brandId?: string;
  categoryId?: string;
  productCategoryId?: string;
  detailInfoImageUrl?: string;
  text?: Array<{ name?: string; origin?: string } | undefined>;
}

interface ProductMasterFormProps {
  initialValues?: PostAdminProductRequest;
  isEdit?: boolean;
  onSubmit(values: PostAdminProductRequest): void;
}

export const ProductMasterForm = ({
  initialValues,
  onSubmit,
  isEdit = false,
}: ProductMasterFormProps) => {
  const navigate = useNavigate();

  const formik = useFormik<PostAdminProductRequest>({
    initialValues: initialValues || {
      brandId: 0,
      categoryId: 0,
      productCategoryId: 0,
      detailInfoImageUrl: "",
      text: [
        { languageId: 1, name: "", origin: "" }, // Korean (assuming ID 1)
        { languageId: 2, name: "", origin: "" }, // English (assuming ID 2)
        { languageId: 3, name: "", origin: "" }, // Chinese (assuming ID 3)
      ],
    },
    validate: (values) => {
      const errors: FormError = {};
      if (!values.brandId) errors.brandId = "브랜드를 선택해주세요.";
      if (!values.categoryId) errors.categoryId = "카테고리를 선택해주세요.";
      if (!values.productCategoryId)
        errors.productCategoryId = "상품 카테고리를 선택해주세요.";
      if (!values.detailInfoImageUrl)
        errors.detailInfoImageUrl = "이미지를 업로드해주세요.";

      const textErrors: Array<{ name?: string; origin?: string }> = [];
      let hasTextError = false;

      values.text.forEach((t, index) => {
        const textError: { name?: string; origin?: string } = {};
        if (!t.name) {
          textError.name = "이름을 입력해주세요.";
          hasTextError = true;
        }
        if (!t.origin) {
          textError.origin = "원산지를 입력해주세요.";
          hasTextError = true;
        }
        textErrors[index] = textError;
      });

      if (hasTextError) errors.text = textErrors;

      return errors;
    },
    onSubmit,
  });

  const textErrors = formik.errors.text as
    | FormikErrors<PostAdminProductLanguage>[]
    | undefined;

  return (
    <form className="space-y-6" onSubmit={formik.handleSubmit}>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">기본 정보</h3>
        <div className="grid grid-cols-3 gap-6">
          <BrandSelector
            error={formik.errors.brandId}
            onChange={(val) => formik.setFieldValue("brandId", val)}
            value={formik.values.brandId}
          />

          <CategorySelector
            error={formik.errors.categoryId}
            onChange={(val) => formik.setFieldValue("categoryId", val)}
            value={formik.values.categoryId}
          />

          <ProductCategorySelector
            error={formik.errors.productCategoryId}
            onChange={(val) => formik.setFieldValue("productCategoryId", val)}
            value={formik.values.productCategoryId}
          />
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">상세 정보 이미지</h3>
        <DetailImageUploader
          error={formik.errors.detailInfoImageUrl}
          onChange={(url) => formik.setFieldValue("detailInfoImageUrl", url)}
          value={formik.values.detailInfoImageUrl}
        />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">다국어 정보</h3>
        <MultiLanguageInputs
          errors={textErrors}
          onChange={formik.handleChange}
          values={formik.values.text}
        />
      </div>

      <div className="flex justify-end gap-3 border-t border-gray-200 pt-6">
        <Button
          onClick={() => navigate(PATH.PRODUCT_MASTER)}
          type="button"
          variant="outline"
        >
          취소
        </Button>
        <Button type="submit">{isEdit ? "수정" : "등록"}</Button>
      </div>
    </form>
  );
};
