import React, { useState, useEffect } from 'react';
import { LoginForm } from './pages/LoginForm';
import { ChatRoom } from './components/ChatRoom';
import { useSocket } from './hooks/useSocket';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { connected, reconnecting, currentUser, connect } = useSocket();

  const handleLogin = (username, avatar) => {
    connect(username, avatar);
    setIsLoggedIn(true);
  };

  useEffect(() => {
    if (connected && currentUser) {
      setIsLoggedIn(true);
    }
  }, [connected, currentUser]);

  if (!isLoggedIn || !currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  if (reconnecting) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Reconnecting to chat...</p>
        </div>
      </div>
    );
  }

  return <ChatRoom currentUser={currentUser} />;
}

export default App;