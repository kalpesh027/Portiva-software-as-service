import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";

import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";
import OtpVerify from "../pages/OtpVerify";
import CreatePortfolio from "../pages/CreatePortfolio";
import Dashboard from "../pages/Dashboard";
import AdminDashboard from "../pages/AdminDashboard";
import AIProcessing from "../components/AIProcessing";
import PortfolioSuccess from "../components/PortfolioSuccess";
import PortfolioRenderer from "../portfolio/PortfolioRenderer";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<OtpVerify />} />
      <Route path="/portfolio-dummy" element={<PortfolioSuccess />} /> {/* for check */}

      {/* Protected Routes */}
      <Route path="/create" element={<PrivateRoute requireProfileIncomplete><CreatePortfolio /></PrivateRoute>} />
      <Route path="/onboarding" element={<PrivateRoute requireProfileIncomplete><CreatePortfolio /></PrivateRoute>} />
      <Route path="/ai-processing" element={<PrivateRoute><AIProcessing /></PrivateRoute>} />
      <Route path="/portfolio-success" element={<PrivateRoute><PortfolioSuccess /></PrivateRoute>} />
      <Route path="/dashboard" element={<PrivateRoute requireProfileComplete={true}><Dashboard /></PrivateRoute>} />
      <Route path="/admin" element={<PrivateRoute requireAdmin={true}><AdminDashboard /></PrivateRoute>} />

      {/* Portfolio Routes - These should come LAST to avoid conflicts */}
      <Route path="/:slug/:page" element={<PortfolioRenderer />} />
      <Route path="/:slug" element={<PortfolioRenderer />} />
    </Routes>
  );
}
