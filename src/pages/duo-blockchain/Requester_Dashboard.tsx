import React, { useState } from 'react';
import '../.././RequesterSearch.css';
// import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const RequesterSearch: React.FC = () => {
  const navigate = useNavigate();
  const [searchValue, setsearchValue] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('');

  const handleSearch = async () => {
    try {
      const response = await fetch('/results.json');
      const jsonData = await response.json();

      console.log('[DEBUG] Search input:', searchValue);
      console.log('[DEBUG] Full data sample:', Object.entries(jsonData).slice(0, 3));

      // Filter results based on the search input and selected filter (type)
      const filtered = Object.entries(jsonData)
        .map(([key, value]: any) => ({ id: key, ...value })) // Makes { id: "DUO:xxx", label: "..." }
        .filter(
          (item) =>
            // Check if it matches the search term (either by label or id)
            (item.label.toLowerCase().includes(searchValue.toLowerCase()) ||
              item.id.toLowerCase().includes(searchValue.toLowerCase())) &&
            // Filter by selectedFilter (type) if set
            (selectedFilter === '' || item.type === selectedFilter), // New filter logic based on `type`
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
    <div className="requester-dashboard-wrapper">
      <div className="search-page">
        <div className="main_dashboard-header">
          <h1 className="main_dashboard_title">Requester Dashboard</h1>
          <div className="filter-buttons-container">
            <button
              onClick={() => navigate('/requesterform')}
              className="filter-button dataset-button"
            >
              Dataset
            </button>
            <button
              onClick={() => navigate('/requesterform')}
              className="filter-button modelcard-button"
            >
              Model Card
            </button>
          </div>
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
          <div className="dropdown-container">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="search-filter-dropdown"
            >
              <option value="">Search Filters</option>
              <option value="Dataset">Dataset</option>
              <option value="Model Card">Model Card</option>
            </select>
          </div>
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
                <li key={index} className="result-list-entry">
                  <div className="result-item-button-row">
                    <span className="result-text">
                      <strong>{item.id}</strong>: {item.label}
                    </span>
                    <button
                      onClick={() => navigate(`/datacards/${encodeURIComponent(item.match_id)}`)} //passing id in url
                      className="open-data-card-button"
                    >
                      Open Data Card
                    </button>
                    <button onClick={() => navigate('/filteredform')} className="open-form-button">
                      Open Form
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="dashboard-main-buttons-container">
          <div className="dashboard-dropdown">
            <span className="dashboard-main-button" onClick={handleClearSearch}>
              Clear Search
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequesterSearch;
