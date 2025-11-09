import { useState, useEffect } from "react";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import AuthenticatedView from "./components/AuthenticatedView";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState(null);

  // Check token on app startup
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      // You could add a request to the backend to verify the token and get user info if needed
    }
  }, []);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData); // Save user info from backend
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <div className="container">
      {!isAuthenticated ? (
        <div className="auth-container">
          {showRegister ? (
            <RegisterForm
              onRegister={handleLogin}
              onSwitchToLogin={() => setShowRegister(false)}
            />
          ) : (
            <LoginForm
              onLogin={handleLogin}
              onSwitchToRegister={() => setShowRegister(true)}
            />
          )}
        </div>
      ) : (
        <AuthenticatedView user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}
