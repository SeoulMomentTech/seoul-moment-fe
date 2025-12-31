import { useEffect } from "react";

import { useNavigate } from "react-router";

import { LANGUAGE_LIST } from "@shared/constants/locale";
import { PATH } from "@shared/constants/route";
import {
  type BrandId,
  type CreateAdminBrandRequest,
  type UpdateAdminBrandImagePayload,
  type UpdateAdminBrandRequest,
  type UpdateAdminBrandSectionImageSortOrder,
  type UpdateAdminBrandSectionPayload,
  type UpdateAdminBrandSectionSortOrder,
} from "@shared/services/brand";
import { useFormik, type FormikErrors } from "formik";

import {
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@seoul-moment/ui";

import { BannerImages } from "../../components/BannerImages";
import { BasicInfo } from "../../components/BasicInfo";
import { BrandSections } from "../../components/BrandSection";
import { useUpdateAdminBrandMutation } from "../../hooks";
import { useAdminBrandSuspenseQuery } from "../../hooks/useAdminBrandQuery";
import { createEmptySection, stripImageDomain } from "../../utils/section";

interface BrandFormProps {
  id: BrandId;
}

const BANNER_REQUIRED_COUNT = 2;

const INITIAL_FORM_VALUES: CreateAdminBrandRequest = {
  englishName: "",
  categoryId: 1,
  profileImageUrl: "",
  productBannerImageUrl: "",
  textList: LANGUAGE_LIST.map((language) => ({
    languageId: language.id,
    name: "",
    description: "",
  })),
  sectionList: [
    createEmptySection(),
    createEmptySection(),
    createEmptySection(),
    createEmptySection(),
    createEmptySection(),
  ],
  bannerImageUrlList: [],
  mobileBannerImageUrlList: [],
};

export default function BrandForm({ id }: BrandFormProps) {
  const navigate = useNavigate();

  const { data: brandData } = useAdminBrandSuspenseQuery(id);
  const { mutate, isPending } = useUpdateAdminBrandMutation({
    onSuccess: () => navigate(PATH.BRAND),
  });

  const formik = useFormik<CreateAdminBrandRequest>({
    initialValues: INITIAL_FORM_VALUES,
    validateOnBlur: false,
    validateOnChange: false,
    validate: (values) => {
      const validationErrors: FormikErrors<CreateAdminBrandRequest> &
        Record<string, string> = {};

      if (!values.englishName.trim()) {
        validationErrors.englishName = "영어 이름을 입력해주세요.";
      }

      if (!values.profileImageUrl) {
        validationErrors.profileImageUrl = "프로필 이미지를 업로드해주세요.";
      }

      values.textList.forEach((text) => {
        const languageName =
          LANGUAGE_LIST.find((language) => language.id === text.languageId)
            ?.name ?? "";

        if (!text.name.trim()) {
          validationErrors[`name_${text.languageId}`] =
            `${languageName} 브랜드명을 입력해주세요.`;
        }

        if (!text.description.trim()) {
          validationErrors[`description_${text.languageId}`] =
            `${languageName} 설명을 입력해주세요.`;
        }
      });

      values.sectionList.forEach((section, sectionIndex) => {
        section.textList.forEach((text) => {
          const languageName =
            LANGUAGE_LIST.find((language) => language.id === text.languageId)
              ?.name ?? "";

          if (!text.title.trim()) {
            validationErrors[
              `section_${sectionIndex}_title_${text.languageId}`
            ] = `${languageName} 섹션 제목을 입력해주세요.`;
          }

          if (!text.content.trim()) {
            validationErrors[
              `section_${sectionIndex}_content_${text.languageId}`
            ] = `${languageName} 섹션 내용을 입력해주세요.`;
          }
        });
      });

      if (values.bannerImageUrlList.length < BANNER_REQUIRED_COUNT) {
        validationErrors.bannerImageUrlList = `PC 배너 이미지를 ${BANNER_REQUIRED_COUNT}장 업로드해주세요.`;
      }

      if (values.mobileBannerImageUrlList.length < BANNER_REQUIRED_COUNT) {
        validationErrors.mobileBannerImageUrlList = `모바일 배너 이미지를 ${BANNER_REQUIRED_COUNT}장 업로드해주세요.`;
      }

      return validationErrors;
    },
    onSubmit: (values) => {
      const sectionId = brandData.data.multilingualTextList[0].section[0].id;
      const existingBannerList = brandData.data.bannerList ?? [];
      const existingMobileBannerList = brandData.data.mobileBannerList ?? [];
      const existingSectionImageLists = (() => {
        const multilingualTextList = brandData?.data.multilingualTextList;
        if (!multilingualTextList?.length) return [];

        const sectionCount = multilingualTextList.reduce(
          (max, text) => Math.max(max, text.section?.length ?? 0),
          0,
        );

        return Array.from({ length: sectionCount }, (_, sectionIndex) => {
          const sectionForImages = multilingualTextList.find(
            (text) => text.section?.[sectionIndex]?.imageList.length,
          );

          return (
            sectionForImages?.section?.[sectionIndex]?.imageList ??
            multilingualTextList[0]?.section?.[sectionIndex]?.imageList ??
            []
          );
        });
      })();

      const bannerImageUrlList: UpdateAdminBrandImagePayload[] =
        values.bannerImageUrlList.map((imageUrl, index) => ({
          oldImageUrl: stripImageDomain(existingBannerList[index] ?? imageUrl),
          newImageUrl: stripImageDomain(imageUrl),
        }));

      const mobileBannerImageUrlList: UpdateAdminBrandImagePayload[] =
        values.mobileBannerImageUrlList.map((imageUrl, index) => ({
          oldImageUrl: stripImageDomain(
            existingMobileBannerList[index] ?? imageUrl,
          ),
          newImageUrl: stripImageDomain(imageUrl),
        }));

      const sectionList: UpdateAdminBrandSectionPayload[] =
        values.sectionList.map((section, sectionIndex) => {
          const imageUrlList: UpdateAdminBrandImagePayload[] =
            section.imageUrlList.map((imageUrl, imageIndex) => ({
              oldImageUrl: stripImageDomain(
                existingSectionImageLists[sectionIndex]?.[imageIndex] ??
                  imageUrl,
              ),
              newImageUrl: stripImageDomain(imageUrl),
            }));

          const imageSortOrderList: UpdateAdminBrandSectionImageSortOrder[] =
            section.imageUrlList.map((imageUrl, imageIndex) => ({
              imageUrl: stripImageDomain(imageUrl),
              sortOrder: imageIndex + 1,
            }));

          return {
            id: sectionId,
            textList: section.textList,
            imageUrlList,
            imageSortOrderList,
          };
        });

      const sectionSortOrderList: UpdateAdminBrandSectionSortOrder[] =
        sectionList.map((section, sectionIndex) => ({
          sectionId: section.id,
          sortOrder: sectionIndex + 1,
        }));

      const payload: UpdateAdminBrandRequest = {
        textList: values.textList,
        categoryId: values.categoryId,
        profileImageUrl: stripImageDomain(values.profileImageUrl),
        sectionList,
        bannerImageUrlList,
        mobileBannerImageUrlList,
        productBannerImage: stripImageDomain(values.productBannerImageUrl),
        englishName: values.englishName,
        sectionSortOrderList,
      };

      mutate({ brandId: id, payload });
    },
  });

  const { setValues } = formik;

  useEffect(() => {
    if (!brandData) return;

    const {
      bannerList,
      mobileBannerList,
      multilingualTextList,
      categoryId,
      englishName,
      profileImage,
      productBannerImage,
    } = brandData.data;

    const textList = LANGUAGE_LIST.map((language) => {
      const text = multilingualTextList.find(
        (item) => item.languageId === language.id,
      );

      return {
        languageId: language.id,
        name: text?.name ?? "",
        description: text?.description ?? "",
      };
    });

    const sectionCount = multilingualTextList.reduce(
      (max, text) => Math.max(max, text.section?.length ?? 0),
      0,
    );

    const sectionList =
      sectionCount > 0
        ? Array.from({ length: sectionCount }, (_, sectionIndex) => {
            const baseSection = createEmptySection();
            const sectionForImages = multilingualTextList.find(
              (text) => text.section?.[sectionIndex]?.imageList.length,
            );
            const imageUrlList =
              sectionForImages?.section?.[sectionIndex]?.imageList ??
              multilingualTextList[0]?.section?.[sectionIndex]?.imageList ??
              [];

            const sectionTextList = LANGUAGE_LIST.map((language) => {
              const section = multilingualTextList.find(
                (text) => text.languageId === language.id,
              )?.section?.[sectionIndex];

              return {
                languageId: language.id,
                title: section?.title ?? "",
                content: section?.content ?? "",
              };
            });

            return {
              ...baseSection,
              imageUrlList,
              textList: sectionTextList,
            };
          })
        : [createEmptySection()];

    setValues((prev) => ({
      ...prev,
      textList,
      sectionList,
      englishName,
      categoryId,
      profileImageUrl: profileImage,
      productBannerImageUrl: productBannerImage,
      bannerImageUrlList: bannerList,
      mobileBannerImageUrlList: mobileBannerList,
    }));
  }, [brandData, setValues]);

  return (
    <form onSubmit={formik.handleSubmit}>
      <Tabs className="w-full" defaultValue="basic">
        <TabsList className="grid h-auto w-full grid-cols-3 rounded-lg bg-gray-100 p-1">
          <TabsTrigger
            className="border-b-transparent! rounded-lg border-b-0"
            value="basic"
          >
            기본 정보
          </TabsTrigger>
          <TabsTrigger
            className="border-b-transparent! rounded-lg border-b-0"
            value="banners"
          >
            배너 이미지
          </TabsTrigger>
          <TabsTrigger
            className="border-b-transparent! rounded-lg border-b-0"
            value="sections"
          >
            브랜드 섹션
          </TabsTrigger>
        </TabsList>
        <TabsContent className="mt-6 space-y-6" value="basic">
          <BasicInfo formik={formik} />
        </TabsContent>
        <TabsContent className="mt-6 space-y-6" value="banners">
          <BannerImages
            bannerError={formik.errors.bannerImageUrlList as string | undefined}
            bannerImageUrlList={formik.values.bannerImageUrlList}
            mobileBannerError={
              formik.errors.mobileBannerImageUrlList as string | undefined
            }
            mobileBannerImageUrlList={formik.values.mobileBannerImageUrlList}
            setBannerImageUrlList={(urls) => {
              formik.setFieldValue("bannerImageUrlList", urls);
            }}
            setMobileBannerImageUrlList={(urls) =>
              formik.setFieldValue("mobileBannerImageUrlList", urls)
            }
          />
        </TabsContent>
        <TabsContent className="mt-6 space-y-6" value="sections">
          <BrandSections formik={formik} />
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex gap-3">
        <Button
          className="flex-1"
          disabled={formik.isSubmitting || isPending}
          type="submit"
        >
          등록하기
        </Button>
        <Button
          className="flex-1"
          onClick={() => navigate(PATH.BRAND)}
          type="button"
          variant="outline"
        >
          취소
        </Button>
      </div>
    </form>
  );
}
