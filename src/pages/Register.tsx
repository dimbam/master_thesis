import React, { useState } from 'react';
import '.././App.css';
import { useNavigate } from 'react-router-dom';
import { checkEmail } from './checkEmail';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const exists = await checkEmail(email);
    if (exists) {
      console.log('Email exists');
      alert(`Email address already exists`);
    } else {
      try {
        const response = await fetch('http://localhost:5000/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        if (response.ok) {
          console.log('Email sent successfully');
          navigate('/registerwait', { state: { email } });
        } else {
          console.error('Error sending email');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  return (
    <div className="register-page">
      <h1 className="reg_log-title">Register</h1>
      <form onSubmit={handleSubmit} className="register-form">
        <label className="enter_mail">
          Enter your email address:
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            required
            placeholder="you@example.com"
            className="input-field"
          />
        </label>
        <h2 className="already_user">
          Already a user?{' '}
          <span onClick={() => navigate('/login')} className="login-link">
            Login here
          </span>
        </h2>
        <button className="reg_log_buttons" type="submit">
          Register
        </button>

        <div className="register_back-button">
          <button onClick={() => navigate('/')}>Back</button>
        </div>
      </form>
    </div>
  );
};

export default Register;
