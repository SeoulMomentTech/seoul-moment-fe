import { useNavigate } from "react-router";

import { ArrowLeft } from "lucide-react";

import { LANGUAGE_LIST } from "@shared/constants/locale";
import { PATH } from "@shared/constants/route";
import { type CreateAdminBrandRequest } from "@shared/services/brand";
import { useFormik, type FormikErrors } from "formik";

import {
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@seoul-moment/ui";

import { BannerImages } from "./components/BannerImages";
import { BasicInfo } from "./components/BasicInfo";
import { BrandSections } from "./components/BrandSection";
import { useCreateAdminBrandMutation } from "./hooks";
import { createEmptySection } from "./utils/section";

const INITIAL_FORM_VALUES: CreateAdminBrandRequest = {
  englishName: "",
  categoryId: 1,
  profileImageUrl: "",
  bannerImageUrl: "",
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

export function BrandEditPage() {
  const navigate = useNavigate();
  const { mutateAsync: createBrand, isPending } = useCreateAdminBrandMutation({
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

      return validationErrors;
    },
    onSubmit: async (values) => {
      await createBrand({
        ...values,
        bannerImageUrlList:
          values.bannerImageUrlList.length > 0
            ? values.bannerImageUrlList
            : values.bannerImageUrl
              ? [values.bannerImageUrl]
              : [],
        mobileBannerImageUrlList:
          values.mobileBannerImageUrlList.length > 0
            ? values.mobileBannerImageUrlList
            : values.bannerImageUrl
              ? [values.bannerImageUrl]
              : [],
      });
    },
  });

  return (
    <div className="p-8 pt-24">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Button
            className="-ml-2 mb-4"
            onClick={() => navigate(PATH.BRAND)}
            variant="ghost"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록으로
          </Button>
          <h2 className="mb-2">브랜드 추가</h2>
          <p className="text-gray-600">새로운 브랜드를 등록합니다.</p>
        </div>

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
                bannerImageUrlList={formik.values.bannerImageUrlList}
                mobileBannerImageUrlList={
                  formik.values.mobileBannerImageUrlList
                }
                setBannerImageUrlList={(urls) =>
                  formik.setFieldValue("bannerImageUrlList", urls)
                }
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
              {"등록하기"}
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
      </div>
    </div>
  );
}
