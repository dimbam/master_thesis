import React, { useEffect, useState } from 'react';
import '.././CreateDataCard.css';
import { useParams, useNavigate } from 'react-router-dom';

const DataCardList = () => {
  const { dataset_id } = useParams<{ dataset_id: string }>();
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!dataset_id) return;

    fetch(`http://localhost:5000/datacards/${dataset_id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not Found');
        return res.json();
      })
      .then(setCard)
      .catch(() => setCard(null))
      .finally(() => setLoading(false));
  }, [dataset_id]);

  if (loading) return <div>Loading...</div>;

  if (!card) return <div>Data Card not found</div>;

  return (
    <div className="requester-dashboard-wrapper">
      <div className="search-page">
        <div className="main_dashboard-header">
          <h1 className="main_dashboard_title">Available Data Cards</h1>
          <div className="filter-buttons-container"></div>
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

        <div style={{ color: 'black' }} className="card">
          <p>
            <strong>Dataset ID:</strong> {card.dataset_id}
          </p>
          <p>
            <strong>Title:</strong> {card.title}
          </p>
          <p>
            <strong>Creator:</strong> {card.creator}
          </p>
          <p>
            <strong>Description:</strong> {card.description}
          </p>
          <p>
            <strong>License:</strong> {card.license}
          </p>
          <p>
            <strong>Intended Use:</strong> {card.intended_use}
          </p>
          <p>
            <strong>Source:</strong> {card.source}
          </p>
          <p>
            <strong>Purpose:</strong> {card.purpose}
          </p>
          <p>
            <strong>Limitations:</strong> {card.limitations}
          </p>
          <p>
            <strong>GDPR Compliant:</strong> {card.gdpr_compliant ? 'Yes' : 'No'}
          </p>
          <p>
            <strong>Anonymized:</strong> {card.anonymized ? 'Yes' : 'No'}
          </p>
          <p>
            <strong>Risk of Harm:</strong> {card.risk_of_harm}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataCardList;
