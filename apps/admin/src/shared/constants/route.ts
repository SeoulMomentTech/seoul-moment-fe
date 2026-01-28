export const PATH = {
  INDEX: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  // Product
  PRODUCTS: "/products",
  PRODUCT_ADD: "/products/add",
  PRODUCT_EDIT: "/products/edit/:id",
  PRODUCT_CATEGORIES: "/products/categories",
  PRODUCT_SUB_CATEGORIES: "/products/sub-categories",
  PRODUCT_MASTER: "/products/master",
  PRODUCT_MASTER_ADD: "/products/master/add",
  PRODUCT_MASTER_EDIT: "/products/master/edit/:id",
  PRODUCT_LIST: "/products/list",
  PRODUCT_OPTIONS: "/products/options",
  PRODUCT_OPTIONS_ADD: "/products/options/add",
  PRODUCT_OPTIONS_EDIT: "/products/options/edit/:id",
  // Order
  ORDERS: "/orders",

  // Banner
  HOME_BANNER: "/banner/home",
  PRODUCT_BANNER: "/banner/product",

  // News
  NEWS: "/news",
  NEWS_ADD: "/news/add",
  NEWS_EDIT: "/news/edit/:id",

  // Article
  ARTICLE: "/article",
  ARTICLE_ADD: "/article/add",
  ARTICLE_EDIT: "/article/edit/:id",

  // Brand
  BRAND: "/brand",
  BRAND_ADD: "/brand/add",
  BRAND_EDIT: "/brand/edit/:id",

  // User
  USERS: "/users",
} as const;
