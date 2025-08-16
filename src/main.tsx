import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { cleanupLogs } from './lib/cleanup'
import { setupConsoleInterceptor } from './utils/console-cleaner'

// Setup console optimization
setupConsoleInterceptor();
cleanupLogs();

createRoot(document.getElementById("root")!).render(<App />);
