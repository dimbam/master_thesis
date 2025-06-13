import { useState } from 'react';
import { DUO_METADATA } from './DUO_METADATA';
import '../.././CreateDataset.css';
import '../.././Main_Dashboard.css';
import TooltipInfo from './../TooltipInfo';
import { useNavigate } from 'react-router-dom';
import { validateFieldSet } from './FormValidation';

const MAIN_CODES = [
  'DUO:0000001',
  'DUO:0000018',
  'DUO:0000050',
  'DUO:0000051',
  'DUO:0000052',
  'DUO:0000053',
  'DUO:0000054',
];

export default function CreateForm() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [currentMainIndex, setCurrentMainIndex] = useState(0);

  const [diseaseSearch, setDiseaseSearch] = useState('');
  const [diseaseOptions, setDiseaseOptions] = useState<{ label: string; id: string }[]>([]);
  const [selectedDiseases, setSelectedDiseases] = useState<{ label: string; id: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedValue11, setSelectedValue11] = useState('');
  const [orgID, setorgID] = useState('');
  const [selectedValue19, setSelectedValue19] = useState('');
  const [selectedValue22, setSelectedValue22] = useState('');
  const [selectedValue22dropcontinents, setSelectedValue22dropcontinents] = useState('');
  const [selectedValue22dropgroups, setSelectedValue22dropgroups] = useState('');
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  // const [emails, setEmails] = useState<string[]>([]);
  // const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [selectedValue43, setSelectedValue43] = useState<string[]>([]);
  const [selectedValue20investigatorName, setSelectedValue20investigatorName] = useState('');
  const [selectedValue20investigatorcontact, setSelectedValue20investigatorcontact] = useState('');
  const [selectedValue20collaborationtype, setSelectedValue20collaborationtype] = useState('');
  const [selectedValue20requiredaction, setSelectedValue20requiredaction] = useState('');
  const [selectedValue21approvaltype, setSelectedValue21approvaltype] = useState<string[]>([]);
  const [otherApprovalText, setOtherApprovalText] = useState('');
  const [selectedValue21contact, setSelectedValue21contact] = useState('');
  const [confirmedExclusion, setConfirmedExclusion] = useState(false);
  const [selectedValue15methodPurpose, setSelectedValue15methodPurpose] = useState<string[]>([]);
  const [selectedValue27requirement, setSelectedValue27requirement] = useState(false);
  const [selectedValue27fair, setSelectedValue27fair] = useState(false);
  const [selectedValue43text, setSelectedValue43text] = useState('');
  const [clinicalCareDeclaration, setclinicalCareDeclaration] = useState(false);
  const [institutionName, setinstitutionName] = useState('');
  const [dataReturnCommitment, setdataReturnCommitment] = useState(false);
  const [institutionalApproval, setInstitutionalApproval] = useState('');
  const [blockMetadata, setblockMetadata] = useState('');
  const [selectedValue18noRestriction, setselectedValue18noRestriction] = useState(false);
  const [countries, setCountries] = useState<string[]>([]);

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

  const fetchCountries = async () => {
    try {
      const res = await fetch('https://restcountries.com/v3.1/all');
      const data = await res.json();
      const names = data.map((country: any) => country.name.common).sort();
      setCountries(names);
    } catch (err) {
      console.error('Error fetching countries:', err);
    }
  };

  const toggleExpand = (code: string) => setExpanded((e) => ({ ...e, [code]: !e[code] }));
  const toggleSelect = (code: string) => setSelected((s) => ({ ...s, [code]: !s[code] }));

  const childrenOf = (rootCode: string) =>
    Object.entries(DUO_METADATA).filter(([, meta]) => meta.subclassOf === rootCode);

  function renderMainQuestionWithChildren(code: string) {
    const meta = DUO_METADATA[code]!;
    const children = childrenOf(code);

    return (
      <div key={code}>
        {renderNode(code)}
        {children.length > 0 && (
          <div style={{ marginLeft: 24 }}>
            {children.map(([childCode]) => renderNode(childCode))}
          </div>
        )}
      </div>
    );
  }

  const saveJson = () => {
    const formData = {
      name,
      selected,
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
      <div key={code} style={{ marginLeft: 16, marginBottom: 8, marginTop: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* {children.length > 0 && (
            <span
              style={{ cursor: 'pointer', fontWeight: 'bold', marginRight: 6 }}
              onClick={() => setExpanded((e) => ({ ...e, [code]: !e[code] }))}
            >
              {isExpanded ? '[-]' : '[+]'}
            </span>
          )} */}
          <label style={{ display: 'flex', alignItems: 'center' }}>
            {children.length === 0 && (
              <input
                type="checkbox"
                checked={!!isSelected}
                onChange={() => setSelected((s) => ({ ...s, [code]: !s[code] }))}
              />
            )}
            <span style={{ marginLeft: 8 }}>
              {meta.label}
              <TooltipInfo text={meta.definition} />
            </span>
          </label>
        </div>

        {isSelected && code === 'DUO:0000007' && (
          <div style={{ marginTop: 12, marginLeft: 24 }}>
            <input
              placeholder="Type a disease keyword..."
              value={diseaseSearch}
              onChange={(e) => setDiseaseSearch(e.target.value)}
              style={{
                width: 'calc(50% - 90px)',
                padding: 8,
                fontSize: 16,
                display: 'inline-block',
                marginRight: 8,
              }}
            />
            <button
              className="button_col"
              onClick={fetchDiseases}
              style={{ padding: '8px 12px', fontSize: 14 }}
            >
              Search
            </button>
            {isSearching && <div>Loading...</div>}
            {searchError && <div style={{ color: 'red' }}>{searchError}</div>}
            {diseaseOptions.map((opt) => (
              <div
                key={opt.id}
                style={{ cursor: 'pointer', marginTop: 4 }}
                onClick={() => {
                  if (!selectedDiseases.find((d) => d.id === opt.id)) {
                    setSelectedDiseases((prev) => [...prev, opt]);
                  }
                  setDiseaseSearch('');
                  setDiseaseOptions([]);
                }}
              >
                {opt.label}
              </div>
            ))}
            {selectedDiseases.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <strong>Selected Diseases:</strong>
                {selectedDiseases.map((d) => (
                  <div key={d.id} style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
                    <span>{d.label}</span>
                    <button
                      className="button_col"
                      onClick={() =>
                        setSelectedDiseases((prev) => prev.filter((x) => x.id !== d.id))
                      }
                      style={{ marginLeft: 8 }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {isSelected && code === 'DUO:0000011' && (
          <div style={{ marginTop: 12, marginLeft: 24 }}>
            <select
              value={selectedValue11}
              onChange={(e) => setSelectedValue11(e.target.value)}
              style={{ padding: 8, fontSize: 16, width: '300px' }}
            >
              <option value="">Select an option</option>
              <option value="europe">Europe</option>
              <option value="asia">Asia</option>
              <option value="africa">Africa</option>
            </select>
          </div>
        )}

        {isSelected && code === 'DUO:0000045' && (
          <div style={{ marginTop: 12, marginLeft: 24 }}>
            <input
              placeholder="Type organization ID..."
              value={orgID}
              onChange={(e) => setorgID(e.target.value)}
              style={{
                width: 'calc(50% - 90px)',
                padding: 8,
                fontSize: 16,
                display: 'inline-block',
                marginRight: 8,
              }}
            />
            <button
              className="button_col"
              onClick={() => {
                // To be changed when the button is pressed
                alert(`Saved: ${orgID}`);
              }}
              style={{ padding: '8px 12px', fontSize: 14 }}
            >
              Save
            </button>
          </div>
        )}

        {isSelected && code === 'DUO:0000015' && (
          <div style={{ marginTop: 12, marginLeft: 48 }}>
            <label>
              <input
                type="checkbox"
                checked={confirmedExclusion}
                onChange={() => setConfirmedExclusion((prev) => !prev)}
              />
              <strong>
                <span style={{ marginLeft: 10 }}>Confirm Exclusion of Method Development</span>
              </strong>
            </label>
          </div>
        )}

        {isSelected && code === 'DUO:0000015' && (
          <div style={{ marginTop: 12, marginLeft: 48 }}>
            <strong>Method Purpose: </strong>
            {['Prediction', 'Classification', 'Segmentation', 'Benchmarking'].map((option) => (
              <label key={option} style={{ display: 'block' }}>
                <input
                  type="checkbox"
                  checked={selectedValue15methodPurpose.includes(option)}
                  onChange={() => {
                    setSelectedValue15methodPurpose((prev) =>
                      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option],
                    );
                  }}
                />
                <span style={{ marginLeft: 8 }}>{option}</span>
              </label>
            ))}
          </div>
        )}

        {isSelected && code === 'DUO:0000018' && (
          <div style={{ marginTop: 12, marginLeft: 48 }}>
            <label>
              <input
                type="checkbox"
                checked={selectedValue18noRestriction}
                onChange={() => setselectedValue18noRestriction((prev) => !prev)}
              />
              <strong>
                <span style={{ marginLeft: 10 }}>No Restriction</span>
              </strong>
            </label>
          </div>
        )}

        {isSelected && code === 'DUO:0000019' && (
          <div style={{ marginTop: 12, marginLeft: 24 }}>
            <input
              placeholder="Type publication link or related DOI..."
              value={selectedValue19}
              onChange={(e) => setSelectedValue19(e.target.value)}
              style={{
                width: 'calc(40% - 90px)',
                padding: 8,
                fontSize: 16,
                display: 'inline-block',
                marginRight: 8,
              }}
            />
            <button
              className="button_col"
              onClick={() => {
                // To be changed when the button is pressed
                alert(`Saved: ${selectedValue19}`);
              }}
              style={{ padding: '8px 12px', fontSize: 14 }}
            >
              Save
            </button>
          </div>
        )}

        {isSelected && code === 'DUO:0000020' && (
          <div style={{ marginTop: 6, marginLeft: 48 }}>
            {'Primary Investigator Name(s):'}
            <input
              placeholder="Please add the full name of the primary investigator"
              value={selectedValue20investigatorName}
              onChange={(e) => setSelectedValue20investigatorName(e.target.value)}
              style={{
                width: 'calc(70% - 90px)',
                padding: 8,
                fontSize: 16,
                display: 'inline-block',
                marginRight: 8,
              }}
            />
          </div>
        )}

        {isSelected && code === 'DUO:0000020' && (
          <div style={{ marginTop: 6, marginLeft: 48 }}>
            {'Investigator Contact Info:'}
            <input
              placeholder="Please add the email address of the primary investigator"
              value={selectedValue20investigatorcontact}
              onChange={(e) => setSelectedValue20investigatorcontact(e.target.value)}
              style={{
                width: 'calc(70% - 90px)',
                padding: 8,
                fontSize: 16,
                display: 'inline-block',
                marginRight: 8,
              }}
            />
          </div>
        )}

        {isSelected && code === 'DUO:0000020' && (
          <div style={{ marginTop: 12, marginLeft: 48 }}>
            Collaboration Type:
            <select
              value={selectedValue20collaborationtype}
              onChange={(e) => setSelectedValue20collaborationtype(e.target.value)}
              style={{ padding: 8, fontSize: 16, width: '300px' }}
            >
              <option value="">Select an option</option>
              <option value="Co-authorship">Co-authorship</option>
              <option value="discussion/meeting">Discussion/Meeting</option>
              <option value="Joint data analysis">Joint data analysis</option>
            </select>
          </div>
        )}

        {isSelected && code === 'DUO:0000020' && (
          <div style={{ marginTop: 6, marginLeft: 48 }}>
            {'Required Collaboration Action:'}
            <input
              placeholder="Please add the required collaboration condition"
              value={selectedValue20requiredaction}
              onChange={(e) => setSelectedValue20requiredaction(e.target.value)}
              style={{
                width: 'calc(70% - 90px)',
                padding: 8,
                fontSize: 16,
                display: 'inline-block',
                marginRight: 8,
              }}
            />
          </div>
        )}

        {isSelected && code === 'DUO:0000021' && (
          <div style={{ marginTop: 12, marginLeft: 48 }}>
            <strong>Approval Type Required: </strong>
            {['IRB', 'ERB', 'IEC', 'Institutional Ethics Board', 'Other'].map((option) => (
              <label key={option} style={{ display: 'block' }}>
                <input
                  type="checkbox"
                  checked={selectedValue21approvaltype.includes(option)}
                  onChange={() => {
                    setSelectedValue21approvaltype((prev) =>
                      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option],
                    );
                  }}
                />
                <span style={{ marginLeft: 8 }}>{option}</span>
              </label>
            ))}
            {selectedValue21approvaltype.includes('Other') && (
              <input
                type="text"
                placeholder="Please specify"
                value={otherApprovalText}
                onChange={(e) => setOtherApprovalText(e.target.value)}
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

        {isSelected && code === 'DUO:0000021' && (
          <div style={{ marginTop: 6, marginLeft: 48 }}>
            <strong>{'Review Entity Contact Info:'}</strong>
            <input
              placeholder="Please add the contact information"
              value={selectedValue21contact}
              onChange={(e) => setSelectedValue21contact(e.target.value)}
              style={{
                width: 'calc(70% - 90px)',
                padding: 8,
                fontSize: 16,
                display: 'inline-block',
                marginRight: 8,
              }}
            />
          </div>
        )}

        {isSelected && code === 'DUO:0000021' && (
          <div style={{ marginTop: 6, marginLeft: 48 }}>
            <strong>{'Approval Document Requirements:'}</strong>
            <label>
              Upload File: 📁
              <input
                type="file"
                name="approval-document-fileUpload"
                style={{
                  width: 'calc(70% - 90px)',
                  padding: 8,
                  fontSize: 16,
                  display: 'inline-block',
                  marginRight: 8,
                }}
              />
            </label>
          </div>
        )}

        {isSelected && code === 'DUO:0000022' && (
          <div style={{ marginTop: 12, marginLeft: 24 }}>
            <select
              value={selectedValue22}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedValue22(val);
                if (val === 'Countries') {
                  fetchCountries();
                }
              }}
              style={{ padding: 8, fontSize: 16, width: '300px' }}
            >
              <option value="">Select an option</option>
              <option value="Countries">Countries</option>
              <option value="Continents">Continents</option>
              <option value="Groups/Unions">Groups/Unions</option>
            </select>

            {selectedValue22 === 'Countries' && (
              <div style={{ marginTop: 12, marginLeft: 24 }}>
                <select
                  value=""
                  onChange={(e) => {
                    const country = e.target.value;
                    if (country && !selectedCountries.includes(country)) {
                      setSelectedCountries((prev) => [...prev, country]);
                    }
                  }}
                  style={{ padding: 8, fontSize: 16, width: '300px' }}
                >
                  <option value="">Select a Country</option>
                  {countries.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                {selectedCountries.length > 0 && (
                  <div style={{ marginTop: 12, marginLeft: 24 }}>
                    <strong>Selected Countries:</strong>
                    {selectedCountries.map((country) => (
                      <div
                        key={country}
                        style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}
                      >
                        <span>{country}</span>
                        <button
                          className="button_col"
                          onClick={() =>
                            setSelectedCountries((prev) => prev.filter((c) => c !== country))
                          }
                          style={{ marginLeft: 8 }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedValue22 === 'Continents' && (
              <div style={{ marginTop: 12, marginLeft: 24 }}>
                <select
                  value={selectedValue22dropcontinents}
                  onChange={(e) => setSelectedValue22dropcontinents(e.target.value)}
                  style={{ padding: 8, fontSize: 16, width: '300px' }}
                >
                  <option value="">Select an option</option>
                  <option value="Europe">Europe</option>
                  <option value="Asia">Asia</option>
                  <option value="Africa">Africa</option>
                  <option value="Oceania">Oceania</option>
                  <option value="America">America</option>
                </select>
              </div>
            )}

            {selectedValue22 === 'Groups/Unions' && (
              <div style={{ marginTop: 12, marginLeft: 24 }}>
                <select
                  value={selectedValue22dropgroups}
                  onChange={(e) => setSelectedValue22dropgroups(e.target.value)}
                  style={{ padding: 8, fontSize: 16, width: '300px' }}
                >
                  <option value="">Select a Group/Union</option>
                  <option value="EU">European Union (EU)</option>
                  <option value="AU">African Union (AU)</option>
                  <option value="ASEAN">Association of Southeast Asian Nations (ASEAN)</option>
                  <option value="NAFTA">North American Free Trade Agreement (NAFTA)</option>
                  <option value="MERCOSUR">Southern Common Market (MERCOSUR)</option>
                  <option value="G7">Group of Seven (G7)</option>
                  <option value="G20">Group of Twenty (G20)</option>
                  <option value="UN">United Nations (UN)</option>
                  <option value="OPEC">Organization of Petroleum Exporting Countries (OPEC)</option>
                  <option value="BRICS">BRICS</option>
                  <option value="EFTA">European Free Trade Association (EFTA)</option>
                  <option value="CARICOM">Caribbean Community (CARICOM)</option>
                </select>
              </div>
            )}
          </div>
        )}

        {isSelected && code === 'DUO:0000025' && (
          <div style={{ marginTop: 12, marginLeft: 24 }}>
            <div style={{ display: 'flex', gap: '24px' }}>
              <label style={{ display: 'flex', flexDirection: 'column' }}>
                Start Date:
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    const value = e.target.value;
                    const year = value.split('-')[0];
                    if (year.length === 4 && !isNaN(Number(year))) {
                      setStartDate(value);
                    }
                  }}
                  style={{ display: 'block', padding: 6, fontSize: 14, marginTop: 4 }}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column' }}>
                End Date:
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    const value = e.target.value;
                    const year = value.split('-')[0];
                    if (year.length === 4 && !isNaN(Number(year))) {
                      setEndDate(value);
                    }
                  }}
                  style={{ display: 'block', padding: 6, fontSize: 14, marginTop: 4 }}
                />
              </label>
            </div>
          </div>
        )}

        {isSelected && code === 'DUO:0000026' && (
          <div style={{ marginTop: 12, marginLeft: 24 }}>
            <select
              value={selectedValue22}
              onChange={(e) => setSelectedValue22(e.target.value)}
              style={{ padding: 8, fontSize: 16, width: '300px' }}
            >
              <option value="">Select an option</option>
              <option value="europe">Europe</option>
              <option value="asia">Asia</option>
              <option value="africa">Africa</option>
            </select>
          </div>
        )}

        {isSelected && code === 'DUO:0000027' && (
          <div style={{ marginTop: 12, marginLeft: 48 }}>
            <label>
              <input
                type="checkbox"
                checked={selectedValue27requirement}
                onChange={() => setSelectedValue27requirement((prev) => !prev)}
              />
              <strong>
                <span style={{ marginLeft: 10 }}>
                  Require to be used as part of a research project
                </span>
              </strong>
            </label>
          </div>
        )}

        {isSelected && code === 'DUO:0000027' && (
          <div style={{ marginTop: 12, marginLeft: 48 }}>
            <label>
              <input
                type="checkbox"
                checked={selectedValue27fair}
                onChange={() => setSelectedValue27fair((prev) => !prev)}
              />
              <strong>
                <span style={{ marginLeft: 10 }}>Project supports FAIR principles</span>
              </strong>
            </label>
          </div>
        )}

        {isSelected && code === 'DUO:0000028' && (
          <div style={{ marginTop: 12, marginLeft: 24 }}>
            <span>Institution Name: </span>
            <input
              placeholder="Type the name of the institution..."
              value={institutionName}
              onChange={(e) => setinstitutionName(e.target.value)}
              style={{
                width: 'calc(50% - 90px)',
                padding: 8,
                fontSize: 16,
                display: 'inline-block',
                marginRight: 8,
              }}
            />
          </div>
        )}

        {isSelected && code === 'DUO:0000028' && (
          <div style={{ marginTop: 6, marginLeft: 48 }}>
            <fieldset
              style={{
                display: 'flex',
                alignItems: 'center',
                border: 'none',
                padding: 0,
                gap: '16px',
              }}
            >
              <span style={{ fontWeight: 'bold' }}>Require Institutional Approval? </span>
              <label>
                <input
                  type="radio"
                  name="institutional-approval"
                  value="yes"
                  checked={institutionalApproval === 'yes'}
                  onChange={(e) => setInstitutionalApproval(e.target.value)}
                />
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="institutional-approval"
                  value="no"
                  checked={institutionalApproval === 'no'}
                  onChange={(e) => setInstitutionalApproval(e.target.value)}
                />
                No
              </label>
            </fieldset>
          </div>
        )}

        {isSelected && code === 'DUO:0000029' && (
          <div style={{ marginTop: 12, marginLeft: 48 }}>
            <label>
              <input
                type="checkbox"
                checked={dataReturnCommitment}
                onChange={() => setdataReturnCommitment((prev) => !prev)}
              />
              <strong>
                <span style={{ marginLeft: 10 }}>Data Return Commitment</span>
              </strong>
            </label>
          </div>
        )}

        {isSelected && code === 'DUO:0000043' && (
          <div style={{ marginTop: 12, marginLeft: 48 }}>
            <strong>Allow Access To: </strong>
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

        {isSelected && code === 'DUO:0000044' && (
          <div style={{ marginTop: 6, marginLeft: 48 }}>
            <fieldset
              style={{
                display: 'flex',
                alignItems: 'center',
                border: 'none',
                padding: 0,
                gap: '16px',
              }}
            >
              <span style={{ fontWeight: 'bold' }}>Block Population Metadata ? </span>
              <label>
                <input
                  type="radio"
                  name="block-metadata"
                  value="yes"
                  checked={blockMetadata === 'yes'}
                  onChange={(e) => setblockMetadata(e.target.value)}
                />
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="block-metadata"
                  value="no"
                  checked={blockMetadata === 'no'}
                  onChange={(e) => setblockMetadata(e.target.value)}
                />
                No
              </label>
            </fieldset>
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
      <div className="main_dashboard-header">
        <h1 className="main_dashboard_title">Upload Dataset/Model Card Form</h1>
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
      <div className="form" style={{ padding: 16 }}>
        <h2 className="title-container">Upload Dataset Form</h2>
        <div style={{ marginBottom: 12 }}>
          <strong>Dataset Name:</strong>
          <input
            placeholder="Dataset Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '30%', padding: 8, fontSize: 16 }}
          />
        </div>

        <strong>Select DUO Permissions</strong>
        <div>
          {renderMainQuestionWithChildren(MAIN_CODES[currentMainIndex])}
          <div style={{ marginTop: 24 }}>
            {currentMainIndex < MAIN_CODES.length - 1 ? (
              <>
                <button
                  className="button_col"
                  onClick={() => {
                    const valid = validateFieldSet(selected, [
                      {
                        code: 'DUO:0000007',
                        value: selectedDiseases,
                        type: 'checkbox',
                        message: 'Please type one disease.',
                      },
                      {
                        code: 'DUO:0000015',
                        value: confirmedExclusion,
                        type: 'checkbox',
                        message: 'Please confirm the Exclusion of Method Development.',
                      },
                      {
                        code: 'DUO:0000015',
                        value: selectedValue15methodPurpose,
                        type: 'checkbox',
                        message: 'Please select Method Purpose.',
                      },
                      {
                        code: 'DUO:0000045',
                        value: orgID,
                        type: 'text',
                        message: 'Please type the Organization ID.',
                      },
                      {
                        code: 'DUO:0000019',
                        value: selectedValue19,
                        type: 'text',
                        message: 'Please type the Publication link or related DOI.',
                      },
                      {
                        code: 'DUO:0000020',
                        value: selectedValue20investigatorName,
                        type: 'text',
                        message: 'Please type the Primary Investigator Name(s).',
                      },
                      {
                        code: 'DUO:0000020',
                        value: selectedValue20investigatorcontact,
                        type: 'text',
                        message: 'Please type the Investigator Contact Info.',
                      },
                      {
                        code: 'DUO:0000020',
                        value: selectedValue20collaborationtype,
                        type: 'dropdown',
                        message: 'Please select Collaboration Type.',
                      },
                      {
                        code: 'DUO:0000020',
                        value: selectedValue20requiredaction,
                        type: 'text',
                        message: 'Please type the Required Collaboration Action.',
                      },
                      {
                        code: 'DUO:0000021',
                        value: selectedValue21approvaltype,
                        type: 'checkbox',
                        message: 'Please select Approval Type.',
                      },
                      {
                        code: 'DUO:0000021',
                        value: selectedValue21contact,
                        type: 'text',
                        message: 'Please type the Review Entity Contact Info.',
                      },
                      {
                        code: 'DUO:0000025',
                        value: startDate,
                        value2: endDate,
                        type: 'daterange',
                        message: 'Please provide a valid start and end date.',
                      },
                      {
                        code: 'DUO:0000027',
                        value: selectedValue27requirement,
                        type: 'checkbox',
                        message:
                          'Please confirm that you want your work to be used as part of a research project.',
                      },
                      {
                        code: 'DUO:0000027',
                        value: selectedValue27fair,
                        type: 'checkbox',
                        message: 'Please confirm that the Project supports FAIR principles.',
                      },
                      {
                        code: 'DUO:0000028',
                        value: institutionName,
                        type: 'text',
                        message: 'Please specify the Institution Name.',
                      },
                      {
                        code: 'DUO:0000028',
                        value: institutionalApproval,
                        type: 'radio',
                        message: 'Please select if you want to require Institutional Approval.',
                      },
                      {
                        code: 'DUO:0000029',
                        value: dataReturnCommitment,
                        type: 'checkbox',
                        message: 'Please confirm the Data Return Commitment.',
                      },
                      {
                        code: 'DUO:0000043',
                        value: selectedValue43,
                        type: 'checkbox',
                        message: 'Please select at least one profession for Intended Use.',
                      },
                      {
                        code: 'DUO:0000043',
                        value: selectedValue43.includes('Other') ? selectedValue43text : 'valid',
                        type: 'text',
                        message: 'Please specify the profession under "Other".',
                      },
                      {
                        code: 'DUO:0000043',
                        value: clinicalCareDeclaration,
                        type: 'checkbox',
                        message: 'Please confirm the Clinical Care Use Declaration.',
                      },
                      {
                        code: 'DUO:0000044',
                        value: blockMetadata,
                        type: 'radio',
                        message: 'Please select if you want to Block Population Metadata.',
                      },
                    ]);
                    if (valid) {
                      setCurrentMainIndex((i) => i + 1);
                    }
                  }}
                >
                  Next
                </button>
                {currentMainIndex >= 1 && (
                  <button
                    style={{ marginLeft: 8 }}
                    className="button_col"
                    onClick={() => setCurrentMainIndex((i) => i + 1)}
                  >
                    Skip
                  </button>
                )}
                {currentMainIndex >= 1 && (
                  <button
                    style={{ marginLeft: 8 }}
                    className="button_col"
                    onClick={() => setCurrentMainIndex((i) => i - 1)}
                  >
                    Previous
                  </button>
                )}
              </>
            ) : (
              <button
                className="button_col"
                onClick={() => {
                  // Add validation if needed
                  saveJson();
                  navigate('/createdatacard');
                }}
              >
                Submit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
