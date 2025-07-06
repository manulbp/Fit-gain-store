import { StrictMode } from 'react';
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import StoreContextProvider from './context/StoreContext.jsx';
import UserContextProvider from './context/UserContext.jsx';
import { Provider } from 'react-redux';
import { store } from './redux/store.js';
import CartContextProvider from './context/CartContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StoreContextProvider>
      <UserContextProvider>
        <CartContextProvider>
          <Provider store={store}>
            <App />
          </Provider>
        </CartContextProvider>
      </UserContextProvider>
    </StoreContextProvider>
  </StrictMode>,
);