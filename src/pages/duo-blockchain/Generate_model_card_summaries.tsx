import React, { useState } from 'react';
import '../.././Generate_model_card_summaries.css';
// import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { json } from 'body-parser';

const Generate_summaries: React.FC = () => {
  const navigate = useNavigate();

  const [model_cards, setmodel_cards] = useState<any[]>([]);
  const [summaries, setSummaries] = useState<any[]>([]);
  const [minIOsummaries, setminIOsummaries] = useState<any[]>([]);
  const [query, setQuery] = useState('');

  const fetchModelCards = async () => {
    try {
      const res = await fetch('http://localhost:5000/modelcards');
      if (!res.ok) throw new Error('Failed to fetch Model Cards');
      const data = await res.json();
      setmodel_cards(data);
      console.log(model_cards);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const generateSummaries = async () => {
    try {
      for (let card of model_cards) {
        const res = await fetch('http://localhost:5000/generate-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ modelCardName: card.name }),
        });
        if (!res.ok) throw new Error('Failed to generate summary');
        const data = await res.json();
        setSummaries((prev) => [...prev, data]);
      }
    } catch (err) {
      console.error('Error generating summaries:', err);
    }
  };

  const fetchSummaries = async () => {
    try {
      const res = await fetch('http://localhost:5000/getAllSummariesfromMinIO');
      if (!res.ok) throw new Error('Failed to fetch Summaries');
      const data = await res.json();
      setminIOsummaries(data);
      console.log(minIOsummaries);
    } catch (err) {
      console.error('MinIOSummaries Fetch error:', err);
    }
  };

  const MatchQuerySummary = async () => {
    try {
      const res = await fetch('http://localhost:5000/querymodelcardMatching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();
      console.log('Best match:', data);
    } catch (err) {
      console.error('Error matching query:', err);
    }
  };

  return (
    <div className="requester-dashboard-wrapper">
      <div className="search-page">
        <div className="main_dashboard-header">
          <h1 className="main_dashboard_title">Generate Model Card Summaries</h1>
          <div className="filter-buttons-container"></div>
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
      </div>
      <div className="content-under-header">
        <button onClick={fetchModelCards}>Fetch Model Cards</button>
        <button onClick={generateSummaries}>Generate Summaries</button>
        <button onClick={fetchSummaries}>Fetch Stored Summaries</button>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your query"
        />
        <button onClick={MatchQuerySummary}>Match Query</button>
      </div>
    </div>
  );
};

export default Generate_summaries;
