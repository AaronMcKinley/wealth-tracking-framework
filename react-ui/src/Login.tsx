import React, { useState } from 'react';
import axios from 'axios';

interface LoginResponse {
  message: string;
}

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Use AxiosResponse generic to type the response
      const response = await axios.post<LoginResponse>('http://localhost:5000/api/login', {
        username,
        password,
      });

      // If login is successful, display the success message
      setMessage(response.data.message);
    } catch (error: any) {
      // If there's an error, display the error message
      setMessage(error.response ? error.response.data.message : 'An error occurred');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Login;
