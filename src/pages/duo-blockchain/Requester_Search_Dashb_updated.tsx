import React, { useState } from 'react';
import '../.././RequesterSearch.css';
// import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const RequesterSearchDashbUpd: React.FC = () => {
  const navigate = useNavigate();
  const [searchValue, setsearchValue] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('');

  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/all-user-datasets');
      if (!res.ok) throw new Error('Failed to fetch dataset files');
      const data = await res.json();

      setFiles(data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDataCard = async (datasetPath: string) => {
    const dataCardPath = datasetPath.replace('/dataset/', '/data-card/').replace(/\.csv$/, '.json');

    // const emailPrefix = datasetPath.split('/')[0];
    // const folderPath = `${emailPrefix}/data-card/`;

    try {
      const [cardRes, metaRes] = await Promise.all([
        fetch(`http://localhost:5000/get-datacard?path=${encodeURIComponent(dataCardPath)}`),
        fetch(`http://localhost:5000/extract-metadata?path=${encodeURIComponent(datasetPath)}`),
      ]);
      if (!cardRes.ok || !metaRes.ok) throw new Error('Failed to fetch Data Card or Metadata');
      const cardData = await cardRes.json();
      const metadata = await metaRes.json();

      console.log('Data card:', cardData);

      navigate('/datacardviewrequestaccess', { state: { datacard: cardData, metadata } });
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const fetchForm = async (datasetPath: string) => {
    const dataCardPath = datasetPath.replace('/dataset/', '/form/').replace(/\.csv$/, '.json');

    try {
      const formres = await fetch(
        `http://localhost:5000/get-form?path=${encodeURIComponent(dataCardPath)}`,
      );
      if (!formres.ok) throw new Error('Failed to fetch Form');
      const formData = await formres.json();

      console.log('Request Access Form card:', formData);

      navigate('/requestaccessform', { state: { formData: formData } });
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const handleClearSearch = () => {
    setsearchValue('');
    setFiles([]);
  };

  return (
    <div className="requester-dashboard-wrapper">
      <div className="search-page">
        <div className="main_dashboard-header">
          <h1 className="main_dashboard_title">Requester Dashboard</h1>
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
        <div className="dataset-results">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ul className="dataset-list">
              {files.map((file, idx) => (
                <li key={idx} className="dataset-card">
                  <div className="dataset-info">
                    <strong>Author: {file.email}</strong> → {file.filename}
                    <br />
                    <em>Path:</em> {file.fullPath}
                    <br />
                    <em>Size:</em> {file.size} bytes
                    <br />
                    <em>Last Modified:</em> {new Date(file.lastModified).toLocaleString()}
                  </div>
                  <div className="dataset-button-container">
                    <button
                      onClick={() => fetchDataCard(file.fullPath)}
                      className="open-data-card-button"
                    >
                      Open Data Card
                    </button>
                    <button
                      onClick={() => fetchForm(file.fullPath)}
                      className="open-data-card-button"
                    >
                      Request Access
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

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

export default RequesterSearchDashbUpd;
