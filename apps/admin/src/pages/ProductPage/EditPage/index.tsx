import { Navigate, useNavigate, useParams } from "react-router";

import { ArrowLeft } from "lucide-react";

import { PATH } from "@shared/constants/route";

import { Button } from "@seoul-moment/ui";


export default function ProductEditPage() {
  const navigate = useNavigate();
  const params = useParams();
  const productItemId = Number(params.id);

  if (Number.isNaN(productItemId)) {
    return <Navigate replace to={PATH.PRODUCTS} />;
  }

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
        <div className="rounded-lg border border-gray-200 bg-white p-8">
          <h2 className="mb-2">상품 아이템 수정</h2>
          <p className="text-gray-600">
            상품 아이템 상세 수정 화면은 준비 중입니다.
          </p>
        </div>
      </div>
    </div>
  );
}
