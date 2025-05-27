import React, { useRef } from 'react';

const UploadPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

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
