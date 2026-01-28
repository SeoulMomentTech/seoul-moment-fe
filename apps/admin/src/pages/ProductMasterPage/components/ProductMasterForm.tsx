import { useNavigate } from "react-router";

import { ImageUploader } from "@shared/components/image-uploader";
import { PATH } from "@shared/constants/route";
import type {
  PostAdminProductLanguage,
  PostAdminProductRequest,
} from "@shared/services/adminProduct";
import { uploadImageFile } from "@shared/utils/image";
import { useFormik, type FormikErrors } from "formik";

import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@seoul-moment/ui";


import { useBrandListQuery } from "../hooks/useBrandListQuery";
import { useCategoryListQuery } from "../hooks/useCategoryListQuery";
import { useProductCategoryListQuery } from "../hooks/useProductCategoryListQuery";

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

  const { data: brands } = useBrandListQuery();
  const { data: categories } = useCategoryListQuery();
  const { data: productCategories } = useProductCategoryListQuery();

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

  const getLanguageLabel = (id: number) => {
    switch (id) {
      case 1:
        return "한국어";
      case 2:
        return "영어";
      case 3:
        return "중국어";
      default:
        return `Language ${id}`;
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { imageUrl } = await uploadImageFile(file, "product");
      formik.setFieldValue("detailInfoImageUrl", imageUrl);
    } catch (error) {
      console.error(error);
      alert("이미지 업로드에 실패했습니다.");
    }
  };

  const textErrors = formik.errors.text as
    | FormikErrors<PostAdminProductLanguage>[]
    | undefined;



  return (
    <form className="space-y-6" onSubmit={formik.handleSubmit}>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">기본 정보</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="flex" htmlFor="brandId">
              브랜드 <span className="ml-1 text-red-500">*</span>
            </Label>
            <Select
              onValueChange={(val) => formik.setFieldValue("brandId", Number(val))}
              value={formik.values.brandId ? formik.values.brandId.toString() : ""}
            >
              <SelectTrigger className={formik.errors.brandId ? "border-red-500" : ""}>
                <SelectValue placeholder="브랜드 선택" />
              </SelectTrigger>
              <SelectContent className="bg-white max-h-[300px]">
                {brands?.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id.toString()}>
                    {brand.nameDto.find((n) => n.languageCode === "ko")?.name ||
                      brand.nameDto[0]?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formik.errors.brandId && (
              <p className="text-xs text-red-500">{formik.errors.brandId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="flex" htmlFor="categoryId">
              카테고리 <span className="ml-1 text-red-500">*</span>
            </Label>
            <Select
              onValueChange={(val) => formik.setFieldValue("categoryId", Number(val))}
              value={formik.values.categoryId ? formik.values.categoryId.toString() : ""}
            >
              <SelectTrigger className={formik.errors.categoryId ? "border-red-500" : ""}>
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent className="bg-white max-h-[300px]">
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.nameDto.find((n) => n.languageCode === "ko")?.name ||
                      cat.nameDto[0]?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formik.errors.categoryId && (
              <p className="text-xs text-red-500">{formik.errors.categoryId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="flex" htmlFor="productCategoryId">
              상품 카테고리 <span className="ml-1 text-red-500">*</span>
            </Label>
            <Select
              onValueChange={(val) =>
                formik.setFieldValue("productCategoryId", Number(val))
              }
              value={
                formik.values.productCategoryId
                  ? formik.values.productCategoryId.toString()
                  : ""
              }
            >
              <SelectTrigger
                className={formik.errors.productCategoryId ? "border-red-500" : ""}
              >
                <SelectValue placeholder="상품 카테고리 선택" />
              </SelectTrigger>
              <SelectContent className="bg-white max-h-[300px]">
                {productCategories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.nameDto.find((n) => n.languageCode === "ko")?.name ||
                      cat.nameDto[0]?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formik.errors.productCategoryId && (
              <p className="text-xs text-red-500">
                {formik.errors.productCategoryId}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">상세 정보 이미지</h3>
        <div className="space-y-2">
          <ImageUploader
            id="detailInfoImageUrl"
            label="이미지 업로드"
            onChange={handleImageChange}
            onClear={() => formik.setFieldValue("detailInfoImageUrl", "")}
            preview={formik.values.detailInfoImageUrl}
            required
          />
          {formik.errors.detailInfoImageUrl && (
            <p className="text-xs text-red-500">
              {formik.errors.detailInfoImageUrl}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">다국어 정보</h3>
        <div className="flex flex-col gap-6">
          {formik.values.text.map((lang, index) => (
            <div
              className="rounded-lg border border-gray-200 bg-gray-50 p-4"
              key={lang.languageId}
            >
              <h4 className="mb-4 font-medium">
                {getLanguageLabel(lang.languageId)}
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex">
                    이름 <span className="ml-1 text-red-500">*</span>
                  </Label>
                  <Input
                    className={textErrors?.[index]?.name ? "border-red-500" : ""}
                    name={`text[${index}].name`}
                    onChange={formik.handleChange}
                    placeholder={`이름 (${getLanguageLabel(lang.languageId)})`}
                    value={lang.name}
                  />
                  {textErrors?.[index]?.name && (
                    <p className="text-xs text-red-500">{textErrors[index]?.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="flex">
                    원산지 <span className="ml-1 text-red-500">*</span>
                  </Label>
                  <Input
                    className={textErrors?.[index]?.origin ? "border-red-500" : ""}
                    name={`text[${index}].origin`}
                    onChange={formik.handleChange}
                    placeholder={`원산지 (${getLanguageLabel(lang.languageId)})`}
                    value={lang.origin}
                  />
                  {textErrors?.[index]?.origin && (
                    <p className="text-xs text-red-500">
                      {textErrors[index]?.origin}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
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

