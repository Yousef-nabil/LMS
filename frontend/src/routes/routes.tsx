import { createBrowserRouter, Navigate } from "react-router";
import { LandingPage } from "../pages/LandingPage";
import { LoginPage } from "../pages/LoginPage";
import { SignupPage } from "../pages/Signup";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { Layout } from "../layouts/Layout";
import { PublicRoute } from "../components/PublicRoute";
import { RoleRoute } from "../components/RoleRoute";
import { AuthWrapper } from "../components/AuthWrapper";

import { CreateCourse } from "../pages/instructor/CreateCourse";
import { EditCourse } from "../pages/instructor/EditCourse";
import { ManageCourse } from "../pages/instructor/ManageCourse";
import { InstructorMyCourses } from "../pages/instructor/MyCourses";

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
                  { index: true, element: <Navigate to="my-courses" replace /> },
                  { path: "dashboard", element: <Navigate to="../my-courses" replace /> },
                  { path: "my-courses", element: <InstructorMyCourses /> },
                  { path: "create", element: <CreateCourse /> },
                  { path: "edit/:id", element: <EditCourse /> },
                  { path: "manage/:id", element: <ManageCourse /> },
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
