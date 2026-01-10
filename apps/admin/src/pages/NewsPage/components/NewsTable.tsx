import { Link } from "react-router";

import { Edit, Trash2 } from "lucide-react";

import type { AdminNewsListItem, AdminNewsId } from "@shared/services/news";

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

interface NewsTableProps {
  newsList: AdminNewsListItem[];
  isLoading: boolean;
  isDeleting: boolean;
  hasSearchQuery: boolean;
  onDelete(newsId: AdminNewsId): void;
}

const getNewsTextByLanguage = (item: AdminNewsListItem, languageCode: string) =>
  item.textDto.find((text) => text.languageCode === languageCode);

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleString("ko-KR") : "-";

export function NewsTable({
  newsList,
  isLoading,
  isDeleting,
  hasSearchQuery,
  onDelete,
}: NewsTableProps) {
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
          <TableHead className="w-24">액션</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {newsList.length === 0 ? (
          <TableRow>
            <TableCell className="py-12 text-center text-gray-500" colSpan={6}>
              {hasSearchQuery
                ? "검색 결과가 없습니다."
                : "등록된 뉴스가 없습니다."}
            </TableCell>
          </TableRow>
        ) : (
          newsList.map((news) => {
            const koreanText =
              getNewsTextByLanguage(news, "ko") ?? news.textDto[0];

            return (
              <TableRow key={news.id}>
                <TableCell>{news.id}</TableCell>
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
                  {formatDate(news.createDate)}
                </TableCell>
                <TableCell>
                  <HStack gap={8}>
                    <Link
                      className="flex items-center justify-center"
                      to={`/news/edit/${news.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <Button
                      disabled={isDeleting}
                      onClick={() => onDelete(news.id)}
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
