import { useState } from "react";

import { useNavigate } from "react-router";

import { useAdminBrandListQuery } from "@pages/BrandPage/ListPage/hooks";
import { useAdminCategoryListQuery } from "@pages/ProductCategoriesPage/hooks";
import { LANGUAGE_LIST } from "@shared/constants/locale";
import { PATH } from "@shared/constants/route";
import { type CreateAdminNewsRequest } from "@shared/services/news";
import { stripImageDomain, uploadImageFile } from "@shared/utils/image";
import { useFormik } from "formik";

import {
  NewsDetailSections,
  NewsFormFooter,
  NewsImageFields,
  NewsInfoCard,
  NewsMetaFields,
} from "../../components";
import { useCreateAdminNewsMutation } from "../../hooks";
import type { NewsFormErrors } from "../types";
import { createInitialValues, validateNewsForm } from "../utils";

const INITIAL_FORM_VALUES: CreateAdminNewsRequest =
  createInitialValues(LANGUAGE_LIST);

export function NewsForm() {
  const navigate = useNavigate();
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [homeImageFile, setHomeImageFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState("");
  const [profilePreview, setProfilePreview] = useState("");
  const [homeImagePreview, setHomeImagePreview] = useState("");
  const [sectionKeys, setSectionKeys] = useState<string[]>([]);
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

  const { mutateAsync: createNews, isPending } = useCreateAdminNewsMutation({
    onSuccess: () => navigate(PATH.NEWS),
  });

  const formik = useFormik<CreateAdminNewsRequest>({
    initialValues: INITIAL_FORM_VALUES,
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

      const sectionList = values.sectionList.map((section) => ({
        ...section,
        imageUrlList: section.imageUrlList.map((url) => stripImageDomain(url)),
      }));

      await createNews({
        ...values,
        banner,
        profile,
        homeImage,
        sectionList,
      });
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

  return (
    <form className="space-y-6" onSubmit={formik.handleSubmit}>
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-base font-semibold">기본 정보</h3>
        </div>
        <div className="px-6 py-5">
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
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-base font-semibold">메인 이미지</h3>
          <p className="mt-1 text-sm text-gray-600">
            배너, 프로필, 홈 이미지를 업로드하세요.
          </p>
        </div>
        <div className="px-6 py-5">
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
              banner: bannerPreview,
              profile: profilePreview,
              homeImage: homeImagePreview,
            }}
          />
        </div>
      </div>

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

      <NewsDetailSections
        errors={errors}
        onAddSection={() => {
          const nextSection = {
            textList: LANGUAGE_LIST.map((language) => ({
              languageId: language.id,
              title: "",
              subTitle: "",
              content: "",
            })),
            imageUrlList: [],
          };

          formik.setFieldValue("sectionList", [
            ...formik.values.sectionList,
            nextSection,
          ]);
          setSectionKeys((current) => [
            ...current,
            `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          ]);
        }}
        onChangeText={(index, languageId, field, value) => {
          const sectionIndex = formik.values.sectionList[index];
          if (!sectionIndex) return;

          const textIndex = sectionIndex.textList.findIndex(
            (item) => item.languageId === languageId,
          );
          if (textIndex === -1) return;

          formik.setFieldValue(
            `sectionList[${index}].textList[${textIndex}].${field}`,
            value,
          );
        }}
        onImagesChange={(index, urls) => {
          formik.setFieldValue(`sectionList[${index}].imageUrlList`, urls);
        }}
        onRemoveSection={(index) => {
          formik.setFieldValue(
            "sectionList",
            formik.values.sectionList.filter(
              (_, itemIndex) => itemIndex !== index,
            ),
          );
          setSectionKeys((current) =>
            current.filter((_, itemIndex) => itemIndex !== index),
          );
        }}
        sectionKeys={sectionKeys}
        sections={formik.values.sectionList}
      />

      <NewsFormFooter
        isSubmitting={formik.isSubmitting || isPending}
        onCancel={() => navigate(PATH.NEWS)}
      />
    </form>
  );
}
