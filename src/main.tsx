import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { cleanupLogs } from './lib/cleanup'

// Only setup cleanup for production, avoid console interceptor for now
cleanupLogs();

createRoot(document.getElementById("root")!).render(<App />);
