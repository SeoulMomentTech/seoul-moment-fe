import type React from "react";

import { HStack } from "@seoul-moment/ui";

interface PageHeaderProps {
  title: string;
  description: string;
  right?: React.ReactNode;
}

export function PageHeader({ title, description, right }: PageHeaderProps) {
  return (
    <HStack align="between" className="mb-8">
      <div>
        <h1 className="mb-2">{title}</h1>
        <p className="text-gray-600">{description}</p>
      </div>
      {right}
    </HStack>
  );
}
