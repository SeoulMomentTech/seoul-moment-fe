import { useMemo, useState } from "react";

import { useNavigate } from "react-router";

import { useAdminBrandListQuery } from "@pages/BrandPage/ListPage/hooks";
import { useAdminCategoryListQuery } from "@pages/ProductCategoriesPage/hooks";
import { LANGUAGE_LIST } from "@shared/constants/locale";
import { PATH } from "@shared/constants/route";
import type {
  AdminNewsDetail,
  AdminNewsId,
  CreateAdminNewsRequest,
  UpdateAdminNewsRequest,
} from "@shared/services/news";
import { uploadImageFile } from "@shared/utils/image";
import { useFormik } from "formik";

import { NewsFormFooter } from "../../AddPage/components/NewsFormFooter";
import { NewsImageFields } from "../../AddPage/components/NewsImageFields";
import { NewsInfoCard } from "../../AddPage/components/NewsInfoCard";
import { NewsMetaFields } from "../../AddPage/components/NewsMetaFields";
import type { NewsFormErrors } from "../../AddPage/types";
import { validateNewsForm } from "../../AddPage/utils";
import { useAdminNewsQuery, useUpdateAdminNewsMutation } from "../../hooks";

interface NewsEditFormProps {
  newsId: AdminNewsId;
}

const buildInitialValues = (
  detail: AdminNewsDetail,
): CreateAdminNewsRequest => ({
  categoryId: detail.categoryId,
  brandId: detail.brandId,
  writer: detail.writer ?? "",
  banner: detail.banner ?? "",
  profile: detail.profile ?? "",
  homeImage: detail.homeImage ?? "",
  list: LANGUAGE_LIST.map((language) => {
    const text = detail.multilingualTextList.find(
      (item) => item.languageId === language.id,
    );
    return {
      languageId: language.id,
      title: text?.title ?? "",
      content: text?.content ?? "",
    };
  }),
  sectionList: [],
});

