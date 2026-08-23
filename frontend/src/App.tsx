import { useState } from 'react';
import { useAuth } from './AuthContext';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import Dashboard from './components/Dashboard';

export default function App() {
  const { token } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (token) return <Dashboard />;
  if (showRegister) return <RegisterPage onLogin={() => setShowRegister(false)} />;
  return <LoginPage onRegister={() => setShowRegister(true)} />;
}
