import React, { useState } from 'react';

const CreateDataCard = () => {
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
    gdpr_compliant: false,
    anonymized: false,
    risk_of_harm: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/create-datacard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    alert(res.ok ? 'Created!' : 'Error');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Data Card</h2>
      <div className="modelcardform">
        <input name="dataset_id" placeholder="ID" onChange={handleChange} required />
        <input name="title" placeholder="Title" onChange={handleChange} required />
        <textarea name="description" placeholder="Description" onChange={handleChange} />
        <input name="creator" placeholder="Creator" onChange={handleChange} />
        <input name="source" placeholder="Source" onChange={handleChange} />
        <input name="purpose" placeholder="Purpose" onChange={handleChange} />
        <input name="intended_use" placeholder="Intended Use" onChange={handleChange} />
        <input name="license" placeholder="License" onChange={handleChange} />
        <input name="limitations" placeholder="Limitations" onChange={handleChange} />
        <input name="risk_of_harm" placeholder="Risk of Harm" onChange={handleChange} />
        <label>
          <input type="checkbox" name="gdpr_compliant" onChange={handleChange} /> GDPR Compliant
        </label>
        <label>
          <input type="checkbox" name="anonymized" onChange={handleChange} /> Anonymized
        </label>
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};

export default CreateDataCard;
