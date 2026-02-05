import React from 'react';
import '.././DataCardViewRequestAccess.css';
import { useNavigate, useLocation } from 'react-router-dom';

const DataCardViewRequestAccess: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const { datacard } = state || {};
  if (!datacard) return <div>Missing data</div>;

  const content = datacard[0]?.content || {};
  const metadata = content.__metadata__ || {};

  return (
    <div className="requester-dashboard-wrapper">
      <div className="search-page">
        <div className="main_dashboard-header">
          <h1 className="main_dashboard_title">Data Card & Metadata</h1>
          <div className="button-row">
            <button onClick={() => navigate(-1)} className="dashboard-back-button">
              Back
            </button>
            <span className="splitline">/</span>
            <button onClick={() => navigate('/')} className="dashboard-back-button">
              Logout
            </button>
          </div>
        </div>

        <div className="card">
          <h2 className="title-container">Data Card</h2>
          <div className="datacard-section">
            <p>
              <strong>Filename:</strong> {datacard[0].fullPath}
            </p>
            <p>
              <strong>Last Modified:</strong> {datacard[0].modified}
            </p>
            {Object.entries(content)
              .filter(([k]) => k !== '__metadata__')
              .map(([k, v]) => (
                <p key={k}>
                  <strong>{k}:</strong> {String(v)}
                </p>
              ))}
            <hr />
          </div>

          <h3 className="title-container">Extracted Metadata</h3>
          <div className="metadata-section">
            {Object.entries(metadata).map(([k, v]) => (
              <p key={k}>
                <strong>{k}:</strong> <span className="wrapped-text">{JSON.stringify(v)}</span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataCardViewRequestAccess;
