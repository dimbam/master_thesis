import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { DUO_METADATA } from './DUO_METADATA';
import TooltipInfo from './../TooltipInfo';
import '../.././FilteredForm.css';

const res = await fetch('http://localhost:5000/form');
const storedForm = await res.json();

const FORM_ROOTS = [
  'DUO:0000001',
  'DUO:0000018',
  'DUO:0000050',
  'DUO:0000051',
  'DUO:0000052',
  'DUO:0000053',
  'DUO:0000054',
];

function matchFormSections(selected: Record<string, boolean>) {
  const matched = new Set<string>();
  for (const code of Object.keys(selected)) {
    if (!selected[code]) continue;

    let current = code;
    while (DUO_METADATA[current]?.subclassOf) {
      current = DUO_METADATA[current].subclassOf;
      if (FORM_ROOTS.includes(current)) {
        matched.add(current);
        break;
      }
    }
  }
  return Array.from(matched);
}

export default function FilteredForm() {
  const [matchedRoots, setMatchedRoots] = useState<string[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const loadRequesterForm = async () => {
    try {
      const res = await fetch('http://localhost:5000/form');
      const storedForm = await res.json();

      const matched = matchFormSections(storedForm.selected);
      setMatchedRoots(matched);
      const expand = Object.fromEntries(matched.map((r) => [r, true]));
      setExpanded(expand);
      const emptySelected: Record<string, boolean> = {};
      Object.keys(storedForm.selected).forEach((code) => {
        emptySelected[code] = false;
      });
      setSelected(emptySelected);
    } catch (err) {
      console.error('Error loading stored form:', err);
    }
  };

  const toggleSelect = (code: string) => setSelected((s) => ({ ...s, [code]: !s[code] }));

  const toggleExpand = (code: string) => setExpanded((e) => ({ ...e, [code]: !e[code] }));

  const childrenOf = (rootCode: string) =>
    Object.entries(DUO_METADATA).filter(([, meta]) => meta.subclassOf === rootCode);

  const renderNode = (code: string) => {
    const meta = DUO_METADATA[code];
    const children = childrenOf(code);
    const isSelected = selected[code];
    const isExpanded = expanded[code];

    return (
      <div key={code} style={{ marginLeft: 16 }}>
        <div className="formlayout" style={{ display: 'flex', alignItems: 'center' }}>
          {children.length > 0 && (
            <span
              onClick={() => toggleExpand(code)}
              style={{ cursor: 'pointer', fontWeight: 'bold', marginRight: 6 }}
            >
              {isExpanded ? '[-]' : '[+]'}
            </span>
          )}
          <label>
            {children.length === 0 && (
              <input
                className="formlayout"
                type="checkbox"
                checked={!!isSelected}
                onChange={() => toggleSelect(code)}
              />
            )}
            <span style={{ marginLeft: 8 }}>
              {meta.label} ({code}) <TooltipInfo text={meta.definition} />
            </span>
          </label>
        </div>

        {children.length > 0 && isExpanded && (
          <div style={{ marginLeft: 24 }}>
            {children.map(([childCode]) => renderNode(childCode))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="formlayout" style={{ padding: 24 }}>
      <h2>Filtered DUO Form</h2>
      <button onClick={loadRequesterForm} style={{ marginBottom: 16 }}>
        Load Requester Form
      </button>
      {matchedRoots.map((rootCode: string) => renderNode(rootCode))}
    </div>
  );
}
