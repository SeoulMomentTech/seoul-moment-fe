import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from "react-router";
import { PATH } from "./constants/route";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";

const PublicRoute = () => {
  const isLogin = true;

  if (isLogin) {
    return <Navigate replace to={PATH.INDEX} />;
  }

  return <Outlet />;
};

const publicRoutes = [
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
  const isLogin = false;

  if (!isLogin) {
    return <Navigate replace to={PATH.LOGIN} />;
  }

  return <Outlet />;
};

const privateRoutes = [
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
