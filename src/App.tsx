
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import { CRMSidebar } from './components/CRMSidebar';
import { CRMRouter } from './router';

const App = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="crm-theme">
      <Router>
        <div className="flex min-h-screen bg-background dark:bg-neutral-900">
          <CRMSidebar />
          <main className="flex-1">
            <CRMRouter />
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;
