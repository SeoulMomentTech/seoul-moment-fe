import { useMemo } from "react";

import { useNavigate, useParams } from "react-router";

import { ChevronLeft } from "lucide-react";

import { PATH } from "@shared/constants/route";
import type {
  GetAdminProductNameDto,
  PostAdminProductRequest,
} from "@shared/services/adminProduct";

import { Button } from "@seoul-moment/ui";

import { ProductMasterForm } from "./components";
import { useAdminProductDetailQuery } from "./hooks/useAdminProductDetailQuery";
import { useUpdateAdminProductMutation } from "./hooks/useUpdateAdminProductMutation";

export const ProductMasterEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const productId = Number(id);

  const { data: productData, isLoading } = useAdminProductDetailQuery(productId, {
    enabled: !!productId,
  });

  const { mutate: updateProduct } = useUpdateAdminProductMutation({
    onSuccess: () => {
      navigate(PATH.PRODUCT_MASTER);
    },
  });

  const initialValues: PostAdminProductRequest | undefined = useMemo(() => {
    if (!productData?.data) return undefined;

    const { brandId, categoryId, productCategoryId, detailInfoImageUrl, nameDto } =
      productData.data;

    // Helper to find name/origin by language code
    // Assuming mapping: ko -> 1, en -> 2, zh-TW -> 3
    const findText = (code: string) =>
      nameDto.find((n) => n.languageCode === code) as
      | (GetAdminProductNameDto & { origin?: string })
      | undefined;

    const text = [
      {
        languageId: 1,
        name: findText("ko")?.name || "",
        origin: findText("ko")?.origin || "",
      },
      {
        languageId: 2,
        name: findText("en")?.name || "",
        origin: findText("en")?.origin || "",
      },
      {
        languageId: 3,
        name: findText("zh-TW")?.name || "",
        origin: findText("zh-TW")?.origin || "",
      },
    ];

    return {
      brandId,
      categoryId,
      productCategoryId,
      detailInfoImageUrl,
      text,
    };
  }, [productData]);

  const handleSubmit = (values: PostAdminProductRequest) => {
    updateProduct({
      id: productId,
      payload: {
        brandId: values.brandId,
        categoryId: values.categoryId,
        productCategoryId: values.productCategoryId,
        detailInfoImageUrl: values.detailInfoImageUrl,
        text: values.text,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
      </div>
    );
  }

  if (!productData?.data) {
    return <div>Product not found</div>;
  }

  return (
    <div className="p-8 pt-24">
      <div className="mb-6">
        <Button
          className="mb-4 pl-0 hover:bg-transparent"
          onClick={() => navigate(PATH.PRODUCT_MASTER)}
          variant="ghost"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          목록으로
        </Button>
        <h1 className="text-2xl font-bold">상품 대주제 수정</h1>
        <p className="mt-1 text-gray-600">등록된 상품 대주제를 수정하세요.</p>
      </div>

      <ProductMasterForm
        initialValues={initialValues}
        isEdit
        onSubmit={handleSubmit}
      />
    </div>
  );
};
