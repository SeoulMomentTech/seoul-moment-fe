import { Navigate, useNavigate, useParams } from "react-router";

import { ArrowLeft } from "lucide-react";

import { PATH } from "@shared/constants/route";
import type { BrandId } from "@shared/services/brand";

import { Button } from "@seoul-moment/ui";

import BrandForm from "./components/BrandForm";

export function BrandEditPage() {
  const navigate = useNavigate();
  const params = useParams();
  const id = Number(params.id);

  if (!Number.isInteger(id)) {
    return <Navigate replace to="/brand" />;
  }

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
        <BrandForm id={id as BrandId} />
      </div>
    </div>
  );
}
