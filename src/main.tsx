import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { FlashbarProvider } from './context/FlashbarContext';
// import './index.css'
import App from './App'
import Login from './Login'

const Main = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const session = sessionStorage.getItem('userSession');
    if (session) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <StrictMode>
      <FlashbarProvider>
      {isAuthenticated ? <App signOut={() => setIsAuthenticated(false)} user={undefined} /> : <Login onLogin={() => setIsAuthenticated(true)} />}
      </FlashbarProvider>
    </StrictMode>
  );
};

createRoot(document.getElementById('root')!).render(<Main />);
