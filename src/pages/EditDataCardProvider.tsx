import React, { useEffect, useState } from 'react';
import '.././EditDataCardProvider.css';
import { useNavigate, useLocation } from 'react-router-dom';

const EditDataCard: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { datacard, metadata } = state || {};

  const [isEditing, setIsEditing] = useState(false);
  const [editableCard, setEditableCard] = useState<any>(
    datacard?.[0]?.content ? { ...datacard[0].content } : {},
  );
  const [editableMetadata, setEditableMetadata] = useState<any>({ ...metadata });

  if (!datacard || !metadata) return <div>Missing data</div>;

  const handleSave = async () => {
    const email = localStorage.getItem('email');
    const filename = datacard[0].fullPath.split('/').pop();

    const mergedContent = {
      ...editableCard,
      __metadata__: editableMetadata, // optional wrapper key to separate them
    };

    try {
      const res = await fetch('http://localhost:5000/upload-datacard-minio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          filename,
          ...mergedContent,
        }),
      });

      if (!res.ok) throw new Error('Failed to save changes');

      alert('Changes saved!');
      setIsEditing(false);
    } catch (err) {
      console.error('Save error:', err);
      alert('Error saving changes');
    }
  };

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
      </div>
      <div className="card-center-wrapper">
        <div className="card">
          <h2 className="title-container">Data Card</h2>
          {datacard.map((item: any, idx: number) => (
            <div key={idx} className="datacard-section">
              <p>
                <strong>Filename:</strong> {item.fullPath}
              </p>
              <p>
                <strong>Last Modified:</strong> {item.modified}
              </p>
              {Object.entries(editableCard).map(([k, v]) => (
                <p key={k}>
                  <strong>{k}:</strong>
                  {isEditing ? (
                    <input
                      type="text"
                      value={v}
                      onChange={(e) =>
                        setEditableCard((prev: any) => ({ ...prev, [k]: e.target.value }))
                      }
                      className="editable-input"
                    />
                  ) : (
                    <span>{String(v)}</span>
                  )}
                </p>
              ))}
              <hr />
            </div>
          ))}

          <div className="metadata-section">
            <h3 className="title-container">Extracted Metadata</h3>
            {Object.entries(editableMetadata).map(([k, v]) => (
              <p key={k}>
                <strong>{k}:</strong>
                {isEditing ? (
                  <input
                    type="text"
                    value={typeof v === 'object' ? JSON.stringify(v) : String(v)}
                    onChange={(e) => {
                      let newVal = e.target.value;
                      try {
                        newVal = JSON.parse(newVal);
                      } catch {}
                      setEditableMetadata((prev: any) => ({ ...prev, [k]: newVal }));
                    }}
                    className="editable-input"
                  />
                ) : (
                  <span className="wrapped-text">{JSON.stringify(v)}</span>
                )}
              </p>
            ))}
          </div>
          <div className="save_cancel_button-container">
            <button onClick={() => setIsEditing((prev) => !prev)} className="save_cancel_button">
              {isEditing ? 'Cancel Edit' : 'Edit'}
            </button>
            {isEditing && (
              <button onClick={handleSave} className="save_cancel_button">
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditDataCard;
