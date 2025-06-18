import React, { useEffect, useState } from 'react';
import '.././CreateDataCard.css';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const DataCardViewRequestAccess: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const { datacard, metadata } = state || {};

  if (!datacard || !metadata) return <div>Missing data</div>;

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
          <h2 className="title-container"> Data Card</h2>
          {datacard.map((item: any, idx: number) => (
            <div key={idx} className="datacard-section">
              <p>
                <strong>Filename:</strong> {item.fullPath}
              </p>
              <p>
                <strong>Last Modified:</strong>
                {item.modified}
              </p>
              {Object.entries(item.content).map(([k, v]) => (
                <p key={k}>
                  <strong>{k}:</strong> {String(v)}
                </p>
              ))}
              <hr />
            </div>
          ))}

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
