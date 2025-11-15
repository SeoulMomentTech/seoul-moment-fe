import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
  type RouteObject,
} from "react-router";

import { Layout } from "@shared/components/layout";
import { PATH } from "@shared/constants/route";

import HomePage from "@pages/HomePage";
import LoginPage from "@pages/LoginPage";
import SignUpPage from "@pages/SignUpPage";

const PublicRoute = () => {
  const isLogin = false;

  if (isLogin) {
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
  const isLogin = true;

  if (!isLogin) {
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
        path: "/",
        element: <HomePage />,
      },
    ],
  },
];

const router = createBrowserRouter([...publicRoutes, ...privateRoutes]);

const Router = () => {
  return <RouterProvider router={router} />;
};

export default Router;
