import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from "../context/CartContext.jsx";
import { UserProvider } from "../context/UserContext";
createRoot(document.getElementById('root')).render(
  
  <UserProvider>
    <CartProvider>
    <BrowserRouter>
      <StrictMode>
        <App />
      </StrictMode>
    </BrowserRouter>
  </CartProvider>
  </UserProvider>,
)
