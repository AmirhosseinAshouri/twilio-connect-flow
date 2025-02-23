
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { onCLS, onFID, onLCP } from 'web-vitals';

// Report Web Vitals
function reportWebVitals(metric: any) {
  // You can send the metric to your analytics service here
  console.log(metric);
}

// Initialize Web Vitals reporting
onCLS(reportWebVitals);
onFID(reportWebVitals);
onLCP(reportWebVitals);

createRoot(document.getElementById("root")!).render(<App />);
