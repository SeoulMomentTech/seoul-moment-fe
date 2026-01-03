import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
  type RouteObject,
} from "react-router";

import { BrandAddPage } from "@pages/BrandPage/AddPage";
import { BrandEditPage } from "@pages/BrandPage/EditPage";
import { BrandListPage } from "@pages/BrandPage/ListPage";
import ProductOptionAddPage from "@pages/ProductOptionsPage/AddPage";
import ProductOptionEditPage from "@pages/ProductOptionsPage/EditPage";
import { GlobalErrorBoundary } from "@shared/components/global-errorboundary";
import { Layout } from "@shared/components/layout";
import { PATH } from "@shared/constants/route";
import { useAuthStore } from "@shared/hooks/useAuth";

import { HomeBannersPage } from "@pages/HomeBannerPage";
import HomePage from "@pages/HomePage";
import LoginPage from "@pages/LoginPage";
import ProductCategoriesPage from "@pages/ProductCategoriesPage";
import ProductOptionsPage from "@pages/ProductOptionsPage";
import ProductsPage from "@pages/ProductPage";
import ProductSubCategoriesPage from "@pages/ProductSubCategoriesPage";
import SignUpPage from "@pages/SignUpPage";

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
