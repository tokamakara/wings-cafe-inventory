import React, { useEffect } from "react";

/**
 * Notification component with auto-hide support.
 * Props:
 * - type: "success", "error", "warning"
 * - message: string to display
 * - duration: milliseconds before auto-hide (default 4000ms)
 * - onClose: callback when notification disappears
 */
export default function Notification({ type = "success", message, duration = 4000, onClose }) {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`notification ${type}`}>
      {message}
    </div>
  );
}
