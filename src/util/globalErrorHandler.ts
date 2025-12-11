import { toast } from 'react-toastify';

// Handle any JS runtime errors
window.addEventListener('error', (event) => {
  if (event.error) {
    console.error('Global JS error:', event.error);
    toast.error(`⚠️ ${event.error.message || 'An unexpected error occurred'}`);
  } else if (event.message) {
    console.error('Global JS error message:', event.message);
    toast.error(`⚠️ ${event.message}`);
  }
});

// Handle any unhandled Promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
  const message =
    typeof event.reason === 'string'
      ? event.reason
      : event.reason?.message || 'Unhandled rejection occurred';
  toast.error(`⚠️ ${message}`);
});
