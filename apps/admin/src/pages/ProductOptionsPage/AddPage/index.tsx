import { useNavigate } from "react-router";

import { ArrowLeft } from "lucide-react";

import { PATH } from "@/shared/constants/route";

import { Button } from "@seoul-moment/ui";

export default function ProductOptionAddPage() {
  const navigate = useNavigate();

  return (
    <div className="p-8 pt-24">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Button
            className="-ml-2 mb-4"
            onClick={() => navigate(PATH.PRODUCT_OPTIONS)}
            variant="ghost"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록으로
          </Button>
          <h2 className="mb-2">새 상품 옵션 추가</h2>
          <p className="text-gray-600">
            옵션 정보를 입력하세요. 옵션 등록 후 수정을 통해 옵션 값을 추가할 수
            있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
