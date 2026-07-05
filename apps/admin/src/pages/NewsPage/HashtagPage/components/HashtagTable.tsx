import { Edit, Trash2 } from "lucide-react";

import type {
  AdminNewsHashtag,
  AdminNewsHashtagId,
} from "@shared/services/news";

import {
  Button,
  Flex,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  VStack,
} from "@seoul-moment/ui";

import { getHashtagName } from "../utils";

interface HashtagTableProps {
  hashtags: AdminNewsHashtag[];
  isLoading: boolean;
  isDeleting: boolean;
  onEdit(hashtag: AdminNewsHashtag): void;
  onDelete(hashtagId: AdminNewsHashtagId): void;
}

export function HashtagTable({
  hashtags,
  isLoading,
  isDeleting,
  onEdit,
  onDelete,
}: HashtagTableProps) {
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
          <TableHead className="w-20">ID</TableHead>
          <TableHead>한국어</TableHead>
          <TableHead>영어</TableHead>
          <TableHead>중국어(번체)</TableHead>
          <TableHead className="w-24">액션</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {hashtags.length === 0 ? (
          <TableRow>
            <TableCell className="py-12 text-center text-gray-500" colSpan={5}>
              해시태그가 없습니다.
            </TableCell>
          </TableRow>
        ) : (
          hashtags.map((hashtag) => (
            <TableRow key={hashtag.id}>
              <TableCell>{hashtag.id}</TableCell>
              <TableCell>{getHashtagName(hashtag.nameList, "ko")}</TableCell>
              <TableCell>{getHashtagName(hashtag.nameList, "en")}</TableCell>
              <TableCell>
                {getHashtagName(hashtag.nameList, "zh-TW")}
              </TableCell>
              <TableCell>
                <Flex gap={8}>
                  <Button
                    aria-label="수정"
                    onClick={() => onEdit(hashtag)}
                    size="sm"
                    variant="ghost"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    aria-label="삭제"
                    disabled={isDeleting}
                    onClick={() => onDelete(hashtag.id)}
                    size="sm"
                    variant="ghost"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </Flex>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
