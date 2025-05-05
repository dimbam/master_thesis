// src/screens/DatasetDetail.tsx

import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Menu, IconButton } from 'react-native-paper';
import {
  evaluateAccess,
  requiredFieldsMap,
  UserAttrs,
  Dataset,
  Decision,
  BIOPORTAL_API_KEY,
} from './duoPolicies';
import { DUO_METADATA } from './DUO_METADATA';
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

const FIELD_LABELS: Record<keyof UserAttrs, string> = {
  purpose: 'Purpose',
  disease: 'Disease',
  researchType: 'Research Type',
  studyType: 'Study Type',
  commercial: 'Commercial?',
  willPublish: 'Will Publish?',
  agreedToCollaborate: 'Agreed to Collaborate?',
  irbApprovalDate: 'IRB Approval Date (YYYY‑MM‑DD)',
  accessDate: 'Access Date (YYYY‑MM‑DD)',
  geo: 'Region',
  timeLimitMonths: 'Time Limit (months)',
  userId: 'User ID',
  projectId: 'Project ID',
  institutionId: 'Institution ID',
  willReturnDerived: 'Will Return Derived Data?',
  investigation: 'Investigation Type',
  ageCategory: 'Age Category',
  genderCategory: 'Gender Category',
  diseaseCategory: 'Disease Category',
};

