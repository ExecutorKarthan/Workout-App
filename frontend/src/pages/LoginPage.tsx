import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    const res = await axios.post('/api/login/', { username, password });
    if (res.data.success) {
      localStorage.setItem('token', res.data.token);
      navigate(res.data.role === 'trainer' ? '/trainer' : '/client');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div>
      <h1>Welcome to FitTrack</h1>
      <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default LoginPage;