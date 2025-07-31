
import { ThemeProvider } from './components/theme-provider';
import { AuthWrapper } from './components/AuthWrapper';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CRMSidebar } from './components/CRMSidebar';
import { CRMRouter } from './router';
import { BrowserRouter as Router } from 'react-router-dom';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { CallProvider } from './contexts/CallContext';
import { GlobalCallWindow } from './components/GlobalCallWindow';

const App = () => {
  console.log('App: Rendering');
  
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" storageKey="crm-theme">
        <CallProvider>
          <Router>
            <AuthWrapper>
              <div className="flex min-h-screen bg-background dark:bg-neutral-900">
                <CRMSidebar />
                <main className="flex-1">
                  <CRMRouter />
                </main>
              </div>
              <GlobalCallWindow />
            </AuthWrapper>
            <SpeedInsights />
          </Router>
        </CallProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
