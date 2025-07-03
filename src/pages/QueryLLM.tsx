import React from 'react';
import '.././QueryLLM.css';
// import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

const QueryLLM: React.FC = () => {
  const navigate = useNavigate();
  const [userInput, setUserInput] = useState<string>('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(event.target.value);
  };

  const queryOpenAI = async (prompt: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await axios.post('http://localhost:5000/query-llm', {
        prompt,
      });
      console.log('OpenAI Response:', result.data.response);
    } catch (err) {
      setError('Error querying OpenAI');
    } finally {
      setLoading(false);
    }
  };

  const queryCohere = async (prompt: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await axios.post('http://localhost:5000/query-cohere', {
        prompt,
      });
      console.log('Response from Cohere:', result.data.response);
      setResponse(result.data.response); // Set the response from Cohere API
    } catch (err) {
      setError('Error querying Cohere');
      console.error('Error querying Cohere:', err.response || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    await queryOpenAI(userInput);
    // await queryCohere(userInput);
  };

  return (
    <div>
      <div className="main_dashboard-header">
        <h1 className="main_dashboard_title">Ask an LLM</h1>
        <div className="button-row">
          <button onClick={() => navigate('/maindashboard')} className="dashboard-back-button">
            Back
          </button>
          <span className="splitline">/</span>
          <button onClick={() => navigate('/')} className="dashboard-back-button">
            Logout
          </button>
        </div>
      </div>

      <div>
        <h1>Enter Text for OpenAI</h1>
        <form onSubmit={handleSubmit}>
          <label>
            Enter your text:
            <input
              type="text"
              value={userInput}
              onChange={handleInputChange}
              required
              placeholder="Type your prompt here"
            />
          </label>
          <button type="submit">Submit</button>
        </form>
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
        {response && <p>Response from Cohere: {response}</p>}
      </div>
    </div>
  );
};

export default QueryLLM;
