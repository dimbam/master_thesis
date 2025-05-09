import React, { useState } from 'react';
import '../.././RequesterSearch.css';
// import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const RequesterSearch: React.FC = () => {
  const navigate = useNavigate();
  const [searchValue, setsearchValue] = useState('');
  //   const location = useLocation();
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
        <button className="search-button">Search</button>
      </div>

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
      </div>
    </div>
  );
};

export default RequesterSearch;
