import React from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import AppLoader from './components/AppLoader';
import ConnectionStatus from '@/components/ConnectionStatus';

import Home from './pages/Home';
import Analysis from './pages/Analysis';
import Results from './pages/Results';
import History from './pages/History';
import PaymentSuccess from './pages/PaymentSuccess';
import PremiumSuccess from './pages/PremiumSuccess';
import Forfaits from './pages/Forfaits';
import About from './pages/About';
import AccessDenied from './pages/AccessDenied';
import MagicLink from './pages/MagicLink';
import DermaBot from './pages/DermaBot';


import AnalysisLoading from './pages/AnalysisLoading';

class ErrorBoundary extends React.Component {
  componentDidCatch(error) {
    console.error('DermaCI error:', error);
    window.location.href = '/';
  }
  render() {
    return this.props.children;
  }
}

const PublicApp = () => {
  const { isLoadingPublicSettings } = useAuth();

  if (isLoadingPublicSettings) {
    return <AppLoader />;
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/access-denied" element={<AccessDenied />} />
      <Route path="/analysis" element={<Analysis />} />
      <Route path="/loading/:id" element={<AnalysisLoading />} />
      <Route path="/results/:id" element={<Results />} />
      <Route path="/analyses" element={<History />} />

      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/premium-success" element={<PremiumSuccess />} />
      <Route path="/forfaits" element={<Forfaits />} />
      <Route path="/about" element={<About />} />
      <Route path="/magic-link" element={<MagicLink />} />
      <Route path="/dermabot" element={<DermaBot />} />

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ConnectionStatus />
          <ErrorBoundary>
            <PublicApp />
          </ErrorBoundary>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
