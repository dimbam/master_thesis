import React, { useState } from 'react';
import '.././App.css';
import { useNavigate } from 'react-router-dom';
import { checkEmail } from './checkEmail';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const exists = await checkEmail(email);
    if (exists) {
      localStorage.setItem('email', email);
      console.log('Email exists');

      try {
        const res = await fetch('http://localhost:5000/init-user-folder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        if (!res.ok) {
          console.error('Failed to initialize user folders');
          alert('Warning: user folders not initialized');
        }
      } catch (err) {
        console.error('Error calling init-user-folder:', err);
      }
      navigate('/maindashboard', { state: { email } });
    } else {
      console.log('Email not found');
      alert(`${email} not found`);
    }
  };

  return (
    <div className="login_page">
      <h1 className="reg_log-title">Login</h1>
      <form onSubmit={handleSubmit}>
        <label className="enter_mail">
          Enter your email address:
          <input
            className="placeholder_email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            required
            placeholder="you@example.com"
          />
        </label>
        <button className="reg_log_buttons" type="submit">
          Login
        </button>

        <h2 className="register_user">
          Don't have an account?{' '}
          <span onClick={() => navigate('/register')} className="login-link">
            Register here
          </span>
        </h2>

        <div className="login_back-button">
          <button onClick={() => navigate('/')}>Back</button>
        </div>
      </form>
    </div>
  );
};

export default Login;
