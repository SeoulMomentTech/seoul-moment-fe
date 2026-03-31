# API Layer Patterns

## Web App — ky HTTP Client

**Location**: `apps/web/src/shared/services/`

### Setup (`index.ts`)

```typescript
import ky from "ky";

export interface CommonRes<T> {
  result: boolean;
  data: T;
}

export interface PublicLanguageCode {
  languageCode: LanguageType; // "ko" | "en" | "zh-TW"
}

export const api = ky.create({
  prefixUrl: "https://api.seoulmoment.com.tw",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
  hooks: {
    beforeRequest: [beforeRequestHandler],  // languageCode param → Accept-Language header
    beforeError: [beforeErrorHandler],       // 500+ errors → Sentry
  },
});
```

### Service File Pattern

Each service file exports typed arrow functions:

```typescript
// product.ts
interface GetProductListReq extends PublicLanguageCode {
  page: number;
  count: number;
  search?: string;
}

interface GetProductListRes {
  total: number;
  list: Array<ProductItem>;
}

export const getProductList = (params: GetProductListReq) =>
  api.get("product", { searchParams: params }).json<CommonRes<GetProductListRes>>();

export const getProductDetail = ({ id, languageCode }: GetProductDetailReq) =>
  api.get(`product/${id}`, { searchParams: { languageCode } }).json<CommonRes<GetProductDetailRes>>();
```

Key conventions:
- Request interfaces extend `PublicLanguageCode` when i18n is needed
- Response wrapped in `CommonRes<T>`
- Chain `.json<CommonRes<T>>()` for typed parsing
- Interfaces defined in the same service file (not a separate types file)

### i18n in API Calls

The `languageCode` query param is **automatically converted** to an `Accept-Language` header by the `beforeRequest` hook and removed from the URL. Just pass it as a regular param.

### Error Handling

- 500+ HTTP errors are auto-reported to Sentry with request/response context
- Marked with `isReported` flag to prevent duplicate Sentry reports
- Query/Mutation cache-level error handlers also report to Sentry (in QueryClient setup)

### Query Hooks (Web)

**Location**: `apps/web/src/shared/lib/hooks/query/`

```typescript
import useAppQuery from "@shared/lib/hooks/query/useAppQuery";

// useAppQuery — extends useQuery with logOnError option
const { data } = useAppQuery({
  queryKey: ["product", id],
  queryFn: () => getProductDetail({ id, languageCode }),
  logOnError: true, // logs error via meta
});

// useAppMutation — extends useMutation with toastOnError option
const { mutate } = useAppMutation({
  mutationFn: postInquiry,
  toastOnError: "문의 전송에 실패했습니다",
});

// useAppInfiniteQuery — extends useInfiniteQuery with logOnError
```

---

## Admin App — Axios HTTP Client

**Location**: `apps/admin/src/shared/services/`

### Setup (`index.ts`)

```typescript
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_API_BASE_URL ?? "https://api.seoulmoment.com.tw",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: injects Bearer token from useAuthStore
// Response interceptor: 401 → refresh token → retry; 403 → logout
```

### Token Refresh Flow

1. On **401**: attempts refresh via `/admin/auth/one-time-token` endpoint using `refreshToken`
2. Uses **promise queue dedup** — concurrent 401s share a single refresh request
3. On success: updates `accessToken` in `useAuthStore`, retries original request
4. On second 401 (after retry): forces logout
5. On **403**: forces logout immediately

### Fetcher Object

```typescript
export const fetcher = {
  get: <T>(pathname: string, options?) => api.get<T>(pathname, options).then(res => res.data),
  post: <T>(pathname, data?, config?) => api.post<T>(pathname, data, config).then(res => res.data),
  put: <T>(pathname, data?, config?) => api.put<T>(pathname, data, config).then(res => res.data),
  patch: <T>(pathname, data?, config?) => api.patch<T>(pathname, data, config).then(res => res.data),
  delete: <T>(pathname, config?) => api.delete<T>(pathname, config).then(res => res.data),
};
```

### Response & Type Patterns

```typescript
// types.ts
export interface ApiResponse<T> {
  result: boolean;
  data: T;
}

export type SortDirection = "ASC" | "DESC";
```

**Branded types** for type-safe IDs:

```typescript
export type AdminArticleId = Branded<number, "AdminArticleId">;

export const getAdminArticleInfo = (articleId: AdminArticleId) =>
  fetcher.get<ApiResponse<AdminArticleDetail>>(`/admin/article/${articleId}`);
```

### Service File Pattern

```typescript
// article.ts
export interface AdminArticleListParams {
  page?: number;
  count?: number;
  search?: string;
  sort?: SortDirection;
  searchColumn?: "title";
}

export const getAdminArticleList = (params?: AdminArticleListParams) =>
  fetcher.get<ApiResponse<AdminArticleListData>>("/admin/article", { params });

export const createAdminArticle = (payload: CreateAdminArticleRequest) =>
  fetcher.post("/admin/article", payload);

export const deleteAdminArticle = (articleId: AdminArticleId) =>
  fetcher.delete(`/admin/article/${articleId}`);
```

### Query Hooks (Admin)

**Location**: `apps/admin/src/shared/hooks/`

```typescript
import { useAppQuery } from "@shared/hooks/useAppQuery";
import { useAppMutation } from "@shared/hooks/useAppMutation";

// useAppQuery — extends useQuery with toastOnError option
const { data } = useAppQuery({
  queryKey: ["admin", "article", params],
  queryFn: () => getAdminArticleList(params),
  toastOnError: true,              // shows default error toast
  // toastOnError: "Custom message" // shows custom message
});

// useAppMutation — same toastOnError pattern
const { mutate } = useAppMutation({
  mutationFn: (id: AdminArticleId) => deleteAdminArticle(id),
  toastOnError: "삭제에 실패했습니다",
});
```

---

## Comparison Summary

| Aspect           | Web (ky)                        | Admin (Axios)                      |
| ---------------- | ------------------------------- | ---------------------------------- |
| HTTP Client      | `ky` (fetch wrapper)            | `axios`                            |
| Base Instance    | `api` (ky.create)               | `fetcher` object (wraps axios)     |
| Response Type    | `CommonRes<T>`                  | `ApiResponse<T>`                   |
| Auth             | None (public API)               | Bearer token + refresh interceptor |
| Error Reporting  | Sentry (beforeError hook)       | Toast via query meta               |
| i18n             | `languageCode` param → header   | N/A (admin is not localized)       |
| ID Type Safety   | Plain `number`                  | `Branded<number, Tag>`             |
| Query Hook Extra | `logOnError: boolean`           | `toastOnError: boolean \| string`  |
