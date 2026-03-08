import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import UdharPage from "@/pages/UdharPage";
import ExpensesPage from "@/pages/ExpensesPage";
import ProfitPage from "@/pages/ProfitPage";
import InventoryPage from "@/pages/InventoryPage";
import DeliveriesPage from "@/pages/DeliveriesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/udhar" element={<UdharPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/profit" element={<ProfitPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/deliveries" element={<DeliveriesPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
