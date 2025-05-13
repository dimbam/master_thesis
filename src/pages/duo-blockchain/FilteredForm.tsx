import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { DUO_METADATA } from './DUO_METADATA';
import TooltipInfo from './../TooltipInfo';
import '../.././FilteredForm.css';

export default function FilteredForm() {
  const location = useLocation();
  const { roots, selected: initialSelected } = location.state || {};

  const [selected, setSelected] = useState<Record<string, boolean>>(initialSelected || {});
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries((roots || []).map((r: string) => [r, true])),
  );

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
      {(roots || []).map((rootCode: string) => renderNode(rootCode))}
    </div>
  );
}
