import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { cleanupLogs } from './lib/cleanup'
// AUDIT DE SÉCURITÉ CRITIQUE - Logging sécurisé
import './lib/production-logger'
import './utils/secure-logger'

// Setup cleanup for production
cleanupLogs();

createRoot(document.getElementById("root")!).render(<App />);
