import type { CreateAdminArticleRequest } from "@shared/services/article";

export type ArticleFormValues = CreateAdminArticleRequest;

export type ArticleFormErrors = Record<string, string | undefined>;
