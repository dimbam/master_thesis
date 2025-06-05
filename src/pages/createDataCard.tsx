import React, { useState } from 'react';
import '.././CreateDataCard.css';
import { useNavigate } from 'react-router-dom';

const CreateDataCard = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    dataset_id: '',
    title: '',
    description: '',
    creator: '',
    source: '',
    purpose: '',
    intended_use: '',
    license: '',
    limitations: '',
    risk_of_harm: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, type, value, checked } = e.target;

    setForm((prevForm) => ({
      ...prevForm,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:5000/create-datacard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      alert(res.ok ? 'Created!' : 'Error');
      if (res.ok) {
        navigate('/maindashboard');
      }
    } catch (err) {
      alert('Connection error');
      console.error(err);
    }
  };

  return (
    <div className="requester-dashboard-wrapper">
      <div className="search-page">
        <div className="main_dashboard-header">
          <h1 className="main_dashboard_title">Create Data Card</h1>
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

        <form onSubmit={handleSubmit}>
          <input
            name="dataset_id"
            placeholder="ID"
            value={form.dataset_id}
            onChange={handleChange}
            required
            style={{ marginTop: '20%' }}
          />
          <input
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
          />
          <input
            name="creator"
            placeholder="Creator"
            value={form.creator}
            onChange={handleChange}
          />
          <input name="source" placeholder="Source" value={form.source} onChange={handleChange} />
          <input
            name="purpose"
            placeholder="Purpose"
            value={form.purpose}
            onChange={handleChange}
          />
          <input
            name="intended_use"
            placeholder="Intended Use"
            value={form.intended_use}
            onChange={handleChange}
          />
          <input
            name="license"
            placeholder="License"
            value={form.license}
            onChange={handleChange}
          />
          <input
            name="limitations"
            placeholder="Limitations"
            value={form.limitations}
            onChange={handleChange}
          />
          <input
            name="risk_of_harm"
            placeholder="Risk of Harm"
            value={form.risk_of_harm}
            onChange={handleChange}
          />
          <div className="dashboard-main-buttons-container">
            <button type="submit" className="dashboard-main-button">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDataCard;
