import { DetailMain } from "@/widgets/detail";

const mockDetailMainData = {
  imageUrl:
    "https://images.unsplash.com/photo-1538329972958-465d6d2144ed?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3",
  category: "Korean Beauty & Fragrance",
  title: "CHWI",
  summary: "요약 내용입니다.",
  date: "2025.05.26",
  author: "작가명",
  avatarUrl: "",
};

export const NewsDetailMain = () => {
  return <DetailMain {...mockDetailMainData} />;
};
