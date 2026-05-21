import React, { useEffect, useState } from 'react';

const typeStyles = {
  success: { icon: 'bi-check-circle-fill', color: '#34d399' },
  error: { icon: 'bi-exclamation-triangle-fill', color: '#f87171' },
  warning: { icon: 'bi-exclamation-circle-fill', color: '#fbbf24' },
  info: { icon: 'bi-info-circle-fill', color: '#05d9c6' },
};

const NotificationToasts = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleNotification = (event) => {
      const id = `${Date.now()}-${Math.random()}`;
      const toast = {
        id,
        message: event.detail?.message || 'Notification',
        type: event.detail?.type || 'info',
      };

      setToasts((current) => [...current, toast]);
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== id));
      }, 4500);
    };

    window.addEventListener('app-notification', handleNotification);
    return () => window.removeEventListener('app-notification', handleNotification);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="position-fixed top-0 end-0 p-3 d-flex flex-column gap-2" style={{ zIndex: 2000, maxWidth: '360px' }}>
      {toasts.map((toast) => {
        const style = typeStyles[toast.type] || typeStyles.info;
        return (
          <div
            key={toast.id}
            className="rounded-3 shadow-lg p-3 d-flex gap-3 align-items-start"
            style={{ backgroundColor: '#0f172a', border: `1px solid ${style.color}70`, color: '#fff' }}
          >
            <i className={`bi ${style.icon} mt-1`} style={{ color: style.color }}></i>
            <p className="small mb-0">{toast.message}</p>
            <button
              type="button"
              className="btn-close btn-close-white ms-auto shadow-none"
              style={{ transform: 'scale(0.75)' }}
              onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}
              aria-label="Dismiss notification"
            ></button>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationToasts;
