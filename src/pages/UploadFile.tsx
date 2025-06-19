import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const UploadPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const email = localStorage.getItem('email');
    const formName = localStorage.getItem('formName') || 'datacard';

    formData.append('email', email);
    // The uploaded file doesn't get a .json or .csv in the name setting so it only takes the name passed initially in the CreateForm page
    formData.append('filename', formName);

    try {
      const res = await fetch('http://localhost:5000/upload-dataset', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      alert('Upload successful!');

      const datasetPath = `${email}/dataset/${formName}`;
      const dataCardPath = `${email}/data-card/${formName}.json`;

      const [cardRes, metaRes] = await Promise.all([
        fetch(`http://localhost:5000/get-datacard?path=${encodeURIComponent(dataCardPath)}`),
        fetch(`http://localhost:5000/extract-metadata?path=${encodeURIComponent(datasetPath)}`),
      ]);

      if (!cardRes.ok || !metaRes.ok) throw new Error('Failed to fetch metadata or datacard');

      const cardData = await cardRes.json();
      const metadata = await metaRes.json();

      navigate('/editdatacard', { state: { datacard: cardData, metadata } });
    } catch (err) {
      console.error('Upload or fetch error: ', err);
      alert('Error opening data card');
    }
  };

  return (
    <div style={{ padding: 32 }}>
      <div className="main_dashboard-header">
        <h1 className="main_dashboard_title">Upload File</h1>
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
      <button onClick={handleFileSelect}>Upload to MinIO</button>
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />
    </div>
  );
};

export default UploadPage;
