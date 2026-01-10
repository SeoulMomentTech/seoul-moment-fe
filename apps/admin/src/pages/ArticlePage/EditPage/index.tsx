import { Navigate, useNavigate, useParams } from "react-router";

import { ArrowLeft } from "lucide-react";

import { PATH } from "@shared/constants/route";
import type { AdminArticleId } from "@shared/services/article";

import { Button } from "@seoul-moment/ui";

import { ArticleEditForm, ArticleEditHeader } from "./components";

export default function ArticleEditPage() {
  const navigate = useNavigate();
  const params = useParams();
  const id = Number(params.id);

  if (!Number.isInteger(id)) {
    return <Navigate replace to={PATH.ARTICLE} />;
  }

  return (
    <div className="p-8 pt-24">
      <div className="mx-auto max-w-4xl">
        <Button
          className="-ml-2 mb-6"
          onClick={() => navigate(PATH.ARTICLE)}
          variant="ghost"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          목록으로 돌아가기
        </Button>

        <ArticleEditHeader />
        <ArticleEditForm articleId={id as AdminArticleId} />
      </div>
    </div>
  );
}
