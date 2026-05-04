import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    if (duration) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
    
    return id;
  }, []);

  const success = useCallback((message, duration = 3000) => addToast(message, 'success', duration), [addToast]);
  const error = useCallback((message, duration = 3000) => addToast(message, 'error', duration), [addToast]);
  const info = useCallback((message, duration = 3000) => addToast(message, 'info', duration), [addToast]);
  const warning = useCallback((message, duration = 3000) => addToast(message, 'warning', duration), [addToast]);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const value = {
    toasts,
    success,
    error,
    info,
    warning,
    dismiss,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, onDismiss }) => {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none',
      }}
    >
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const Toast = ({ toast, onDismiss }) => {
  const bgColor = {
    success: 'rgba(34, 197, 94, 0.95)',
    error: 'rgba(239, 68, 68, 0.95)',
    info: 'rgba(59, 130, 246, 0.95)',
    warning: 'rgba(245, 158, 11, 0.95)',
  }[toast.type] || 'rgba(75, 85, 99, 0.95)';

  return (
    <div
      style={{
        background: bgColor,
        color: '#fff',
        padding: '14px 16px',
        borderRadius: '8px',
        fontSize: '14px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        pointerEvents: 'auto',
        animation: 'slideIn 0.3s ease-out',
        backdropFilter: 'blur(10px)',
      }}
      onClick={() => onDismiss(toast.id)}
    >
      {toast.message}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
