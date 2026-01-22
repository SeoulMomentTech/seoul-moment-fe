import { useNavigate } from "react-router";

import { ArrowLeft } from "lucide-react";

import { PATH } from "@shared/constants/route";


import { Button } from "@seoul-moment/ui";

import ProductAddForm from "./components/ProductAddForm";

export default function ProductAddPage() {
  const navigate = useNavigate();
  return (
    <div className="p-8 pt-24">
      <div className="mx-auto max-w-5xl">
        <Button
          className="-ml-2 mb-6"
          onClick={() => navigate(PATH.PRODUCTS)}
          variant="ghost"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          목록으로 돌아가기
        </Button>

        <div className="mb-6">
          <h2 className="mb-2">상품 아이템 추가</h2>
          <p className="text-gray-600">
            상품 아이템의 기본 정보와 옵션을 입력하세요.
          </p>
        </div>
        <ProductAddForm />
      </div>
    </div>
  );
}
