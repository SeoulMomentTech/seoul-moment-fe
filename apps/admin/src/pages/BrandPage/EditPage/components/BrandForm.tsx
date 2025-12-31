import { useEffect } from "react";

import { useNavigate } from "react-router";

import { LANGUAGE_LIST } from "@shared/constants/locale";
import { PATH } from "@shared/constants/route";
import {
  type BrandId,
  type CreateAdminBrandRequest,
} from "@shared/services/brand";
import { useFormik } from "formik";

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
import {
  useUpdateAdminBrandMutation,
  useAdminBrandSuspenseQuery,
} from "../../hooks";
import {
  getEditFormPayload,
  createEmptySection,
  validateForm,
  getInitialValuesFromData,
} from "../../utils";

interface BrandFormProps {
  id: BrandId;
}

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
      const validationErrors = validateForm(values);
      return validationErrors;
    },
    onSubmit: (values) => {
      const payload = getEditFormPayload({ data: brandData.data, values });
      mutate({ brandId: id, payload });
    },
  });

  const { setValues } = formik;

  useEffect(() => {
    if (!brandData) return;

    const initialValues = getInitialValuesFromData(brandData.data);
    setValues(initialValues);
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
