import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// Force light mode — remove dark class immediately and watch for changes
document.documentElement.classList.remove('dark');
document.documentElement.style.colorScheme = 'light';

const observer = new MutationObserver(() => {
  if (document.documentElement.classList.contains('dark')) {
    document.documentElement.classList.remove('dark');
  }
});
observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)