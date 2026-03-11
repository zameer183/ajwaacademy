'use client';

import { useEffect } from 'react';

const isAbortError = (value) => {
  if (!value) return false;
  if (value?.name === 'AbortError') return true;
  const message = String(value?.message || value || '');
  return message.includes('AbortError') || message.includes('signal is aborted');
};

export default function AbortErrorSilencer() {
  useEffect(() => {
    const handleRejection = (event) => {
      if (isAbortError(event?.reason)) {
        event.preventDefault();
      }
    };

    const handleError = (event) => {
      if (isAbortError(event?.error)) {
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handleRejection);
    window.onunhandledrejection = (event) => {
      if (isAbortError(event?.reason)) {
        return true;
      }
      return false;
    };
    window.addEventListener('error', handleError);
    window.onerror = (_msg, _src, _line, _col, error) => {
      if (isAbortError(error)) {
        return true;
      }
      return false;
    };
    return () => {
      window.removeEventListener('unhandledrejection', handleRejection);
      if (window.onunhandledrejection) window.onunhandledrejection = null;
      window.removeEventListener('error', handleError);
      if (window.onerror) window.onerror = null;
    };
  }, []);

  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      if (args.some((arg) => isAbortError(arg))) {
        return;
      }
      originalError(...args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  return null;
}
