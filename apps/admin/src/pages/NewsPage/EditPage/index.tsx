import { Navigate, useNavigate, useParams } from "react-router";

import { ArrowLeft } from "lucide-react";

import { PATH } from "@shared/constants/route";
import type { AdminNewsId } from "@shared/services/news";

import { Button } from "@seoul-moment/ui";

import { NewsEditForm, NewsEditHeader } from "./components";

export default function NewsEditPage() {
  const navigate = useNavigate();
  const params = useParams();
  const id = Number(params.id);

  if (!Number.isInteger(id)) {
    return <Navigate replace to={PATH.NEWS} />;
  }

  return (
    <div className="p-8 pt-24">
      <div className="mx-auto max-w-4xl">
        <Button
          className="-ml-2 mb-6"
          onClick={() => navigate(PATH.NEWS)}
          variant="ghost"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          목록으로 돌아가기
        </Button>

        <NewsEditHeader />
        <NewsEditForm newsId={id as AdminNewsId} />
      </div>
    </div>
  );
}
