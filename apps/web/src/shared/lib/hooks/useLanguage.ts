"use client";

import { useParams } from "next/navigation";

import type { LanguageType } from "@/i18n/const";

const useLanguage = () => {
  const params = useParams();
  const lang = params.locale as LanguageType;

  return lang ?? "ko";
};

export default useLanguage;
