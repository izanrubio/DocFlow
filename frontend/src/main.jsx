import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import { ToastProvider } from './context/ToastContext';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import ErrorBoundary from './components/ErrorBoundary';
import NotFound from './pages/errors/NotFound';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import VerifyPending from './pages/VerifyPending';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import DocumentDetail from './pages/DocumentDetail';
import Templates from './pages/Templates';
import SignDocument from './pages/SignDocument';
import Pricing from './pages/Pricing';
import Billing from './pages/settings/Billing';
import Profile from './pages/settings/Profile';
import Landing from './pages/Landing';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsOfService from './pages/legal/TermsOfService';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verify-pending" element={<VerifyPending />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/documents" element={<PrivateRoute><Documents /></PrivateRoute>} />
          <Route path="/documents/:id" element={<PrivateRoute><DocumentDetail /></PrivateRoute>} />
          <Route path="/templates" element={<PrivateRoute><Templates /></PrivateRoute>} />
          <Route path="/sign/:token" element={<SignDocument />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/settings/billing" element={<PrivateRoute><Billing /></PrivateRoute>} />
          <Route path="/settings/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/" element={<Landing />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);
