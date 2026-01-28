import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
  type RouteObject,
} from "react-router";

import ArticleAddPage from "@pages/ArticlePage/AddPage";
import ArticleEditPage from "@pages/ArticlePage/EditPage";
import { BrandAddPage } from "@pages/BrandPage/AddPage";
import { BrandEditPage } from "@pages/BrandPage/EditPage";
import { BrandListPage } from "@pages/BrandPage/ListPage";
import NewsAddPage from "@pages/NewsPage/AddPage";
import NewsEditPage from "@pages/NewsPage/EditPage";
import ProductOptionAddPage from "@pages/ProductOptionsPage/AddPage";
import ProductOptionEditPage from "@pages/ProductOptionsPage/EditPage";
import ProductAddPage from "@pages/ProductPage/AddPage";
import ProductEditPage from "@pages/ProductPage/EditPage";
import { GlobalErrorBoundary } from "@shared/components/global-errorboundary";
import { Layout } from "@shared/components/layout";
import { PATH } from "@shared/constants/route";
import { useAuthStore } from "@shared/hooks/useAuth";

import ArticlePage from "@pages/ArticlePage";
import { HomeBannersPage } from "@pages/HomeBannerPage";
import HomePage from "@pages/HomePage";
import LoginPage from "@pages/LoginPage";
import NewsPage from "@pages/NewsPage";
import { ProductBannerPage } from "@pages/ProductBannerPage";
import ProductCategoriesPage from "@pages/ProductCategoriesPage";
import {
  ProductMasterAddPage,
  ProductMasterEditPage,
  ProductMasterListPage,
} from "@pages/ProductMasterPage";
import ProductOptionsPage from "@pages/ProductOptionsPage";
import ProductsPage from "@pages/ProductPage";
import ProductSubCategoriesPage from "@pages/ProductSubCategoriesPage";
import SignUpPage from "@pages/SignUpPage";
import UserPage from "@pages/UserPage";

const PublicRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate replace to={PATH.INDEX} />;
  }

  return <Outlet />;
};

const publicRoutes: RouteObject[] = [
  {
    element: <PublicRoute />,
    children: [
      {
        path: PATH.LOGIN,
        element: <LoginPage />,
      },
      {
        path: PATH.SIGNUP,
        element: <SignUpPage />,
      },
    ],
  },
];

const PrivateRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate replace to={PATH.LOGIN} />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

const privateRoutes: RouteObject[] = [
  {
    element: (
      <GlobalErrorBoundary>
        <PrivateRoute />
      </GlobalErrorBoundary>
    ),
    children: [
      {
        path: PATH.INDEX,
        element: <HomePage />,
      },
      {
        path: PATH.PRODUCTS,
        element: <ProductsPage />,
      },
      {
        path: PATH.PRODUCT_ADD,
        element: <ProductAddPage />,
      },
      {
        path: PATH.PRODUCT_EDIT,
        element: <ProductEditPage />,
      },
      {
        path: PATH.PRODUCT_MASTER,
        element: <ProductMasterListPage />,
      },
      {
        path: PATH.PRODUCT_MASTER_ADD,
        element: <ProductMasterAddPage />,
      },
      {
        path: PATH.PRODUCT_MASTER_EDIT,
        element: <ProductMasterEditPage />,
      },
      {
        path: PATH.PRODUCT_CATEGORIES,
        element: <ProductCategoriesPage />,
      },
      {
        path: PATH.PRODUCT_SUB_CATEGORIES,
        element: <ProductSubCategoriesPage />,
      },
      {
        path: PATH.PRODUCT_OPTIONS,
        element: <ProductOptionsPage />,
      },
      {
        path: PATH.PRODUCT_OPTIONS_ADD,
        element: <ProductOptionAddPage />,
      },
      {
        path: PATH.PRODUCT_OPTIONS_EDIT,
        element: <ProductOptionEditPage />,
      },
      {
        path: PATH.HOME_BANNER,
        element: <HomeBannersPage />,
      },
      {
        path: PATH.PRODUCT_BANNER,
        element: <ProductBannerPage />,
      },
      {
        path: PATH.ARTICLE,
        element: <ArticlePage />,
      },
      {
        path: PATH.ARTICLE_ADD,
        element: <ArticleAddPage />,
      },
      {
        path: PATH.ARTICLE_EDIT,
        element: <ArticleEditPage />,
      },
      {
        path: PATH.NEWS,
        element: <NewsPage />,
      },
      {
        path: PATH.NEWS_ADD,
        element: <NewsAddPage />,
      },
      {
        path: PATH.NEWS_EDIT,
        element: <NewsEditPage />,
      },
      {
        path: PATH.BRAND,
        element: <BrandListPage />,
      },
      {
        path: PATH.BRAND_ADD,
        element: <BrandAddPage />,
      },
      {
        path: PATH.BRAND_EDIT,
        element: <BrandEditPage />,
      },
      {
        path: PATH.USERS,
        element: <UserPage />,
      },
    ],
  },
];

const router = createBrowserRouter([
  ...publicRoutes,
  ...privateRoutes,
  {
    path: "*",
    element: <Navigate replace to={PATH.INDEX} />,
  },
]);

const Router = () => {
  return <RouterProvider router={router} />;
};

export default Router;
