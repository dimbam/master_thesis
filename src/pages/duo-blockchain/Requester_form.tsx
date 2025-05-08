import React, { useState } from 'react';
import { DUO_METADATA } from './DUO_METADATA';
import '../.././CreateDataset.css';
import { getEmailsViaGateway } from './../ReturnEmails';
import TooltipInfo from './../TooltipInfo';
import { useNavigate } from 'react-router-dom';

export default function Requesterform() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    'DUO:0000001': true,
    'DUO:0000017': false,
  });
  const [diseaseSearch, setDiseaseSearch] = useState('');
  const [diseaseOptions, setDiseaseOptions] = useState<{ label: string; id: string }[]>([]);
  const [selectedDiseases, setSelectedDiseases] = useState<{ label: string; id: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [emails, setEmails] = useState<string[]>([]);

  const [selectedValue43, setSelectedValue43] = useState<string[]>([]);
  const [selectedValue43text, setSelectedValue43text] = useState('');
  const [clinicalCareDeclaration, setclinicalCareDeclaration] = useState(false);

  const fetchDiseases = async () => {
    if (!diseaseSearch.trim()) {
      setSearchError('Please enter a search term.');
      setDiseaseOptions([]);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    try {
      const url = `https://data.bioontology.org/search?q=${encodeURIComponent(
        diseaseSearch,
      )}&ontologies=MONDO,SNOMEDCT&pagesize=20&semantic_types=T047`;
      const res = await fetch(url, {
        headers: { Authorization: `apikey token=1800812d-fa54-4827-b723-e9839199e985` },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }
      const json = await res.json();
      const opts = (json.collection || []).map((item: any) => {
        const uri: string = item['@id'];
        const last = uri.split('/').pop()!;
        const [ont, code] = last.split('_', 2);
        return {
          label: item.prefLabel as string,
          id: `${ont}:${code}`,
        };
      });
      setDiseaseOptions(opts);
      if (opts.length === 0) {
        setSearchError('No matches found.');
      }
    } catch (e: any) {
      console.error('BioPortal fetch error:', e);
      setSearchError(`Fetch error: ${e.message}`);
      setDiseaseOptions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleExpand = (code: string) => setExpanded((e) => ({ ...e, [code]: !e[code] }));
  const toggleSelect = (code: string) => setSelected((s) => ({ ...s, [code]: !s[code] }));

  const childrenOf = (rootCode: string) =>
    Object.entries(DUO_METADATA).filter(([, meta]) => meta.subclassOf === rootCode);

  // const save = () => {
  //   const codes = Object.entries(selected)
  //     .filter(([, v]) => v)
  //     .map(([k]) => k);

  //   const stored = localStorage.getItem('datasets');
  //   const arr = stored ? JSON.parse(stored) : [];
  //   arr.unshift({
  //     name,
  //     duoCodes: codes,
  //     metadata: selected['DUO:0000007'] ? { diseases: selectedDiseases.map((d) => d.id) } : {},
  //     created: new Date().toISOString(),
  //   });
  //   localStorage.setItem('datasets', JSON.stringify(arr));
  //   alert('Dataset saved!');
  // };

  const saveJson = () => {
    const formData = {
      name,
      selected,
      selectedValue43,
      selectedValue43text,
      clinicalCareDeclaration,
    };

    const jsonBlob = new Blob([JSON.stringify(formData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(jsonBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'form_data.json';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Free memory
  };

  const renderNode = (code: string) => {
    const meta = DUO_METADATA[code]!;
    const children = childrenOf(code);
    const isSelected = selected[code];
    const isExpanded = expanded[code];

    return (
      <div key={code} style={{ marginLeft: 16, marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {children.length > 0 && (
            <span
              style={{ cursor: 'pointer', fontWeight: 'bold', marginRight: 6 }}
              onClick={() => toggleExpand(code)}
            >
              {isExpanded ? '[-]' : '[+]'}
            </span>
          )}
          <label style={{ display: 'flex', alignItems: 'center' }}>
            {children.length === 0 && (
              <input
                type="checkbox"
                checked={!!isSelected}
                onChange={() => toggleSelect(code)}
                disabled={selected['DUO:0000004'] && code !== 'DUO:0000004'}
              />
            )}
            <span style={{ marginLeft: 8 }}>
              {code == 'DUO:0000043' ? 'Intended Use' : meta.label} ({code})
              <TooltipInfo text={meta.definition} />
            </span>
          </label>
        </div>

        {isSelected && code === 'DUO:0000043' && (
          <div style={{ marginTop: 12, marginLeft: 48 }}>
            <strong>Profession: </strong>
            {[
              'Physician ',
              'Nurse Practitioner',
              'Radiologist',
              'Healthcare Institution',
              'Other',
            ].map((option) => (
              <label key={option} style={{ display: 'block' }}>
                <input
                  type="checkbox"
                  checked={selectedValue43.includes(option)}
                  onChange={() => {
                    setSelectedValue43((prev) =>
                      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option],
                    );
                  }}
                />
                <span style={{ marginLeft: 8 }}>{option}</span>
              </label>
            ))}
            {selectedValue43.includes('Other') && (
              <input
                type="text"
                placeholder="Please specify"
                value={selectedValue43text}
                onChange={(e) => setSelectedValue43text(e.target.value)}
                style={{
                  marginTop: 8,
                  padding: 6,
                  fontSize: 14,
                  width: '100%',
                  maxWidth: 400,
                  boxSizing: 'border-box',
                }}
              />
            )}
          </div>
        )}

        {isSelected && code === 'DUO:0000043' && (
          <div style={{ marginTop: 12, marginLeft: 48 }}>
            <label>
              <input
                type="checkbox"
                checked={clinicalCareDeclaration}
                onChange={() => setclinicalCareDeclaration((prev) => !prev)}
              />
              <strong>
                <span style={{ marginLeft: 10 }}>
                  Clinical Care Use Declaration (Including Home-Based Care)
                </span>
              </strong>
            </label>
            {clinicalCareDeclaration && (
              <div className="clinical_care_form" style={{ marginTop: 12, marginLeft: 48 }}>
                <strong>By selecting Clinical Care Use, the requester affirms that:</strong>

                <h3 style={{ marginTop: 16, fontWeight: 'bold', fontSize: '1rem' }}>
                  The data will be used solely for the purpose of clinical care and decision-making.
                </h3>
                <h3 style={{ marginTop: 16 }}>
                  <strong>1. Permitted Settings</strong>
                </h3>
                <p style={{ marginLeft: 10 }}>
                  Clinical care is defined to include, but is not limited to:
                  <ul style={{ marginLeft: 10 }}>
                    <li>- In-hospital care</li>
                    <li>- Outpatient clinic visits</li>
                    <li>- Licensed home-based care</li>
                    <li>- Telemedicine consultations</li>
                  </ul>
                </p>

                <h3>
                  <strong>2. Care at Home (or Remote)</strong>
                </h3>
                <p style={{ marginLeft: 10 }}>
                  If clinical care is provided at the patient’s home or through remote platforms:
                  <ul style={{ marginLeft: 10 }}>
                    <li>- The requester must be licensed and authorized to deliver such care;</li>
                    <li>
                      - The data must be used only for supporting care of an identifiable patient or
                      case;
                    </li>
                    <li>
                      - The requester must provide a brief description of the care setting and
                      clinical context.
                    </li>
                  </ul>
                </p>

                <h3 style={{ marginTop: 16 }}>
                  <strong>I, hereby certify that:</strong>
                </h3>
                <p>
                  <ul style={{ marginLeft: 10 }}>
                    <li>
                      - I am a licensed healthcare provider or authorized clinical staff member;
                    </li>
                    <li>
                      - The data requested will be used exclusively for a clinical care episode;
                    </li>
                    <li>
                      - If the care is provided at home or remotely, I am authorized to deliver such
                      care under applicable law;
                    </li>
                    <li>
                      - I will not use the data for research, teaching, commercial, or model
                      training purposes.
                    </li>
                  </ul>
                </p>
              </div>
            )}
          </div>
        )}

        {children.length > 0 && isExpanded && (
          <div style={{ marginLeft: 16 }}>
            {children.map(([childCode]) => renderNode(childCode))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="create-dataset-page">
      <div className="form" style={{ padding: 16 }}>
        <h2 className="title-container">Create Dataset</h2>
        <div style={{ marginBottom: 12 }}>
          <input
            placeholder="Dataset Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '30%', padding: 8, fontSize: 16 }}
          />
        </div>

        <h3>Select DUO Permissions</h3>
        <div>{['DUO:0000001', 'DUO:0000017'].map((root) => renderNode(root))}</div>

        <button className="button_col" onClick={saveJson}>
          Download Form
        </button>
        <button onClick={() => navigate('/')} className="back-button">
          Logout
        </button>

        <button onClick={() => navigate('/maindashboard')} className="back-button">
          Back
        </button>
      </div>
    </div>
  );
}
