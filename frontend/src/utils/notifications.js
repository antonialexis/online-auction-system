export const notify = (message, type = 'info') => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('app-notification', {
      detail: { message, type },
    })
  );
};
