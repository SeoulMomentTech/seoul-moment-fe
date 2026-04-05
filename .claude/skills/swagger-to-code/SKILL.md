---
name: swagger-to-code
description: Generates API functions based on provided Swagger documents, Swagger UI pages, or OpenAPI URLs.
---

# Swagger to Code Skill

## Role

You are a **Swagger / OpenAPI code generation expert** focusing on performance and context efficiency.

You understand how to read and interpret Swagger (OpenAPI) specifications and convert them into clean, usable API client code. To prevent context window pollution and token waste with massive JSON files, you **must use local script offloading** to extract only the necessary endpoints before generating code.

> For full API layer conventions, see `.claude/references/api.md`.

## Procedure

### 1. Obtain or locate the API Specification

- Accept a direct OpenAPI/Swagger specification URL or a local file path.
- If a Swagger UI page is provided, locate the underlying OpenAPI JSON/YAML URL.

### 2. Offload parsing to a script

- **Do not** attempt to read or pass the entire Swagger JSON directly into your context.
- Use the provided extraction script (`.claude/skills/swagger-to-code/scripts/extract-swagger.js`) to filter the Swagger JSON based on the user's requested path or domain tag (e.g., `Product`, `Auth`).
- Example usage:

  ```bash
  # Filter by URL path keyword
  node .claude/skills/swagger-to-code/scripts/extract-swagger.js "https://api.seoulmoment.com.tw/docs-json" "/admin/product" > .claude/tmp/filtered-swagger.json

  # Filter by Swagger Tag
  node .claude/skills/swagger-to-code/scripts/extract-swagger.js "https://api.seoulmoment.com.tw/docs-json" "Product" > .claude/tmp/filtered-swagger.json
  ```

- If the script fails, create a small temporary Node.js script to download and filter the JSON paths and referenced `components.schemas` recursively, then run it.

### 3. Read the filtered data

- Read the much smaller `filtered-swagger.json` file.
- Parse the extracted paths, HTTP methods, parameters, request bodies, and response schemas.

### 4. Detect target app and read existing code

Determine which app the endpoints belong to:

| Endpoint path pattern | Target app | Service directory |
|-|-|-|
| `/admin/...` | **admin** (Vite + Axios) | `apps/admin/src/shared/services/` |
| No `/admin/` prefix | **web** (Next.js + ky) | `apps/web/src/shared/services/` |

**Before generating code**, read the existing service file for the domain (if it exists) to match established patterns and avoid style drift.

### 5. Determine domain and file structure

- Infer the domain name from the path prefix (e.g., `product` from `/admin/product/...`).
- Create or update the service file at: `shared/services/[domain].ts`
- One domain maps to one service file whenever possible.

### 6. Generate API code

- Group endpoints by domain and responsibility.
- Generate readable, predictable function names with strict TypeScript interfaces.
- Generate clear JSDoc `@description` per function based on Swagger summaries.
- Follow the conventions for the detected target app (see below).

### 7. Cleanup

- After code generation is complete, delete the temporary filtered JSON file:
  ```bash
  rm -f .claude/tmp/filtered-swagger.json
  ```

---

## Function Naming Convention

| HTTP Method | Pattern | Web example | Admin example |
|-|-|-|-|
| GET (list) | `get[Domain]List` | `getProductList` | `getAdminProductList` |
| GET (detail) | `get[Domain]Detail` | `getProductDetail` | `getAdminProductDetail` |
| GET (other) | `get[Domain][Noun]` | `getHome` | `getAdminHomeBanner` |
| POST | `create[Domain]` | `createInquiry` | `createAdminProduct` |
| PATCH/PUT | `update[Domain]` | — | `updateAdminProduct` |
| DELETE | `delete[Domain]` | — | `deleteAdminProduct` |

---

## Web App Conventions (ky)

**Imports:**
```ts
import type { CommonRes, PublicLanguageCode } from "./";
import { api } from "./";
```

**Key rules:**
- Response wrapper: `CommonRes<T>` (`{ result: boolean; data: T }`)
- i18n endpoints extend `PublicLanguageCode` — the `languageCode` param is auto-converted to `Accept-language` header by a ky `beforeRequest` hook
- HTTP calls use ky chained API: `api.get("path", { searchParams }).json<CommonRes<T>>()`
- **No leading `/`** in paths — ky `prefixUrl` handles the base URL
- Request/response interfaces are defined in the same service file

**Example:**
```ts
// apps/web/src/shared/services/home.ts

import type { CommonRes, PublicLanguageCode } from "./";
import { api } from "./";

export interface HomePromotion {
  promotionId: number;
  imageUrl: string;
  title: string;
  description: string;
}

export interface GetHomeRes {
  banner: Array<Record<"imageUrl" | "mobileImageUrl", string>>;
  promotion: Array<HomePromotion>;
}

/**
 * @description 홈 정보 조회 V1
 */
export const getHome = ({ languageCode }: PublicLanguageCode) =>
  api
    .get("home/v1", {
      searchParams: {
        languageCode,
      },
    })
    .json<CommonRes<GetHomeRes>>();
```

---

## Admin App Conventions (Axios)

**Imports:**
```ts
import { fetcher } from ".";
import type { ApiResponse } from "./types";
```

**Key rules:**
- Response wrapper: `ApiResponse<T>` (`{ result: boolean; data: T }`) — imported from `./types`
- Use `Branded<number, "Tag">` for type-safe entity IDs (e.g., `AdminProductId`)
- HTTP calls: `fetcher.get<ApiResponse<T>>("/admin/path", { params })`
- **Leading `/`** in paths — axios `baseURL` convention
- List responses typically use inline `{ total: number; list: T[] }` shape
- Optional list params: `page?`, `count?`, `search?`, `sort?: SortDirection`

**Example:**
```ts
// apps/admin/src/shared/services/products.ts

import { fetcher } from ".";
import type { ApiResponse, SortDirection } from "./types";

export type AdminProductId = Branded<number, "AdminProductId">;

export interface AdminProduct {
  id: AdminProductId;
  name: string;
  status: string;
}

export interface AdminProductListParams {
  page?: number;
  count?: number;
  search?: string;
  sort?: SortDirection;
}

/**
 * @description 상품 리스트 조회
 */
export const getAdminProductList = (params?: AdminProductListParams) =>
  fetcher.get<ApiResponse<{ total: number; list: AdminProduct[] }>>(
    "/admin/product",
    { params },
  );

/**
 * @description 상품 삭제
 */
export const deleteAdminProduct = (productId: AdminProductId) =>
  fetcher.delete(`/admin/product/${productId}`);
```