export function NewsEditForm({ newsId }: NewsEditFormProps) {
  const navigate = useNavigate();
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [homeImageFile, setHomeImageFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState("");
  const [profilePreview, setProfilePreview] = useState("");
  const [homeImagePreview, setHomeImagePreview] = useState("");
  const { data: categoryResponse, isLoading: isCategoryLoading } =
    useAdminCategoryListQuery({
      page: 1,
      count: 100,
      searchColumn: "name",
      sort: "DESC",
    });
  const { data: brandResponse, isLoading: isBrandLoading } =
    useAdminBrandListQuery({
      page: 1,
      count: 100,
      searchColumn: "name",
      sort: "DESC",
    });

  const { data: newsResponse, isLoading } = useAdminNewsQuery(newsId);
  const detail = newsResponse?.data;

  const initialValues = useMemo(
    () => (detail ? buildInitialValues(detail) : undefined),
    [detail],
  );

  const { mutateAsync: updateNews, isPending } = useUpdateAdminNewsMutation({
    onSuccess: () => navigate(PATH.NEWS),
  });

  const formik = useFormik<CreateAdminNewsRequest>({
    enableReinitialize: true,
    initialValues: initialValues ?? {
      categoryId: 1,
      brandId: undefined,
      writer: "",
      banner: "",
      profile: "",
      homeImage: "",
      list: LANGUAGE_LIST.map((language) => ({
        languageId: language.id,
        title: "",
        content: "",
      })),
      sectionList: [],
    },
    validateOnBlur: false,
    validateOnChange: false,
    validate: (values) => validateNewsForm(values),
    onSubmit: async (values) => {
      const banner =
        bannerFile !== null
          ? (await uploadImageFile(bannerFile, "news")).imagePath
          : values.banner;
      const profile =
        profileFile !== null
          ? (await uploadImageFile(profileFile, "news")).imagePath
          : values.profile;
      const homeImage =
        homeImageFile !== null
          ? (await uploadImageFile(homeImageFile, "news")).imagePath
          : values.homeImage;

      const payload: UpdateAdminNewsRequest = {
        categoryId: values.categoryId,
        brandId: values.brandId,
        writer: values.writer,
        banner,
        profile,
        homeImage,
        multilingualTextList: values.list.map((item) => ({
          languageId: item.languageId,
          title: item.title,
          content: item.content,
        })),
      };

      await updateNews({ newsId, payload });
    },
  });

  const errors = formik.errors as NewsFormErrors;
  const categoryOptions =
    categoryResponse?.data.list.map((category) => ({
      value: category.id,
      label:
        category.nameDto.find((item) => item.languageCode === "ko")?.name ??
        `ID ${category.id}`,
    })) ?? [];
  const brandOptions =
    brandResponse?.data.list.map((brand) => ({
      value: brand.id,
      label:
        brand.nameDto.find((item) => item.languageCode === "ko")?.name ??
        `ID ${brand.id}`,
    })) ?? [];

  if (isLoading || !detail) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
      </div>
    );
  }

  console.log(formik.values);

  return (
    <form className="space-y-6" onSubmit={formik.handleSubmit}>
      <NewsInfoCard
        errors={errors}
        onChange={(languageId, field, value) => {
          const index = formik.values.list.findIndex(
            (item) => item.languageId === languageId,
          );
          if (index === -1) return;
          formik.setFieldValue(`list[${index}].${field}`, value);
        }}
        values={formik.values}
      />

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-base font-semibold">기본 정보</h3>
          <p className="mt-1 text-sm text-gray-600">
            작성자 및 이미지 정보를 입력하세요.
          </p>
        </div>
        <NewsMetaFields
          brandOptions={brandOptions}
          categoryOptions={categoryOptions}
          errors={errors}
          isBrandLoading={isBrandLoading}
          isCategoryLoading={isCategoryLoading}
          onChange={(field, value) => {
            if (field === "categoryId") {
              formik.setFieldValue("categoryId", Number(value));
              return;
            }

            if (field === "brandId") {
              if (value === "none") {
                formik.setFieldValue("brandId", undefined);
                return;
              }

              formik.setFieldValue(
                "brandId",
                value ? Number(value) : undefined,
              );
              return;
            }

            formik.setFieldValue(field, value);
          }}
          values={formik.values}
        />

        <div className="mt-6 border-t border-gray-200 pt-6">
          <NewsImageFields
            errors={errors}
            onChange={(field) => (event) => {
              const file = event.target.files?.[0];
              if (!file) {
                return;
              }

              const previewUrl = URL.createObjectURL(file);

              if (field === "banner") {
                setBannerFile(file);
                setBannerPreview(previewUrl);
                formik.setFieldValue("banner", previewUrl);
                return;
              }

              if (field === "profile") {
                setProfileFile(file);
                setProfilePreview(previewUrl);
                formik.setFieldValue("profile", previewUrl);
                return;
              }

              setHomeImageFile(file);
              setHomeImagePreview(previewUrl);
              formik.setFieldValue("homeImage", previewUrl);
            }}
            onClear={(field) => {
              if (field === "banner") {
                setBannerFile(null);
                setBannerPreview("");
                formik.setFieldValue("banner", "");
                return;
              }

              if (field === "profile") {
                setProfileFile(null);
                setProfilePreview("");
                formik.setFieldValue("profile", "");
                return;
              }

              setHomeImageFile(null);
              setHomeImagePreview("");
              formik.setFieldValue("homeImage", "");
            }}
            previews={{
              banner: bannerPreview || detail.banner,
              profile: profilePreview || detail.profile,
              homeImage: homeImagePreview || detail.homeImage,
            }}
          />
        </div>
      </div>

      <NewsFormFooter
        isSubmitting={formik.isSubmitting || isPending}
        onCancel={() => navigate(PATH.NEWS)}
      />
    </form>
  );
}
