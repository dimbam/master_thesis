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

    formData.append('email', email);

    try {
      const res = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        alert('Upload successful!');
      } else {
        alert('Upload failed.');
      }
    } catch (err) {
      console.error('Upload error: ', err);
      alert('Error uploading file');
    }
  };

  return (
    <div style={{ padding: 32 }}>
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
