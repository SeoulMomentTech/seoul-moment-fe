import { useState } from "react";

import { Search, Edit, Trash2 } from "lucide-react";

import { ImageWithFallback } from "@shared/components/image-with-fallback";

import {
  Badge,
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@seoul-moment/ui";

interface BrandText {
  languageId: number;
  name: string;
  description: string;
}

interface SectionText {
  languageId: number;
  title: string;
  content: string;
}

interface BrandSection {
  textList: SectionText[];
  imageUrlList: string[];
}

interface Brand {
  id: string;
  englishName: string;
  categoryId: number;
  profileImageUrl: string;
  textList: BrandText[];
  sectionList: BrandSection[];
  bannerImageUrlList: string[];
  mobileBannerImageUrlList: string[];
  bannerImageUrl: string;
  createdAt: string;
}

const CATEGORIES = [
  { id: 1, name: "패션" },
  { id: 2, name: "뷰티" },
  { id: 3, name: "라이프스타일" },
  { id: 4, name: "전자제품" },
  { id: 5, name: "식품" },
];

export function BrandsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const [brands, setBrands] = useState<Brand[]>([
    {
      id: "1",
      englishName: "Seoul Moment",
      categoryId: 3,
      profileImageUrl:
        "https://images.unsplash.com/photo-1621768216002-5ac171876625?w=100&h=100&fit=crop",
      textList: [
        {
          languageId: 1,
          name: "서울모먼트",
          description: "서울의 특별한 순간들을 담은 라이프스타일 브랜드입니다.",
        },
        {
          languageId: 2,
          name: "Seoul Moment",
          description:
            "A lifestyle brand that captures special moments in Seoul.",
        },
        {
          languageId: 3,
          name: "首爾時刻",
          description: "捕捉首爾特殊時刻的生活方式品牌。",
        },
      ],
      sectionList: [
        {
          textList: [
            {
              languageId: 1,
              title: "브랜드 스토리",
              content:
                "서울모먼트는 2020년 설립된 라이프스타일 브랜드로, 서울의 특별한 순간들을 제품에 담아내고 있습니다.",
            },
            {
              languageId: 2,
              title: "Brand Story",
              content:
                "Seoul Moment is a lifestyle brand established in 2020, capturing special moments in Seoul through our products.",
            },
            {
              languageId: 3,
              title: "品牌故事",
              content:
                "首爾時刻是2020年成立的生活方式品牌，透過產品捕捉首爾的特殊時刻。",
            },
          ],
          imageUrlList: [
            "https://images.unsplash.com/photo-1621768216002-5ac171876625?w=400&h=300&fit=crop",
          ],
        },
      ],
      bannerImageUrlList: [
        "https://images.unsplash.com/photo-1621768216002-5ac171876625?w=1200&h=400&fit=crop",
      ],
      mobileBannerImageUrlList: [
        "https://images.unsplash.com/photo-1621768216002-5ac171876625?w=800&h=600&fit=crop",
      ],
      bannerImageUrl:
        "https://images.unsplash.com/photo-1621768216002-5ac171876625?w=1200&h=400&fit=crop",
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      englishName: "Apple",
      categoryId: 4,
      profileImageUrl:
        "https://images.unsplash.com/photo-1610792516307-ea5acd9c3b00?w=100&h=100&fit=crop",
      textList: [
        {
          languageId: 1,
          name: "애플",
          description: "혁신적인 기술 제품을 만드는 글로벌 브랜드",
        },
        {
          languageId: 2,
          name: "Apple",
          description: "A global brand creating innovative technology products",
        },
        {
          languageId: 3,
          name: "蘋果",
          description: "創造創新技術產品的全球品牌",
        },
      ],
      sectionList: [
        {
          textList: [
            {
              languageId: 1,
              title: "혁신",
              content: "애플은 기술 혁신을 통해 세상을 변화시킵니다.",
            },
            {
              languageId: 2,
              title: "Innovation",
              content:
                "Apple changes the world through technological innovation.",
            },
            {
              languageId: 3,
              title: "創新",
              content: "蘋果通過技術創新改變世界。",
            },
          ],
          imageUrlList: [
            "https://images.unsplash.com/photo-1610792516307-ea5acd9c3b00?w=400&h=300&fit=crop",
          ],
        },
      ],
      bannerImageUrlList: [
        "https://images.unsplash.com/photo-1610792516307-ea5acd9c3b00?w=1200&h=400&fit=crop",
      ],
      mobileBannerImageUrlList: [
        "https://images.unsplash.com/photo-1610792516307-ea5acd9c3b00?w=800&h=600&fit=crop",
      ],
      bannerImageUrl:
        "https://images.unsplash.com/photo-1610792516307-ea5acd9c3b00?w=1200&h=400&fit=crop",
      createdAt: "2024-01-20",
    },
    {
      id: "3",
      englishName: "Samsung",
      categoryId: 4,
      profileImageUrl:
        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=100&h=100&fit=crop",
      textList: [
        {
          languageId: 1,
          name: "삼성",
          description: "전자제품 및 반도체 분야의 리더",
        },
        {
          languageId: 2,
          name: "Samsung",
          description: "Leader in electronics and semiconductor industry",
        },
        {
          languageId: 3,
          name: "三星",
          description: "電子產品和半導體領域的領導者",
        },
      ],
      sectionList: [
        {
          textList: [
            {
              languageId: 1,
              title: "기술",
              content: "삼성은 최첨단 기술로 미래를 선도합니다.",
            },
            {
              languageId: 2,
              title: "Technology",
              content: "Samsung leads the future with cutting-edge technology.",
            },
            {
              languageId: 3,
              title: "技術",
              content: "三星以尖端技術引領未來。",
            },
          ],
          imageUrlList: [
            "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=300&fit=crop",
          ],
        },
      ],
      bannerImageUrlList: [
        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=1200&h=400&fit=crop",
      ],
      mobileBannerImageUrlList: [
        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&h=600&fit=crop",
      ],
      bannerImageUrl:
        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=1200&h=400&fit=crop",
      createdAt: "2024-02-01",
    },
  ]);

  const getKoreanName = (brand: Brand) => {
    return (
      brand.textList.find((t) => t.languageId === 1)?.name || brand.englishName
    );
  };

  const getKoreanDescription = (brand: Brand) => {
    return brand.textList.find((t) => t.languageId === 1)?.description || "";
  };

  const getCategoryName = (categoryId: number) => {
    return CATEGORIES.find((c) => c.id === categoryId)?.name || "";
  };

  const filteredBrands = brands.filter((brand) => {
    const koreanName = getKoreanName(brand);
    const koreanDescription = getKoreanDescription(brand);
    const query = searchQuery.toLowerCase();

    return (
      koreanName.toLowerCase().includes(query) ||
      brand.englishName.toLowerCase().includes(query) ||
      koreanDescription.toLowerCase().includes(query)
    );
  });

  const handleDelete = (id: string) => {
    if (confirm("정말로 이 브랜드를 삭제하시겠습니까?")) {
      setBrands(brands.filter((brand) => brand.id !== id));
    }
  };

  return (
    <div className="p-8 pt-24">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="mb-2">브랜드 관리</h2>
          <p className="text-gray-600">브랜드를 등록하고 관리할 수 있습니다.</p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              className="h-[40px] rounded-md bg-white pl-10"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="브랜드명으로 검색..."
              value={searchQuery}
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>프로필</TableHead>
              <TableHead>브랜드명</TableHead>
              <TableHead>영어 이름</TableHead>
              <TableHead>카테고리</TableHead>
              <TableHead>설명</TableHead>
              <TableHead>등록일</TableHead>
              <TableHead className="text-right">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBrands.length === 0 ? (
              <TableRow>
                <TableCell
                  className="py-8 text-center text-gray-500"
                  colSpan={7}
                >
                  브랜드가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              filteredBrands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell>
                    <ImageWithFallback
                      alt={getKoreanName(brand)}
                      className="h-10 w-10 rounded object-cover"
                      src={brand.profileImageUrl}
                    />
                  </TableCell>
                  <TableCell>{getKoreanName(brand)}</TableCell>
                  <TableCell className="text-gray-600">
                    {brand.englishName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {getCategoryName(brand.categoryId)}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-gray-600">
                    {getKoreanDescription(brand)}
                  </TableCell>
                  <TableCell>{brand.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(brand.id)}
                        size="sm"
                        variant="ghost"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between border-t border-gray-200 p-4 text-sm text-gray-600">
          <span>전체 {filteredBrands.length}개</span>
        </div>
      </div>
    </div>
  );
}
