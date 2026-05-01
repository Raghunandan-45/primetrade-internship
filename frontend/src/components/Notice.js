import React from 'react';

export default function Notice({ type, message }) {
  if (!message) return null;
  const cls = type === 'success' ? 'notice notice-success' : 'notice notice-error';
  return <div className={cls}>{message}</div>;
}
