import { createBrowserRouter } from "react-router";
import { LandingPage } from "../pages/LandingPage";
import { LoginPage } from "../pages/LoginPage";
import { SignupPage } from "../pages/Signup";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { Layout } from "../layouts/Layout";
import { PublicRoute } from "../components/PublicRoute";
import { RoleRoute } from "../components/RoleRoute";
import { AuthWrapper } from "../components/AuthWrapper";

export const router = createBrowserRouter([
  {
    Component: AuthWrapper,
    children: [
      // Public routes
      {
        Component: PublicRoute,
        children: [
          {
            path: "/",
            Component: LandingPage,
          },
          {
            path: "/login",
            Component: LoginPage,
          },
          {
            path: "/signup",
            Component: SignupPage,
          },
        ],
      },
      // Protected routes
      {
        Component: ProtectedRoute,
        children: [
          {
            Component: Layout,
            children: [
              {
                path: "student",
                element: <RoleRoute allowedRole="student" />,
                children: [
                  { path: "dashboard", element: <div>Student Dashboard</div> },
                  { path: "browse", element: <div>Browse Courses</div> },
                  { path: "grades", element: <div>Grades</div> },
                ],
              },
              {
                path: "instructor",
                element: <RoleRoute allowedRole="instructor" />,
                children: [
                  { path: "dashboard", element: <div>Instructor Dashboard</div> },
                  { path: "create", element: <div>Create Course</div> },
                  { path: "analytics", element: <div>Analytics</div> },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]);
