import React, { useState } from 'react';
import '.././App.css';
import { useNavigate } from 'react-router-dom';
// import { sendMail } from './SendMail';

const Store: React.FC = () => {
  const [user_string, setString] = useState('');
  const navigate = useNavigate();

  const handleStringStore = (event: React.ChangeEvent<HTMLInputElement>) => {
    setString(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    // alert(`Registering with email: ${email}`);

    // const exists = await checkEmail(email);
    // if (exists) {
    //   console.log('Email exists');
    //   alert(`Email address already exists`);
    // } else {
    try {
      const response = await fetch('http://localhost:5000/store-string', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_string }),
      });

      if (response.ok) {
        console.log('String stored successfully');
        // navigate('/registerwait', { state: { email } });
      } else {
        console.error('Error storing string');
        // alert(`Error sending email`);
      }
    } catch (error) {
      console.error('Error:', error);
    }
    // }
  };

  return (
    <div>
      <h1>Store a string</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Enter your string:
          <input
            type="string"
            value={user_string}
            onChange={handleStringStore}
            required
            placeholder="your string"
          />
        </label>
        <button type="submit">Store</button>

        <div className="back-button">
          <button onClick={() => navigate('/')}>Back</button>
        </div>
      </form>
    </div>
  );
};

export default Store;
