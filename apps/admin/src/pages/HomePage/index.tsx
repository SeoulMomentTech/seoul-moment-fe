import { VStack } from "@seoul-moment/ui";

export default function HomePage() {
  return (
    <VStack
      align="center"
      className="bg-background text-foreground min-h-screen"
      gap={16}
    >
      <h1 className="text-2xl font-semibold">Admin Home</h1>
    </VStack>
  );
}
