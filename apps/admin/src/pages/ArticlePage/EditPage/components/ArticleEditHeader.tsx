import { FileText } from "lucide-react";

export function ArticleEditHeader() {
  return (
    <div className="mb-8 flex items-start gap-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
        <FileText className="h-5 w-5 text-blue-600" />
      </div>
      <div>
        <h2 className="mb-1 text-lg font-semibold">아티클 수정</h2>
        <p className="text-sm text-gray-600">
          등록된 아티클 정보를 수정합니다.
        </p>
      </div>
    </div>
  );
}
