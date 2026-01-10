import { useNavigate } from "react-router";

import { ArrowLeft } from "lucide-react";

import { PATH } from "@shared/constants/route";

import { Button } from "@seoul-moment/ui";

import { ArticleAddHeader, ArticleForm } from "./components";

export default function ArticleAddPage() {
  const navigate = useNavigate();

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

        <ArticleAddHeader />
        <ArticleForm />
      </div>
    </div>
  );
}
