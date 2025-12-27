import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/common/ErrorBoundary';
import './index.css';

// 🔧 DEV MODE: Set 999 gems and unlock all items for testing
if (import.meta.env.DEV) {
  localStorage.setItem('starryGems', '999');
  localStorage.setItem('unlockedAvatars', JSON.stringify(['✨', '🚀', '🤖', '🧠', '💡']));
  localStorage.setItem('unlockedBackgrounds', JSON.stringify(['sky', 'space', 'mars', 'galaxy']));
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
      })
      .catch((error) => {
      });
  });
}