export default function DatasetDetail({ route }: Props) {
  const { name, duoCodes, metadata = {}, created: createdIso } = route.params;
  const created = createdIso ? new Date(createdIso) : undefined;

  //
  // 1) Determine which fields this dataset actually requires:
  //
  const requiredFields = useMemo(
    () => Array.from(new Set(duoCodes.flatMap((c) => requiredFieldsMap[c] || []))),
    [duoCodes],
  ) as (keyof UserAttrs)[];

  //
  // 2) State for all non‑disease fields
  //
  const [attrs, setAttrs] = useState<
    Partial<Record<Exclude<keyof UserAttrs, 'disease'>, string | boolean>>
  >(() =>
    requiredFields.reduce((acc, f) => {
      if (f === 'disease') return acc; // skip, handled separately
      // boolean fields default to false:
      if (
        f === 'commercial' ||
        f === 'willPublish' ||
        f === 'agreedToCollaborate' ||
        f === 'willReturnDerived'
      ) {
        (acc as any)[f] = false;
      } else {
        (acc as any)[f] = '';
      }
      return acc;
    }, {} as any),
  );

  //
  // 3) Disease‑search state
  //
  const [diseaseQuery, setDiseaseQuery] = useState(metadata.disease ?? '');
  const [diseaseOptions, setDiseaseOptions] = useState<{ label: string; id: string }[]>([]);
  const [selectedDisease, setSelectedDisease] = useState<{
    label: string;
    id: string;
  } | null>(metadata.disease ? { label: metadata.disease, id: metadata.disease } : null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // 4) Autocomplete whenever the user types (or when we seed from metadata)
  useEffect(() => {
    let active = true;
    async function lookup() {
      if (!diseaseQuery.trim()) {
        setDiseaseOptions([]);
        return;
      }
      if (!BIOPORTAL_API_KEY) {
        setSearchError('No BioPortal API key configured.');
        return;
      }
      setIsSearching(true);
      setSearchError(null);
      try {
        const url = `https://data.bioontology.org/search?q=${encodeURIComponent(
          diseaseQuery,
        )}&ontologies=MONDO,SNOMEDCT&pagesize=20`;
        const res = await fetch(url, {
          headers: { Authorization: `apikey token=${BIOPORTAL_API_KEY}` },
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} ${res.statusText}`);
        }
        const json = await res.json();
        if (!active) return;
        const opts = (json.collection || []).map((item: any) => {
          const uri: string = item['@id'];
          const last = uri.split('/').pop()!;
          const [ont, code] = last.split('_', 2);
          return { label: item.prefLabel, id: `${ont}:${code}` };
        });
        setDiseaseOptions(opts);
        if (opts.length === 0) setSearchError('No matches found.');
      } catch (e: any) {
        if (!active) return;
        setSearchError(e.message);
        setDiseaseOptions([]);
      } finally {
        if (active) setIsSearching(false);
      }
    }
    lookup();
    return () => {
      active = false;
    };
  }, [diseaseQuery]);

  // 5) Update helper for non‑disease fields
  function onChangeField<K extends Exclude<keyof UserAttrs, 'disease'>>(
    key: K,
    value: string | boolean,
  ) {
    setAttrs((prev) => ({ ...prev, [key]: value }));
  }

  // 6) Pick one of the dropdown options
  function pickDisease(opt: { label: string; id: string }) {
    setSelectedDisease(opt);
    setDiseaseQuery(opt.label);
    setDiseaseOptions([]);
    setSearchError(null);
  }

  //
  // 7) Check access
  //
  const [decision, setDecision] = useState<Decision | null>(null);
  async function checkAccess() {
    // Assemble UserAttrs
    const u: UserAttrs = {};
    // first non‑disease:
    for (const f of requiredFields) {
      if (f === 'disease') continue;
      const raw = (attrs as any)[f];
      if (typeof raw === 'boolean') {
        u[f] = raw;
      } else {
        const s = String(raw ?? '').trim();
        if ((f === 'irbApprovalDate' || f === 'accessDate') && s) {
          const d = new Date(s);
          if (!isNaN(d.getTime())) u[f] = d;
        } else if (f === 'timeLimitMonths' && s) {
          const n = parseInt(s, 10);
          if (!isNaN(n)) u[f] = n;
        } else {
          u[f] = s;
        }
      }
    }
    // then disease:
    if (requiredFields.includes('disease')) {
      if (!selectedDisease) {
        setSearchError('Please select one of the suggestions.');
        return;
      }
      u.disease = selectedDisease.id;
    }

    const ds: Dataset = { name, duoCodes, metadata, created };
    const res = await evaluateAccess(u, ds);
    setDecision(res);
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{name}</Text>

      {/* Show each DUO code + info */}
      {duoCodes.map((code) => {
        const m = DUO_METADATA[code]!;
        return (
          <View key={code} style={styles.codeRow}>
            <Text style={styles.codeLabel}>
              {m.label} ({code})
            </Text>
            <IconButton icon="information" size={18} onPress={() => {}} />
          </View>
        );
      })}

      {/* Render each required field */}
      {requiredFields.map((field) => {
        const label = FIELD_LABELS[field] || field;

        //  — a special “disease” autocomplete
        if (field === 'disease') {
          return (
            <View key="disease" style={styles.fieldColumn}>
              <Text style={styles.fieldLabel}>{label}</Text>
              <TextInput
                style={styles.input}
                placeholder="Type to search…"
                value={diseaseQuery}
                onChangeText={(t) => {
                  setSelectedDisease(null);
                  setDiseaseQuery(t);
                }}
              />
              <Button title="Search" onPress={() => setDiseaseQuery(diseaseQuery)} />
              {isSearching && <ActivityIndicator style={{ marginTop: 8 }} />}
              {searchError && <Text style={styles.error}>{searchError}</Text>}
              {diseaseOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={styles.option}
                  onPress={() => pickDisease(opt)}
                >
                  <Text>{opt.label}</Text>
                </TouchableOpacity>
              ))}
              {selectedDisease && (
                <Text style={styles.selected}>
                  Selected: {selectedDisease.label} ({selectedDisease.id})
                </Text>
              )}
            </View>
          );
        }

        // — boolean → Switch
        const raw = (attrs as any)[field];
        if (typeof raw === 'boolean') {
          return (
            <View key={field} style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>{label}</Text>
              <Switch value={raw} onValueChange={(v) => onChangeField(field, v)} />
            </View>
          );
        }

        // — everything else → text input
        return (
          <View key={field} style={styles.fieldColumn}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <TextInput
              style={styles.input}
              value={String(raw ?? '')}
              placeholder={label}
              onChangeText={(t) => onChangeField(field, t)}
            />
          </View>
        );
      })}

      <Button title="Check Access" onPress={checkAccess} />

      {decision && (
        <View style={styles.result}>
          <Text style={styles.resultText}>{decision.allowed ? '✅ Permit' : '❌ Deny'}</Text>
          {!decision.allowed && (
            <Text style={styles.failed}>Failed policy: {decision.failedCode}</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },

  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  codeLabel: { fontSize: 16, flexShrink: 1 },

  fieldColumn: { marginVertical: 8 },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  fieldLabel: { fontSize: 14, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
  },

  option: {
    padding: 8,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  selected: { marginTop: 8, fontStyle: 'italic', color: '#555' },
  error: { marginTop: 8, color: 'crimson' },

  result: { marginTop: 24 },
  resultText: { fontSize: 18, fontWeight: 'bold' },
  failed: { marginTop: 4, color: 'crimson' },
});
