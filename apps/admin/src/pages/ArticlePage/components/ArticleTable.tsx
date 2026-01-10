import { Link } from "react-router";

import { Edit, Trash2 } from "lucide-react";

import type {
  AdminArticleId,
  AdminArticleListItem,
} from "@shared/services/article";

import {
  Button,
  HStack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  VStack,
} from "@seoul-moment/ui";

interface ArticleTableProps {
  articleList: AdminArticleListItem[];
  isLoading: boolean;
  isDeleting: boolean;
  hasSearchQuery: boolean;
  onDelete(articleId: AdminArticleId): void;
}

const getArticleTextByLanguage = (
  item: AdminArticleListItem,
  languageCode: string,
) => item.textDto.find((text) => text.languageCode === languageCode);

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleString("ko-KR") : "-";

export function ArticleTable({
  articleList,
  isLoading,
  isDeleting,
  hasSearchQuery,
  onDelete,
}: ArticleTableProps) {
  if (isLoading) {
    return (
      <VStack align="center" className="p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
      </VStack>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-14">ID</TableHead>
          <TableHead>제목</TableHead>
          <TableHead>내용</TableHead>
          <TableHead className="w-48">등록일</TableHead>
          <TableHead className="w-48">수정일</TableHead>
          <TableHead className="w-24">액션</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {articleList.length === 0 ? (
          <TableRow>
            <TableCell className="py-12 text-center text-gray-500" colSpan={6}>
              {hasSearchQuery
                ? "검색 결과가 없습니다."
                : "등록된 아티클이 없습니다."}
            </TableCell>
          </TableRow>
        ) : (
          articleList.map((article) => {
            const koreanText =
              getArticleTextByLanguage(article, "ko") ?? article.textDto[0];

            return (
              <TableRow key={article.id}>
                <TableCell>{article.id}</TableCell>
                <TableCell>
                  <p className="max-w-[320px] truncate font-medium text-gray-900">
                    {koreanText?.title ?? "-"}
                  </p>
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  <p className="max-w-[420px] truncate">
                    {koreanText?.content ?? "-"}
                  </p>
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {formatDate(article.createDate)}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {formatDate(article.updateDate)}
                </TableCell>
                <TableCell>
                  <HStack gap={8}>
                    <Link
                      className="flex items-center justify-center"
                      to={`/article/edit/${article.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <Button
                      disabled={isDeleting}
                      onClick={() => onDelete(article.id)}
                      size="sm"
                      variant="ghost"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </HStack>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
