import { useNavigate } from "react-router";

import { ChevronLeft } from "lucide-react";

import { PATH } from "@shared/constants/route";
import type { PostAdminProductRequest } from "@shared/services/adminProduct";

import { Button } from "@seoul-moment/ui";

import { ProductMasterForm } from "./components";
import { useCreateAdminProductMutation } from "./hooks/useCreateAdminProductMutation";

export const ProductMasterAddPage = () => {
  const navigate = useNavigate();
  const { mutate: createProduct } = useCreateAdminProductMutation({
    onSuccess: () => {
      navigate(PATH.PRODUCT_MASTER);
    },
  });

  const handleSubmit = (values: PostAdminProductRequest) => {
    createProduct(values);
  };

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
        <h1 className="text-2xl font-bold">상품 대주제 추가</h1>
        <p className="mt-1 text-gray-600">새로운 상품 대주제를 등록하세요.</p>
      </div>

      <ProductMasterForm onSubmit={handleSubmit} />
    </div>
  );
};
