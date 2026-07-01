import { Routes, Route } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductFormPage } from './pages/ProductFormPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { LandingEditorPage } from './pages/LandingEditorPage';
import { WhatsappConfigPage } from './pages/WhatsappConfigPage';
import { UsersPage } from './pages/UsersPage';
import { ReportsPage } from './pages/ReportsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { RequireAuth } from './components/auth/RequireAuth';
import { RequireRole } from './components/auth/RequireRole';
import { AppShell } from './components/layout/AppShell';
import { ToastContainer } from './components/ui/ToastContainer';

function Protected({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <AppShell>{children}</AppShell>
    </RequireAuth>
  );
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <Protected>
              <ProductsPage />
            </Protected>
          }
        />
        <Route
          path="/productos/:id"
          element={
            <Protected>
              <ProductFormPage />
            </Protected>
          }
        />
        <Route
          path="/categorias"
          element={
            <Protected>
              <CategoriesPage />
            </Protected>
          }
        />
        <Route
          path="/landing"
          element={
            <Protected>
              <LandingEditorPage />
            </Protected>
          }
        />
        <Route
          path="/whatsapp"
          element={
            <Protected>
              <WhatsappConfigPage />
            </Protected>
          }
        />
        <Route
          path="/reportes"
          element={
            <Protected>
              <ReportsPage />
            </Protected>
          }
        />
        <Route
          path="/usuarios"
          element={
            <Protected>
              <RequireRole role="owner">
                <UsersPage />
              </RequireRole>
            </Protected>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {/* Toast global también visible en /login (fuera del AppShell) */}
      <ToastContainer />
    </>
  );
}
