import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { Auth } from './pages/Auth';
import { Pricing } from './pages/Pricing';
import { Notes } from './pages/Notes';
import { Header } from './components/Header';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { profile, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1B1B1B] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#FE6902]" />
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/auth" />;
  }

  return <>{children}</>;
}

function App() {
  const { initialize, isLoading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1B1B1B] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#FE6902]" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#262626',
            color: '#E5E5E5',
            border: '1px solid #393737',
          },
        }}
      />
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <>
                <Header />
                <Notes />
              </>
            </PrivateRoute>
          }
        />
        <Route
          path="/pricing"
          element={
            <>
              <Header />
              <Pricing />
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;