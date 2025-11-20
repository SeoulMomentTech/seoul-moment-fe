import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
  type RouteObject,
} from "react-router";

import { Layout } from "@shared/components/layout";
import { PATH } from "@shared/constants/route";
import { useAuthStore } from "@shared/hooks/useAuth";

import HomePage from "@pages/HomePage";
import LoginPage from "@pages/LoginPage";
import ProductCategoriesPage from "@pages/ProductCategoriesPage";
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
    element: <PrivateRoute />,
    children: [
      {
        path: PATH.INDEX,
        element: <HomePage />,
      },
      {
        path: PATH.PRODUCT_CATEGORIES,
        element: <ProductCategoriesPage />,
      },
    ],
  },
];

const router = createBrowserRouter([...publicRoutes, ...privateRoutes]);

const Router = () => {
  return <RouterProvider router={router} />;
};

export default Router;
