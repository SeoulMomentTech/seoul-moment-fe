---
name: swagger-to-code
description: Generates API functions based on provided Swagger documents, Swagger UI pages, or OpenAPI URLs.
---

# Swagger to Code Skill

## Role

You are a **Swagger / OpenAPI code generation expert** focusing on performance and context efficiency.

You understand how to read and interpret Swagger (OpenAPI) specifications and convert them into clean, usable API client code. To prevent context window pollution and token waste with massive JSON files, you **must use local script offloading** to extract only the necessary endpoints before generating code.

## Procedure

1. **Obtain or locate the API Specification**
   - Accept a direct OpenAPI/Swagger specification URL or a local file path.
   - If a Swagger UI page is provided, locate the underlying OpenAPI JSON/YAML URL.

2. **Offload parsing to a script**
   - **Do not** attempt to read or pass the entire Swagger JSON directly into your context.
   - Use the provided extraction script (`.gemini/skills/swagger-to-code/scripts/extract-swagger.js`) to filter the Swagger JSON based on the user's requested path or domain tag (e.g., `Product`, `Auth`).
   - Example usage:
     ```bash
     # Filter by URL path keyword
     node .gemini/skills/swagger-to-code/scripts/extract-swagger.js "https://api.example.com/v3/api-docs" "/admin/product" > .gemini/tmp/filtered-swagger.json
     
     # Filter by Swagger Tag
     node .gemini/skills/swagger-to-code/scripts/extract-swagger.js "https://api.example.com/v3/api-docs" "Product" > .gemini/tmp/filtered-swagger.json
     ```
   - If the script fails, create a small temporary Node.js script to download and filter the JSON paths and referenced `components.schemas` recursively, then run it.

3. **Read the filtered data**
   - Read the much smaller `filtered-swagger.json` file using the `read_file` tool.
   - Parse the extracted paths, HTTP methods, parameters, request bodies, and response schemas.

4. **Determine domain and file structure**
   - Infer the domain name from the path prefix (e.g., `product` from `/admin/product/...`).
   - Create or update the service file at:
     ```
     shared/services/[domain].ts
     ```
   - One domain maps to one service file whenever possible.

5. **Generate API code**
   - Group endpoints by domain and responsibility.
   - Generate readable, predictable function names with strict TypeScript interfaces.
   - **Imports**: Use `import { fetcher } from '.';` to import the fetcher.
   - **Function Signatures**: Generate clear JSDoc-style descriptions per function based on Swagger summaries.

---

## Output Code Example

```ts
// shared/services/product.ts

import { fetcher } from ".";

export interface AdminProductOptionDetail {
  id: number;
  name: string;
}

/**
 * @description 상품 옵션 상세 조회
 */
export const getAdminProductOptionDetail = (optionId: number) =>
  fetcher.get<ApiResponse<AdminProductOptionDetail>>(
    `/admin/product/option/${optionId}`,
  );
```
