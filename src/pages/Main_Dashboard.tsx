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
      <div className="dashboard-main-buttons-container">
        <div className="dashboard-dropdown">
          <span className="dashboard-main-button">Provider</span>
          <div className="dropdown-content">
            <div onClick={() => navigate('/createDataset')}>Create Dataset Form</div>
            <div onClick={() => navigate('/createform')}>Create Dataset Form (Updated)</div>
            <div onClick={() => navigate('/createdatacard')}>Create Data Card</div>
            <div onClick={() => navigate('/uploadfile')}>Upload File</div>
          </div>
        </div>

        <div className="dashboard-dropdown">
          <span className="dashboard-main-button">Requester</span>
          <div className="dropdown-content">
            <div onClick={() => navigate('/requesterform')}>View Requester Form --old version</div>
            <div onClick={() => navigate('/requestersearch')}>Open Requester Search Page</div>
            <div onClick={() => navigate('/requesterDashbUpd')}>
              Open Requester Search Page -- new version from db
            </div>
            {/* <div onClick={() => navigate('/datacards')}>View Data Card</div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
