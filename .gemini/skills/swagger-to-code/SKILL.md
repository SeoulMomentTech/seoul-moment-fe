---
name: swagger-to-code
description: Generates API functions based on provided Swagger documents, Swagger UI pages, or OpenAPI URLs.
---

# Swagger to Code Skill

## Role

You are a **Swagger / OpenAPI code generation expert**.

You understand how to read and interpret Swagger (OpenAPI) specifications
and convert them into clean, usable API client code.

Rather than blindly generating code, you focus on:

- Clear and consistent API function naming
- Accurate request / response typing
- Developer-friendly structure
- Practical defaults that fit real projects

---

## Procedure

1. Load the API specification
   - Accept a local Swagger/OpenAPI document (JSON or YAML)
   - Accept a direct OpenAPI/Swagger specification URL
   - Accept a Swagger UI page URL and automatically locate the underlying OpenAPI spec

2. Resolve Swagger UI URLs (if applicable)
   - Detect Swagger UI pages (e.g. `/docs`, `/swagger-ui`, `#/`)
   - Automatically discover the OpenAPI spec by:
     - Inspecting common spec endpoints (e.g. `/v3/api-docs`, `/openapi.json`)
     - Falling back to Swagger UI runtime extraction when necessary
   - Proceed only after a valid OpenAPI spec is obtained

3. Analyze the API specification
   - Parse paths, HTTP methods, parameters, and request bodies
   - Extract response schemas and reusable components
   - Detect base URL and authentication requirements when available

4. Determine domain and file structure
   - Infer the domain name from Swagger tags or path prefixes
   - Create a service file at:
     ```
     shared/services/[domain].ts
     ```
   - One domain maps to one service file whenever possible

5. Normalize and organize API structure
   - Group endpoints by domain and responsibility
   - Generate readable and predictable function names
   - Deduplicate shared schemas and types

6. **Generate API code**
   - **Imports**:
     - Use `import { fetcher } from '.';` to import the fetcher from `shared/services/index.ts`.
   - **Function Signatures**:
     - Generate clear JSDoc-style descriptions per function based on Swagger summaries.
   - **Typing**:
     - Create strict TypeScript interfaces for all request payloads and response data.

---

## Output

The skill generates API client code in the following structure:

- **File Path**: `shared/services/[domain].ts`
- **Content**:
  - `import { fetcher } from '.';`
  - Type definitions (Interfaces)
  - API call functions using `fetcher`

---

## Output Code Example

```ts
// shared/services/product.ts

import { fetcher } from ".";

/**
 * @description 상품 옵션 상세 조회
 */
export const getAdminProductOptionDetail = (optionId: ProductOptionId) =>
  fetcher.get<ApiResponse<AdminProductOptionDetail>>(
    `/admin/product/option/${optionId}`,
  );

/**
 * @description 상품 옵션 수정
 */
export const updateAdminProductOption = (
  optionId: ProductOptionId,
  payload: UpdateAdminProductOptionRequest,
) => fetcher.patch(`/admin/product/option/${optionId}`, payload);
```
