import React, { useState } from 'react';
import '.././App.css';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const Registerwait: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  return (
    <div className="register_waitpage">
      <h1 className="registration_mes">
        Please check your address {email} for a verification message
      </h1>
      <p className="black_color_text">Your registration is being processed.</p>

      <div className="back-button">
        <button onClick={() => navigate('/')}>Back</button>
      </div>
    </div>
  );
};

export default Registerwait;
