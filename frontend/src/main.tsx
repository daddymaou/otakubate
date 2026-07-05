import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import { CheckCircle, XCircle, Loader2, Info } from 'lucide-react'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 * 60 } },
})

// Custom toast with Lucide icons
const toastStyles = {
  success: {
    duration: 3000,
    icon: <CheckCircle size={18} style={{ color: '#10B981' }} />,
    style: {
      background: 'linear-gradient(135deg, #1a1a2e 0%, #1a1a2e 100%)',
      color: '#fff',
      borderRadius: '20px',
      padding: '12px 20px',
      fontSize: '14px',
      fontWeight: 500,
      fontFamily: "'Inter', system-ui, sans-serif",
      boxShadow: '0 15px 35px -8px rgba(16, 185, 129, 0.3), 0 0 0 1px rgba(16, 185, 129, 0.25) inset',
      border: '1px solid rgba(16, 185, 129, 0.3)',
      backdropFilter: 'blur(12px)',
      gap: '12px',
    },
  },
  error: {
    duration: 4000,
    icon: <XCircle size={18} style={{ color: '#E63946' }} />,
    style: {
      background: 'linear-gradient(135deg, #1a1a2e 0%, #1a1a2e 100%)',
      color: '#fff',
      borderRadius: '20px',
      padding: '12px 20px',
      fontSize: '14px',
      fontWeight: 500,
      fontFamily: "'Inter', system-ui, sans-serif",
      boxShadow: '0 15px 35px -8px rgba(230, 57, 70, 0.4), 0 0 0 1px rgba(230, 57, 70, 0.35) inset',
      border: '1px solid rgba(230, 57, 70, 0.4)',
      backdropFilter: 'blur(12px)',
      gap: '12px',
    },
  },
  loading: {
    icon: <Loader2 size={18} className="animate-spin" style={{ color: '#F4C430' }} />,
    style: {
      background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%)',
      color: '#fff',
      borderRadius: '20px',
      padding: '12px 20px',
      fontSize: '14px',
      fontWeight: 500,
      fontFamily: "'Inter', system-ui, sans-serif",
      boxShadow: '0 15px 35px -8px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(244, 196, 48, 0.15) inset',
      border: '1px solid rgba(244, 196, 48, 0.2)',
      backdropFilter: 'blur(12px)',
      gap: '12px',
    },
  },
  blank: {
    icon: <Info size={18} style={{ color: '#E63946' }} />,
    style: {
      background: 'linear-gradient(135deg, #1a1a2e 0%, #1a1a2e 100%)',
      color: '#fff',
      borderRadius: '20px',
      padding: '12px 20px',
      fontSize: '14px',
      fontWeight: 500,
      fontFamily: "'Inter', system-ui, sans-serif",
      boxShadow: '0 15px 35px -8px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(230, 57, 70, 0.1) inset',
      border: '1px solid rgba(230, 57, 70, 0.15)',
      backdropFilter: 'blur(12px)',
      gap: '12px',
    },
  },
}

// Add custom animations
const toastAnimations = `
  @keyframes toastSlideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes toastSlideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  
  .go3958317564 {
    animation: toastSlideIn 0.3s cubic-bezier(0.34, 1.2, 0.64, 1) !important;
  }
  
  .go3958317564.exit {
    animation: toastSlideOut 0.2s ease-in !important;
  }
`

if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = toastAnimations
  document.head.appendChild(style)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster 
          position="top-right"
          containerStyle={{
            top: 80,
            right: 16,
          }}
          toastOptions={{
            duration: 3500,
            success: toastStyles.success,
            error: toastStyles.error,
            loading: toastStyles.loading,
            blank: toastStyles.blank,
          }}
        />
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>
)