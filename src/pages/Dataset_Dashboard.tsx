// Not used anymore
import React, { useEffect, useState } from 'react';
import './../DatasetDashboard.css';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import TooltipInfo from './TooltipInfo';

const DatasetDashboard: React.FC = () => {
  const [showForm, setShowForm] = useState(false);

  const handleToggleForm = () => {
    setShowForm((prev) => !prev); // toggle visibility
  };

  useEffect(() => {
    // Add a special class to <body> ONLY for this page
    document.body.classList.add('dataset-dashboard-body');

    // Clean up when leaving the page
    return () => {
      document.body.classList.remove('dataset-dashboard-body');
    };
  }, []);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="dataset-dashboard-page">
      <h1 className="dataset-dashboard-title">Dataset Dashboard</h1>

      <div className="dataset-dashboard-title-spacer"></div>
      <button className="dataset-dashboard-upload-btn" onClick={handleToggleForm}>
        Upload Dataset
      </button>
      {showForm && (
        <form className="dataset-dashboard-upload-form">
          <label>
            Dataset Name:
            <input type="text" name="dataset-dashboard-datasetName" />
          </label>

          <label>
            Description:
            <textarea name="dataset-dashboard-description" rows={4} />
          </label>

          <label>
            Upload File:
            <input type="file" name="dataset-dashboard-fileUpload" />
          </label>

          <p className="dataset-dashboard-form-title">Data-sharing consent preferences</p>

          {/* 1. No restrictions */}
          <fieldset>
            <legend>
              <strong>No restrictions (NRES)</strong>
              <TooltipInfo text="No restrictions on using the data" />
            </legend>
            <label>
              <input type="radio" name="nres-use" />
              Yes
            </label>
            <label>
              <input type="radio" name="nres-use" />
              No
            </label>
          </fieldset>

          {/* 2. General research use and clinical care */}
          <fieldset>
            <legend>
              <strong>General research use and clinical care (GRU-CC)</strong>
            </legend>
            <label>
              <input type="checkbox" name="gru-health" />
              For health, medical or biomedical purposes
            </label>
            <label>
              <input type="checkbox" name="gru-ancestry" />
              Includes population origin or ancestry study
            </label>
          </fieldset>

          {/* 3. Health, Medical or Biomedical research and clinical care */}
          <fieldset>
            <legend>
              <strong>Health, Medical or Biomedical research and clinical care (HMB-CC)</strong>
            </legend>
            <label>
              <input type="checkbox" name="hmb-health" />
              Limited to HMB purposes
            </label>
            <label>
              <input type="checkbox" name="hmb-noancestry" />
              Excludes population origin or ancestry study
            </label>
          </fieldset>

          {/* 4. Open dataset to population and ancestry research */}
          <fieldset>
            <legend>
              <strong>Open the dataset to population and ancestry research (POA)</strong>
            </legend>
            <label>
              <input type="radio" name="poa-ancestry" />
              Yes
            </label>
            <label>
              <input type="radio" name="poa-ancestry" />
              No
            </label>
          </fieldset>

          {/* 5. Disease-specific research and clinical care */}
          <fieldset>
            <legend>
              <strong>Disease specific research and clinical care (DS-[XX]-CC)</strong>
              <TooltipInfo text="Use of the data must be related to a disease" />
            </legend>
            <label>
              <input type="radio" name="ds-disease" />
              Yes
            </label>
            <label>
              <input type="radio" name="ds-disease" />
              No
            </label>
          </fieldset>

          <button type="submit" className="dataset-dashboard-submit-blue">
            Submit
          </button>
        </form>
      )}
      {/* <button className="dataset-dashboard-upload-btn" onClick={''}>
        View Uploaded Datasets
      </button> */}
      <div className="back-button">
        <button className="back_button" onClick={() => navigate('/MainDashboard')}>
          Back
        </button>
      </div>
    </div>
  );
};

export default DatasetDashboard;
