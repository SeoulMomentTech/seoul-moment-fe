import type { CreateAdminNewsRequest } from "@shared/services/news";

export type NewsFormValues = CreateAdminNewsRequest;

export type NewsFormErrors = Record<string, string | undefined>;
