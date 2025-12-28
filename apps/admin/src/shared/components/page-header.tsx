import type React from "react";

import { HStack } from "@seoul-moment/ui";

interface PageHeaderProps {
  right?: React.ReactNode;
}

export function PageHeader({ right }: PageHeaderProps) {
  return (
    <HStack align="between" className="mb-8">
      <div>
        <h1 className="mb-2">카테고리 관리</h1>
        <p className="text-gray-600">상품 카테고리를 관리하세요.</p>
      </div>
      {right}
    </HStack>
  );
}
