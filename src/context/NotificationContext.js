import React, { createContext, useState, useCallback } from 'react';
import Snackbar from '@mui/material/Snackbar';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [message, setMessage] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const showNotification = useCallback((msg) => {
    setMessage(msg);
    setIsOpen(true);
  }, []);

  const closeNotification = useCallback(() => {
    setIsOpen(false);
    setMessage(null);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Snackbar
        open={isOpen}
        autoHideDuration={3000}
        onClose={closeNotification}
        message={message}
      />
    </NotificationContext.Provider>
  );
};


