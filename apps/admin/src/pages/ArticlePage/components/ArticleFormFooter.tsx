import { Button } from "@seoul-moment/ui";

interface ArticleFormFooterProps {
  isSubmitting: boolean;
  onCancel(): void;
}

export function ArticleFormFooter({
  isSubmitting,
  onCancel,
}: ArticleFormFooterProps) {
  return (
    <div className="mt-6 flex items-center justify-between rounded-lg border border-gray-200 bg-white px-6 py-4 shadow-sm">
      <p className="text-sm text-gray-500">
        <span className="text-red-500">*</span> 표시는 필수 입력 항목입니다.
      </p>
      <div className="flex gap-3">
        <Button onClick={onCancel} type="button" variant="outline">
          취소
        </Button>
        <Button disabled={isSubmitting} type="submit">
          저장하기
        </Button>
      </div>
    </div>
  );
}
