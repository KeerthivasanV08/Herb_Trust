import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Verify from "./pages/Verify";
import FarmerDashboard from "./pages/FarmerDashboard";
import FarmerSubmit from "./pages/FarmerSubmit";
import FarmerBatches from "./pages/FarmerBatches";
import FarmerNotifications from "./pages/FarmerNotifications";
import ManufacturerDashboard from "./pages/ManufacturerDashboard";
import ManufacturerIncoming from "./pages/ManufacturerIncoming";
import ManufacturerReports from "./pages/ManufacturerReports";
import AuditorDashboard from "./pages/AuditorDashboard";
import AuditorHistory from "./pages/AuditorHistory";
import AuditorComplianceMap from "./pages/AuditorComplianceMap";
import NotFound from "./pages/NotFound";
import BatchDemo from "./pages/BatchDemo";
import BatchDetails from "./pages/BatchDetails";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/verify/:id" element={<Verify />} />
            <Route path="/demo" element={<BatchDemo />} />

            <Route path="/farmer" element={
              <ProtectedRoute allowedRoles={['farmer']}><DashboardLayout /></ProtectedRoute>
            }>
              <Route index element={<FarmerDashboard />} />
              <Route path="submit" element={<FarmerSubmit />} />
              <Route path="batches" element={<FarmerBatches />} />
              <Route path="notifications" element={<FarmerNotifications />} />
              <Route path="batch/:id" element={<BatchDetails />} />
            </Route>

            <Route path="/manufacturer" element={
              <ProtectedRoute allowedRoles={['manufacturer']}><DashboardLayout /></ProtectedRoute>
            }>
              <Route index element={<ManufacturerDashboard />} />
              <Route path="incoming" element={<ManufacturerIncoming />} />
              <Route path="reports" element={<ManufacturerReports />} />
            </Route>

            <Route path="/auditor" element={
              <ProtectedRoute allowedRoles={['auditor']}><DashboardLayout /></ProtectedRoute>
            }>
              <Route index element={<AuditorDashboard />} />
              <Route path="history" element={<AuditorHistory />} />
              <Route path="compliance-map" element={<AuditorComplianceMap />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
