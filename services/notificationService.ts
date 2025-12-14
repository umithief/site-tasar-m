
// Notification Service
// Dispatches custom events to be caught by the main React App component
// This allows us to use a custom React Toast component instead of an external library

export type NotificationType = 'success' | 'error' | 'info';

export const notify = {
  success: (message: string) => dispatchToast('success', message),
  error: (message: string) => dispatchToast('error', message),
  info: (message: string) => dispatchToast('info', message)
};

function dispatchToast(type: NotificationType, message: string) {
    const event = new CustomEvent('show-toast', { 
        detail: { type, message } 
    });
    window.dispatchEvent(event);
}
