import { FileText } from "lucide-react";

export function NewsAddHeader() {
  return (
    <div className="mb-8 flex items-start gap-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
        <FileText className="h-5 w-5 text-blue-600" />
      </div>
      <div>
        <h2 className="mb-1 text-lg font-semibold">뉴스 추가</h2>
        <p className="text-sm text-gray-600">
          새로운 뉴스를 등록합니다. 한국어 정보는 필수입니다.
        </p>
      </div>
    </div>
  );
}
