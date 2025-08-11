import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { cleanupLogs } from './lib/cleanup'

// Remove debug logs in production
cleanupLogs();

createRoot(document.getElementById("root")!).render(<App />);
