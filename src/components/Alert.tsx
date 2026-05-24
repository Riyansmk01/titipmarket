import React, { useEffect } from 'react';
import { X, Check, AlertCircle, Info, AlertTriangle, Loader } from 'lucide-react';
import '../alerts.css';

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface AlertConfig {
  id?: string;
  type: AlertType;
  title: string;
  message?: string;
  duration?: number; // Auto-close in ms (0 = manual close)
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }>;
  onClose?: () => void;
}

interface AlertProps extends AlertConfig {
  onClose: () => void;
  autoClose?: boolean;
}

function Alert({ type, title, message, duration, actions, onClose, autoClose = true, ...props }: AlertProps) {
  useEffect(() => {
    if (autoClose && duration && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose, autoClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Check size={24} />;
      case 'error':
        return <AlertCircle size={24} />;
      case 'warning':
        return <AlertTriangle size={24} />;
      case 'info':
        return <Info size={24} />;
      case 'loading':
        return <Loader size={24} className="animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="alert-overlay" onClick={onClose} />
      <div className={`alert-container alert-${type}`}>
        <button className="alert-close" onClick={onClose}>
          <X size={20} />
        </button>
        <div className="alert-content">
          <div className="alert-icon">
            {getIcon()}
          </div>
          <div className="alert-text">
            <div className="alert-title">{title}</div>
            {message && <div className="alert-message">{message}</div>}
            {actions && actions.length > 0 && (
              <div className="alert-actions">
                {actions.map((action, idx) => (
                  <button
                    key={idx}
                    className={`alert-btn alert-btn-${action.variant || 'secondary'}`}
                    onClick={() => {
                      action.onClick();
                      onClose();
                    }}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Toast Notification Component (non-blocking)
interface ToastProps {
  type: AlertType;
  message: string;
  duration?: number;
  onClose: () => void;
}

export function Toast({ type, message, duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      case 'loading':
        return '⟳';
      default:
        return '';
    }
  };

  return (
    <div className={`toast toast-${type}`}>
      <span className={`toast-icon ${type === 'loading' ? 'animate-spin' : ''}`}>
        {getIcon()}
      </span>
      <span className="toast-message">{message}</span>
    </div>
  );
}

// Confirmation Dialog Component
interface ConfirmDialogProps {
  title: string;
  message: string;
  type?: 'warning' | 'error' | 'success';
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  type = 'warning',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  const getIconBg = () => {
    switch (type) {
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'success':
        return 'success';
      default:
        return 'warning';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return '⚠';
      case 'error':
        return '✕';
      case 'success':
        return '✓';
      default:
        return '';
    }
  };

  return (
    <>
      <div className="alert-overlay" onClick={onCancel} />
      <div className="alert-container">
        <div className="alert-content" style={{ flexDirection: 'column', textAlign: 'center' }}>
          <div className={`confirm-icon ${getIconBg()}`}>
            {getIcon()}
          </div>
          <div className="confirm-title">{title}</div>
          <div className="confirm-message">{message}</div>
          <div className="confirm-actions">
            <button className="btn-cancel" onClick={onCancel}>
              {cancelText}
            </button>
            <button className={`btn-confirm ${type === 'error' ? 'danger' : ''}`} onClick={onConfirm}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Alert;
