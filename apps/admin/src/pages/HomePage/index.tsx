import { Button } from "@seoul-moment/ui";

export default function HomePage() {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Admin Home</h1>
      <Button variant="outline">공용 UI 버튼</Button>
    </div>
  );
}
