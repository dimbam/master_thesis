import React, { useState } from 'react';
import '../.././RequesterSearch.css';
// import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const RequesterSearch: React.FC = () => {
  const navigate = useNavigate();
  const [searchValue, setsearchValue] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async () => {
    try {
      const response = await fetch('/results.json');
      const jsonData = await response.json();

      console.log('[DEBUG] Search input:', searchValue);
      console.log('[DEBUG] Full data sample:', Object.entries(jsonData).slice(0, 3));

      const filtered = Object.entries(jsonData)
        .map(([key, value]: any) => ({ id: key, ...value })) // Makes { id: "DUO:xxx", label: "..." }
        .filter(
          (item) =>
            item.label.toLowerCase().includes(searchValue.toLowerCase()) ||
            item.id.toLowerCase().includes(searchValue.toLowerCase()),
        );

      console.log('[DEBUG] Filtered search results:', filtered);
      setResults(filtered);
    } catch (error) {
      console.error('Error loading JSON:', error);
    }
  };

  const handleClearSearch = () => {
    setsearchValue('');
    setResults([]);
  };

  return (
    <div className="search-page">
      <div className="main_dashboard-header">
        <h1 className="main_dashboard_title">Requester Dashboard</h1>
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

      <div className="searchbar-container">
        <input
          className="searchbar"
          type="text"
          placeholder="Search a Dataset/Model Card"
          value={searchValue}
          onChange={(e) => setsearchValue(e.target.value)}
        />
        <button className="search-button" onClick={handleSearch}>
          Search
        </button>
      </div>
      {results.length > 0 && (
        <div className="search-results">
          <h2 className="search-title">Search Results ({results.length}):</h2>
          <ul className="search-result-list">
            {results.map((item, index) => (
              <li key={index}>
                <button
                  className="result-item-button"
                  onClick={() => console.log('Clicked:', item.id)}
                >
                  <strong>{item.id}</strong>: {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="dashboard-main-buttons-container">
        <div className="dashboard-dropdown">
          <span className="dashboard-main-button">Dataset</span>
          <div className="dropdown-content">
            {/* <div onClick={() => navigate('/createDataset')}>Request Dataset</div> */}
            <div onClick={() => navigate('/requesterform')}>View Dataset</div>
          </div>
        </div>

        <div className="dashboard-dropdown">
          <span className="dashboard-main-button">Model Card</span>
          <div className="dropdown-content">
            {/* <div onClick={() => navigate('/createDataset')}>Request Model Card</div> */}
            <div onClick={() => navigate('/requesterform')}>View Model Card</div>
          </div>
        </div>

        <div className="dashboard-dropdown">
          <span className="dashboard-main-button" onClick={handleClearSearch}>
            Clear Search
          </span>
        </div>
      </div>
    </div>
  );
};

export default RequesterSearch;
