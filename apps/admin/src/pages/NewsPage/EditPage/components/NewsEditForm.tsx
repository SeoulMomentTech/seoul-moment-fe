import { useCallback, useEffect, useRef, useState } from "react";

import { Navigate, useNavigate } from "react-router";

import { useAdminBrandListQuery } from "@pages/BrandPage/ListPage/hooks";
import { useAdminCategoryListQuery } from "@pages/ProductCategoriesPage/hooks";
import { LANGUAGE_LIST } from "@shared/constants/locale";
import { PATH } from "@shared/constants/route";
import type {
  AdminNewsDetailV1,
  AdminNewsId,
  UpdateAdminNewsRequestV1,
} from "@shared/services/news";
import { uploadImageFile } from "@shared/utils/image";
import { useFormik } from "formik";

import {
  NewsDetailSections,
  NewsFormFooter,
  NewsImageFields,
  NewsInfoCard,
  NewsMetaFields,
} from "../../components";
import {
  useAdminNewsCategoryListQuery,
  useAdminNewsHashtagListQuery,
  useAdminNewsV1Query,
  useUpdateAdminNewsV1Mutation,
} from "../../hooks";
import type { NewsFormErrors, NewsFormValues } from "../../types";
import { validateNewsForm } from "../../utils";

interface NewsEditFormProps {
  newsId: AdminNewsId;
}

const buildInitialValues = (detail: AdminNewsDetailV1): NewsFormValues => {
  const sectionCount = Math.max(
    0,
    ...detail.multilingualTextList.map((item) => item.section?.length ?? 0),
  );

  const sectionList = Array.from({ length: sectionCount }, (_, index) => {
    const imageList =
      detail.multilingualTextList.find(
        (item) => item.section?.[index]?.imageList?.length,
      )?.section?.[index]?.imageList ?? [];

    return {
      textList: LANGUAGE_LIST.map((language) => {
        const text = detail.multilingualTextList.find(
          (item) => item.languageId === language.id,
        );
        const section = text?.section?.[index];
        return {
          languageId: language.id,
          title: section?.title ?? "",
          subTitle: section?.subTitle ?? "",
          content: section?.content ?? "",
        };
      }),
      imageUrlList: imageList,
    };
  });

  return {
    categoryId: detail.categoryId,
    newsCategoryId: detail.newsCategoryId,
    brandId: detail.brandId,
    hashtagId: detail.hashtagId,
    editorPick: detail.editorPick ?? false,
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
    sectionList,
  };
};

