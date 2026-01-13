import { Plus, SquarePen, Trash2 } from "lucide-react";

import type {
  ProductOptionId,
  ProductOptionValueId,
} from "@shared/services/productOption";

import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@seoul-moment/ui";

import { useDeleteAdminProductOptionValueMutation } from "../hooks";

export interface LanguageOption {
  id: number;
  label: string;
}

export interface OptionValueForm {
  id: ProductOptionValueId | null;
  text: { languageId: number; value: string }[];
  colorCode: string | null;
}

interface OptionValueTableProps {
  title?: string;
  description?: string;
  optionId: number;
  languages: LanguageOption[];
  values: OptionValueForm[];
  isPending?: boolean;
  onAdd(): void;
  onEdit(index: number): void;
  onRemove(index: number): void;
}

export function OptionValueTable({
  title = "옵션 값 관리",
  description = "언어별 옵션 값을 추가·수정하세요.",
  optionId,
  languages,
  values,
  isPending = false,
  onAdd,
  onEdit,
  onRemove,
}: OptionValueTableProps) {
  const { mutateAsync: deleteOptionValue, isPending: isDeleting } =
    useDeleteAdminProductOptionValueMutation();

  const handleRemove = (valueIndex: number) => {
    if (!confirm("정말 이 옵션 값을 삭제하시겠습니까?")) {
      return;
    }

    const target = values[valueIndex];
    if (!target) return;

    if (target.id === null) {
      onRemove(valueIndex);
      return;
    }

    deleteOptionValue({
      optionValueId: target.id,
      optionId: optionId as ProductOptionId,
    })
      .then(() => onRemove(valueIndex))
      .catch((error) => {
        console.error("옵션 값 삭제 오류:", error);
        alert("옵션 값을 삭제하는 중 오류가 발생했습니다.");
      });
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <Button
          className="bg-gray-900 text-white hover:bg-gray-800"
          disabled={isPending}
          onClick={onAdd}
          type="button"
        >
          <Plus className="mr-2 h-4 w-4" />
          옵션 값 추가
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              {languages.map((lang) => (
                <TableHead key={lang.id}>{lang.label}</TableHead>
              ))}
              <TableHead className="w-[120px] text-center">액션</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {values.length === 0 ? (
              <TableRow>
                <TableCell
                  className="h-24 text-center text-gray-500"
                  colSpan={languages.length + 2}
                >
                  옵션 값을 추가해주세요.
                </TableCell>
              </TableRow>
            ) : (
              values.map((value, valueIndex) => (
                <TableRow key={value.id ?? `new-${valueIndex}`}>
                  <TableCell className="text-sm font-medium text-gray-700">
                    {value.id ?? "-"}
                  </TableCell>

                  {languages.map((lang) => {
                    const text = value.text.find(
                      (t) => t.languageId === lang.id,
                    );
                    const displayValue = text?.value ?? "";

                    return (
                      <TableCell className="align-middle" key={lang.id}>
                        <span
                          className={
                            displayValue ? "text-gray-900" : "text-gray-400"
                          }
                        >
                          {displayValue || "미입력"}
                        </span>
                      </TableCell>
                    );
                  })}

                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        disabled={isPending}
                        onClick={() => onEdit(valueIndex)}
                        type="button"
                        variant="ghost"
                      >
                        <SquarePen className="h-4 w-4" />
                      </Button>
                      <Button
                        disabled={isPending || isDeleting}
                        onClick={() => handleRemove(valueIndex)}
                        type="button"
                        variant="ghost"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
