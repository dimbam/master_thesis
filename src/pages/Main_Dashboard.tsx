import React from 'react';
import '.././Main_Dashboard.css';
// import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const MainDashboard: React.FC = () => {
  const navigate = useNavigate();
  //   const location = useLocation();
  return (
    <div>
      <div className="main_dashboard-header">
        <h1 className="main_dashboard_title">Dashboard</h1>
        <span onClick={() => navigate('/')} className="dashboard-back-button">
          Logout
        </span>
      </div>
      <div className="dashboard-main-buttons-container">
        <div className="dashboard-dropdown">
          <span className="dashboard-main-button">Dataset</span>
          <div className="dropdown-content">
            <div onClick={() => navigate('/createDataset')}>Create Dataset</div>
            <div onClick={() => navigate('/viewdataset')}>View Dataset</div>
          </div>
        </div>

        <div className="dashboard-dropdown">
          <span className="dashboard-main-button">Model Card</span>
          <div className="dropdown-content">
            <div onClick={() => navigate('/createDataset')}>Create Dataset</div>
            <div onClick={() => navigate('/viewdataset')}>View Dataset</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
