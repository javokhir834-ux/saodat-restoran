import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import MenuPage from './pages/MenuPage';
import OrderPage from './pages/OrderPage';
import OrderStatusPage from './pages/OrderStatusPage';
import LoginPage from './pages/LoginPage';
import KassirPage from './pages/KassirPage';
import AdminPage from './pages/AdminPage';
import ProductFormPage from './pages/ProductFormPage';
import BronPage from './pages/BronPage';
import MijozKirishPage from './pages/MijozKirishPage';
import ProfilPage from './pages/ProfilPage';
import PrivateRoute from './components/PrivateRoute';

const qc = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          {/* Mijoz sahifalari — ochiq */}
          <Route path="/" element={<MenuPage />} />
          <Route path="/buyurtma" element={<OrderPage />} />
          <Route path="/buyurtma/:raqam" element={<OrderStatusPage />} />
          <Route path="/bron" element={<BronPage />} />
          <Route path="/kirish" element={<MijozKirishPage />} />
          <Route path="/profil" element={<ProfilPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Xodim sahifalari — himoyalangan */}
          <Route path="/kassir" element={
            <PrivateRoute><KassirPage /></PrivateRoute>
          } />
          <Route path="/admin" element={
            <PrivateRoute rol="admin"><AdminPage /></PrivateRoute>
          } />
          <Route path="/admin/mahsulot/:id" element={
            <PrivateRoute rol="admin"><ProductFormPage /></PrivateRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '14px',
            fontWeight: 600,
            fontSize: '14px',
            background: '#fff',
            color: 'var(--ink)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          },
          success: { iconTheme: { primary: '#0F4D3C', secondary: '#fff' } },
          error: { iconTheme: { primary: '#A32D2D', secondary: '#fff' } },
        }}
      />
    </QueryClientProvider>
  );
}
