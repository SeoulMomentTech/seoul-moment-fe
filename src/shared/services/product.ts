import type { PublicLanguageCode } from ".";
import { api } from ".";

export const getProductBanner = () => api.get("product/banner").json();

interface GetProductCategoryReq extends PublicLanguageCode {
  categoryId: number;
}

export const getProductCategory = ({
  categoryId,
  languageCode,
}: GetProductCategoryReq) =>
  api
    .get("product/category", {
      searchParams: {
        categoryId,
        languageCode,
      },
    })
    .json();

interface GetProductListReq extends PublicLanguageCode {
  page: number;
  count: number;
  search?: string;
  brandId?: number;
  categoryId?: number;
  productCategoryId?: number;
  sortColumn?: string; // creatDate, price
  sort?: string; // ASC, DESC
}

export const getProductList = (req: GetProductListReq) =>
  api
    .get("product", {
      searchParams: {
        ...req,
      },
    })
    .json();

interface GetProductDetailReq extends PublicLanguageCode {
  id: number;
}

export const getProductDetail = ({ id, languageCode }: GetProductDetailReq) =>
  api
    .get(`product`, {
      searchParams: {
        id,
        languageCode,
      },
    })
    .json();
