import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { cleanupLogs } from './lib/cleanup'
// Security fix: Enhanced production logging security
import './lib/production-logger'

// Setup cleanup for production
cleanupLogs();

createRoot(document.getElementById("root")!).render(<App />);
