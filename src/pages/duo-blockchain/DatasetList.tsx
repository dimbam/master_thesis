import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DatasetList() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  const load = () => {
    const json = localStorage.getItem('datasets');
    if (json) setDatasets(JSON.parse(json));
  };

  return (
    <div style={{ padding: '1rem' }}>
      <button
        style={{ padding: '0.5rem 1rem', marginBottom: '1rem' }}
        onClick={() => navigate('/createDataset')}
      >
        Create New Dataset
      </button>

      {datasets.length === 0 ? (
        <p>No datasets available.</p>
      ) : (
        datasets.map((item, i) => (
          <div
            key={i}
            onClick={() => navigate('/datasetDetail', { state: item })}
            style={{
              padding: '1rem',
              borderBottom: '1px solid #ddd',
              cursor: 'pointer',
            }}
          >
            <h3 style={{ margin: 0 }}>{item.name}</h3>
            <p style={{ margin: '0.5rem 0', color: '#666' }}>
              Permissions: {item.duoCodes?.join(', ') || 'None'}
            </p>
            {item.metadata?.disease && (
              <p style={{ margin: 0, color: '#666' }}>
                Disease constraint: {item.metadata.disease}
              </p>
            )}
          </div>
        ))
      )}
    </div>
  );
}
