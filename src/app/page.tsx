import { Button } from "@/shared/ui/button";

export default function Home() {
  return (
    <div className="flex items-center justify-center">
      <Button>기본 버튼</Button>
      <Button variant="outline">아웃라인</Button>
      <Button size="sm" variant="ghost">
        고스트
      </Button>
      <Button isLoading variant="destructive">
        삭제 중...
      </Button>
      <Button>
        <a href="/link">링크 버튼</a>
      </Button>
    </div>
  );
}
