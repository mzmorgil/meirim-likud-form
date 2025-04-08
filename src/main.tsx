import { createRoot } from 'react-dom/client'
import * as Sentry from "@sentry/react";
import App from './App.tsx'
import './index.css'

// Initialize Sentry
Sentry.init({
dsn: "https://4d89d85b3b4b514ba02d29c1d5d49dce@o4509117180346368.ingest.de.sentry.io/4509117190897744"
});

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <Sentry.ErrorBoundary fallback={<p>אירעה שגיאה בטעינת האפליקציה. אנא נסה שוב מאוחר יותר.</p>}>
      <App />
    </Sentry.ErrorBoundary>
  );
}