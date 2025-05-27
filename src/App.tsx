// import { useState } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Register_waitpage from './pages/Register_waitpage';
import LoginSuccess from './pages/Login_success';
import MainDashboard from './pages/Main_Dashboard';
import DatasetDashboard from './pages/Dataset_Dashboard';
import ModelcardDashboard from './pages/ModelcardDashboard';
import CreateDataset from './pages/duo-blockchain/CreateDataset';
import Requesterform from './pages/duo-blockchain/Requester_form';
import RequesterSearch from './pages/duo-blockchain/Requester_Dashboard';
import FilteredForm from './pages/duo-blockchain/FilteredForm';
import Store from './pages/Store_string';
import CreateDataCard from './pages/createDataCard';
import DataCardList from './pages/ViewDataCardList';
import UploadPage from './pages/UploadFile';
import logo from '.././luce.png';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="App">
      <div className="left-section">
        <h1 className="welcome-title">Welcome</h1>
        <div className="logo-section">
          <span className="site-title">
            ​LUCE (License accoUntability and CompliancE) is a decentralized, blockchain-based
            data-sharing platform designed to monitor and enforce data license accountability and
            compliance. Its primary objective is to provide transparency and trust in data-sharing
            practices by enabling the tracking of data usage in accordance with individual user
            consent. The platform records data transactions on a blockchain, ensuring that data
            usage aligns with the specified licensing terms. This approach facilitates compliance
            with legal and ethical standards, such as those outlined in the General Data Protection
            Regulation (GDPR). LUCE supports users' rights to access, rectify, and erase their data,
            thereby promoting responsible data management and fostering trust among stakeholders. By
            providing a transparent and decentralized mechanism for monitoring data reuse, LUCE aims
            to encourage data sharing while ensuring adherence to licensing agreements and
            regulatory requirements.
          </span>
          <img src={logo} alt="Logo background" className="logo-background" />
          <h2 className="white_backgr_text">
            Learn more about LUCE{' '}
            <a
              className="luce_ref"
              href="https://www.sciencedirect.com/science/article/pii/S2096720922000434"
            >
              here
            </a>
          </h2>
        </div>
      </div>

      <div className="right-section">
        <div className="top-right-buttons">
          <button onClick={() => navigate('/register')}>Sign Up</button>
          {/* <button onClick={() => navigate('/login')}>Login</button>
          <button onClick={() => navigate('/store')}>Store</button> */}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registerwait" element={<Register_waitpage />} />
        <Route path="/loginsuccess" element={<LoginSuccess />} />
        <Route path="/maindashboard" element={<MainDashboard />} />
        <Route path="/datasetdashboard" element={<DatasetDashboard />} />
        <Route path="/modelcarddashboard" element={<ModelcardDashboard />} />
        <Route path="/createDataset" element={<CreateDataset />} />
        <Route path="/requesterform" element={<Requesterform />} />
        <Route path="/requestersearch" element={<RequesterSearch />} />
        <Route path="/filteredform" element={<FilteredForm />} />
        <Route path="/createdatacard" element={<CreateDataCard />} />
        <Route path="/datacards" element={<DataCardList />} />
        <Route path="/uploadfile" element={<UploadPage />} />
        <Route path="/store" element={<Store />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
