import { createBrowserRouter } from "react-router";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./components/AdminDashboard";
import PredictiveInsights from "./components/PredictiveInsights";
import FeedbackMonitor from "./components/FeedbackMonitor";
import AdminSettings from "./components/AdminSettings";
import StudentLayout from "./components/StudentLayout";
import StudentPortal from "./components/StudentPortal";
import MyBookings from "./components/MyBookings";
import Favorites from "./components/Favorites";
import HomePage from "./components/HomePage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: HomePage,
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "insights", Component: PredictiveInsights },
      { path: "feedback", Component: FeedbackMonitor },
      { path: "settings", Component: AdminSettings },
    ],
  },
  {
    path: "/student",
    Component: StudentLayout,
    children: [
      { index: true, Component: StudentPortal },
      { path: "bookings", Component: MyBookings },
      { path: "favorites", Component: Favorites },
    ],
  },
]);