export function NewsEditForm({ newsId }: NewsEditFormProps) {
  const navigate = useNavigate();
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [homeImageFile, setHomeImageFile] = useState<File | null>(null);
  const [sectionKeys, setSectionKeys] = useState<string[]>([]);
  const [sectionIds, setSectionIds] = useState<(number | null)[]>([]);

  const initializedRef = useRef(false);
  const brandClearedRef = useRef(false);
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

  const { data: newsCategoryResponse, isLoading: isNewsCategoryLoading } =
    useAdminNewsCategoryListQuery();
  const { data: hashtagResponse, isLoading: isHashtagLoading } =
    useAdminNewsHashtagListQuery();

  const {
    data: newsResponse,
    isLoading,
    isError,
  } = useAdminNewsV1Query(newsId, {
    toastOnError: "존재하지 않는 뉴스입니다.",
  });
  const detail = newsResponse?.data;

  const { mutateAsync: updateNews, isPending } = useUpdateAdminNewsV1Mutation({
    onSuccess: () => navigate(PATH.NEWS),
  });

  const formik = useFormik<NewsFormValues>({
    initialValues: {
      categoryId: 1,
      newsCategoryId: 0,
      brandId: undefined,
      hashtagId: undefined,
      editorPick: false,
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
          ? (await uploadImageFile(bannerFile, "news")).imageUrl
          : values.banner;
      const profile =
        profileFile !== null
          ? (await uploadImageFile(profileFile, "news")).imageUrl
          : values.profile;
      const homeImage =
        homeImageFile !== null
          ? (await uploadImageFile(homeImageFile, "news")).imageUrl
          : values.homeImage;

      const payload: UpdateAdminNewsRequestV1 = {
        categoryId: values.categoryId,
        newsCategoryId: values.newsCategoryId,
        brandId: values.brandId,
        hashtagId: values.hashtagId,
        editorPick: values.editorPick,
        writer: values.writer,
        banner,
        profile,
        homeImage, //multilingualTextList
        multilingualTextList: values.list.map((item) => ({
          languageId: item.languageId,
          title: item.title,
          content: item.content,
          section: values.sectionList.map((section, sectionIndex) => {
            const sectionText = section.textList.find(
              (text) => text.languageId === item.languageId,
            );
            return {
              id: sectionIds[sectionIndex] ?? undefined,
              title: sectionText?.title ?? "",
              subTitle: sectionText?.subTitle ?? "",
              content: sectionText?.content ?? "",
              imageList: section.imageUrlList,
            };
          }),
        })),
      };

      await updateNews({ newsId, payload });
    },
  });

  const { setFieldValue, setValues } = formik;



  const handleChangeMetaField = useCallback(
    (
      field: "categoryId" | "brandId" | "writer" | "newsCategoryId",
      value: string,
    ) => {
      if (isCategoryLoading || isBrandLoading || !value) return;

      if (field === "categoryId" || field === "newsCategoryId") {
        setFieldValue(field, Number(value));
        return;
      }

      if (field === "brandId") {
        if (value === "none") {
          brandClearedRef.current = true;
          setFieldValue("brandId", undefined);
          return;
        }

        brandClearedRef.current = false;
        setFieldValue("brandId", value ? Number(value) : undefined);
        return;
      }

      setFieldValue(field, value);
    },
    [isBrandLoading, isCategoryLoading, setFieldValue],
  );

  useEffect(() => {
    if (!detail || initializedRef.current) {
      return;
    }

    const nextValues = buildInitialValues(detail);
    const baseSections =
      detail.multilingualTextList.find((item) => item.section?.length)
        ?.section ?? [];
    const ids = baseSections.map((section) => section.id ?? null);
    setSectionIds(ids);
    setSectionKeys(
      ids.map((id, index) =>
        id !== null ? `section-${id}` : `section-${index + 1}`,
      ),
    );

    setValues(nextValues, true);
    initializedRef.current = true;
  }, [detail, setValues]);



  useEffect(() => {
    if (!detail?.brandId) {
      return;
    }

    if (brandClearedRef.current) {
      return;
    }

    if (formik.values.brandId === undefined || formik.values.brandId === null) {
      setFieldValue("brandId", detail.brandId, false);
    }
  }, [detail?.brandId, formik.values.brandId, setFieldValue]);

  useEffect(() => {
    initializedRef.current = false;
  }, [newsId]);

  const errors = formik.errors as NewsFormErrors;
  const categoryOptions =
    categoryResponse?.data.list.map((category) => ({
      value: category.id,
      label:
        category.languageList.find((item) => item.languageCode === "ko")
          ?.name ?? `ID ${category.id}`,
    })) ?? [];
  const baseBrandOptions =
    brandResponse?.data.list.map((brand) => ({
      value: brand.id,
      label:
        brand.nameList.find((item) => item.languageCode === "ko")?.name ??
        `ID ${brand.id}`,
    })) ?? [];
  const selectedBrandId = formik.values.brandId;
  const brandOptions =
    selectedBrandId !== undefined &&
      selectedBrandId !== null &&
      !baseBrandOptions.some((option) => option.value === selectedBrandId)
      ? [
        { value: selectedBrandId, label: `ID ${selectedBrandId}` },
        ...baseBrandOptions,
      ]
      : baseBrandOptions;
  const newsCategoryOptions =
    newsCategoryResponse?.data.list.map((category) => ({
      value: category.id,
      label:
        category.nameList.find((item) => item.languageCode === "ko")?.name ??
        `ID ${category.id}`,
    })) ?? [];
  const hashtagOptions =
    hashtagResponse?.data.list.map((hashtag) => ({
      value: hashtag.id,
      label:
        hashtag.nameList.find((item) => item.languageCode === "ko")?.name ??
        `ID ${hashtag.id}`,
    })) ?? [];

  if (isError) {
    return <Navigate replace to={PATH.NEWS} />;
  }

  if (isLoading || !detail) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
      </div>
    );
  }

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
          hashtagOptions={hashtagOptions}
          isBrandLoading={isBrandLoading}
          isCategoryLoading={isCategoryLoading}
          isHashtagLoading={isHashtagLoading}
          isNewsCategoryLoading={isNewsCategoryLoading}
          newsCategoryOptions={newsCategoryOptions}
          onChange={handleChangeMetaField}
          onEditorPickChange={(checked) =>
            formik.setFieldValue("editorPick", checked)
          }
          onHashtagChange={(value) => {
            // Radix Select가 옵션 로딩 중 빈 값으로 onValueChange를 호출해도
            // 초기값(hashtagId)을 덮어쓰지 않도록 가드
            if (!value) return;
            formik.setFieldValue(
              "hashtagId",
              value === "none" ? undefined : Number(value),
            );
          }}
          showEditorPick
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
                formik.setFieldValue("banner", previewUrl);
                return;
              }

              if (field === "profile") {
                setProfileFile(file);
                formik.setFieldValue("profile", previewUrl);
                return;
              }

              setHomeImageFile(file);
              formik.setFieldValue("homeImage", previewUrl);
            }}
            onClear={(field) => {
              if (field === "banner") {
                setBannerFile(null);
                formik.setFieldValue("banner", "");
                return;
              }

              if (field === "profile") {
                setProfileFile(null);
                formik.setFieldValue("profile", "");
                return;
              }

              setHomeImageFile(null);
              formik.setFieldValue("homeImage", "");
            }}
            previews={{
              banner: formik.values.banner,
              profile: formik.values.profile,
              homeImage: formik.values.homeImage,
            }}
          />
        </div>
      </div>

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
          setSectionIds((current) => [...current, null]);
        }}
        onChangeText={(index, languageId, field, value) => {
          const sectionValue = formik.values.sectionList[index];
          if (!sectionValue) return;

          const textIndex = sectionValue.textList.findIndex(
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
          setSectionIds((current) =>
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
