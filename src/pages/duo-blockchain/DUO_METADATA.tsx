// src/DUO_METADATA.ts

import { UserAttrs } from './duoPolicies';

export interface DuoMeta {
  /** Human‑readable label */
  label: string;
  /** Text definition / rdfs:comment from OWL IAO_0000115 */
  definition: string;
  /** Optional shorthand / oboInOwl:shorthand */
  altLabel?: string | null;
  /** The immediate parent class (rdfs:subClassOf) */
  subclassOf: string;
  /** Any rdfs:comment annotations from the OWL */
  comments?: string[];
  /**
   * Which UserAttrs keys this DUO code requires.
   * These will be pulled into requiredFieldsMap automatically.
   */
  requiredFields?: (keyof UserAttrs)[];
}

export const DUO_METADATA: Record<string, DuoMeta> = {
  'DUO:0000001': {
    label: 'What type of use will your data be permitted for?',
    definition:
      'A data item that is used to indicate consent permissions for datasets and/or materials.',
    altLabel: null,
    subclassOf: 'IAO_0000027',
  },
  'DUO:0000004': {
    label: 'no restriction',
    definition: 'There is no restriction on use.',
    altLabel: 'NRES',
    subclassOf: 'DUO:0000001',
    comments: [
      "20180907, Meeting Moran Melanie: This is to be thought about more carefully - what is the intent when using 'no restriction' as usually users still need to be researchers.",
      'Note: the NRES alternative term may be confusing as in the UK it also stands for National Research Ethics Service',
    ],
  },
  'DUO:0000006': {
    label: 'health/medical/biomedical research',
    definition: 'Use allowed for health, medical, or biomedical research purposes only.',
    altLabel: 'HMB',
    subclassOf: 'DUO:0000001',
    requiredFields: ['purpose'],
  },
  'DUO:0000007': {
    label: 'disease specific research',
    definition: 'Use allowed only for the specified disease. Requires a MONDO disease identifier.',
    altLabel: 'DS',
    subclassOf: 'DUO:0000001',
    comments: [
      'This term should be coupled with a term describing a disease from an ontology to specify the disease the restriction applies to. DUO recommends MONDO be used. Other resources (Disease Ontology, HPO, SNOMED‑CT) can be used but may require mapping.',
    ],
    requiredFields: ['disease'],
  },
  'DUO:0000011': {
    label: 'population origins/ancestry only',
    definition: 'Use limited to population origins or ancestry research only.',
    altLabel: 'POA',
    subclassOf: 'DUO:0000001',
    requiredFields: ['purpose'],
  },
  'DUO:0000012': {
    label: 'research‑specific restrictions',
    definition: 'Use limited to studies of a certain research type (e.g. epidemiology).',
    altLabel: 'RS',
    subclassOf: 'DUO:0000054',
    requiredFields: ['researchType'],
  },
  'DUO:0000015': {
    label: 'no general methods research',
    definition: 'Methods development research (algorithms, software) is disallowed.',
    altLabel: 'NMDS',
    subclassOf: 'DUO:0000054',
    requiredFields: ['studyType'],
  },
  'DUO:0000016': {
    label: 'genetic studies only',
    definition: 'Use limited to genetic studies (genotype ± phenotype).',
    altLabel: 'GSO',
    subclassOf: 'DUO:0000054',
    requiredFields: ['studyType'],
  },
  'DUO:0000017': {
    label: 'data use modifier',
    definition: 'Root class for modifiers—always permit if child terms are satisfied.',
    altLabel: null,
    subclassOf: 'IAO_0000027',
  },
  'DUO:0000018': {
    label: 'Do you want to set restrictions on commercial use? ',
    definition: 'Only non‑commercial, not‑for‑profit uses are allowed.',
    altLabel: 'NPUNCU',
    subclassOf: 'DUO:0000017',
    requiredFields: ['commercial'],
  },
  'DUO:0000019': {
    label: 'Results must be published',
    definition: 'Results must be made publicly available (e.g. via PubMed).',
    altLabel: 'PUB',
    subclassOf: 'DUO:0000050',
    requiredFields: ['willPublish'],
  },
  'DUO:0000020': {
    label: 'Collaboration with primary investigators required',
    definition: 'Requestor must agree to collaborate with the primary investigators.',
    altLabel: 'COL',
    subclassOf: 'DUO:0000051',
    comments: ['This could be coupled with a string describing the primary study investigator(s).'],
    requiredFields: ['agreedToCollaborate'],
  },
  'DUO:0000021': {
    label: 'Ethics/IRB approval required',
    definition: 'Must provide IRB/ERB approval documentation before access.',
    altLabel: 'IRB',
    subclassOf: 'DUO:0000051',
    requiredFields: ['irbApprovalDate', 'accessDate'],
  },
  'DUO:0000022': {
    label: 'Restricted to specific geographic region',
    definition: 'Use limited to a specific geographic region. Requires a region identifier.',
    altLabel: 'GS',
    subclassOf: 'DUO:0000052',
    comments: [
      'This should be coupled with an ontology term describing the geographical location the restriction applies to.',
    ],
    requiredFields: ['geo'],
  },
  'DUO:0000024': {
    label: 'Embargo on publication',
    definition: 'No publications allowed until the specified embargo date.',
    altLabel: 'MOR',
    subclassOf: 'DUO:0000053',
    comments: ['This should be coupled with a date specified as ISO8601.'],
    requiredFields: ['accessDate'],
  },
  'DUO:0000025': {
    label: 'Limited time (months from dataset creation)',
    definition: 'Use approved for a fixed number of months from dataset creation.',
    altLabel: 'TS',
    subclassOf: 'DUO:0000053',
    comments: ['This should be coupled with an integer value indicating the number of months.'],
    requiredFields: ['accessDate'],
  },
  'DUO:0000026': {
    label: 'Restricted to specific users',
    definition: 'Use limited to a pre‑approved list of user IDs.',
    altLabel: 'US',
    subclassOf: 'DUO:0000052',
    requiredFields: ['userId'],
  },
  'DUO:0000027': {
    label: 'Restricted to a specific project',
    definition: 'Use limited to a specific project ID.',
    altLabel: 'PS',
    subclassOf: 'DUO:0000052',
    requiredFields: ['projectId'],
  },
  'DUO:0000028': {
    label: 'Restricted to a specific institution',
    definition: 'Use limited to an approved institution.',
    altLabel: 'IS',
    subclassOf: 'DUO:0000052',
    requiredFields: ['institutionId'],
  },
  'DUO:0000029': {
    label: 'Derived data must return to source',
    definition: 'Derived/enriched data must be returned to the originating database.',
    altLabel: 'RTN',
    subclassOf: 'DUO:0000050',
    requiredFields: ['willReturnDerived'],
  },
  'DUO:0000031': {
    label: 'method development',
    definition: 'Investigation concerning methods, algorithms, software or tools.',
    altLabel: null,
    subclassOf: 'OBI_0000066',
    requiredFields: ['investigation'],
  },
  'DUO:0000032': {
    label: 'population research',
    definition: 'Investigation concerning a specific population group.',
    altLabel: null,
    subclassOf: 'OBI_0000066',
    requiredFields: ['investigation'],
  },
  'DUO:0000033': {
    label: 'ancestry research',
    definition: 'Investigation concerning ancestry or population origins.',
    altLabel: null,
    subclassOf: 'OBI_0000066',
    requiredFields: ['investigation'],
  },
  'DUO:0000034': {
    label: 'age category research',
    definition: 'Investigation constrained to a specific age category.',
    altLabel: null,
    subclassOf: 'OBI_0000066',
    requiredFields: ['ageCategory'],
  },
  'DUO:0000035': {
    label: 'gender category research',
    definition: 'Investigation constrained to a specific gender category.',
    altLabel: null,
    subclassOf: 'OBI_0000066',
    requiredFields: ['genderCategory'],
  },
  'DUO:0000036': {
    label: 'research control',
    definition: 'Use as reference or control material only.',
    altLabel: null,
    subclassOf: 'OBI_0000066',
  },
  'DUO:0000037': {
    label: 'biomedical research',
    definition: 'Investigation concerning health, medical or biomedical research.',
    altLabel: null,
    subclassOf: 'OBI_0000066',
    requiredFields: ['investigation'],
  },
  'DUO:0000038': {
    label: 'genetic research',
    definition: 'Biomedical research concerning genetics (genes, variation, heredity).',
    altLabel: null,
    subclassOf: 'DUO:0000037',
    requiredFields: ['investigation'],
  },
  'DUO:0000039': {
    label: 'drug development research',
    definition: 'Biomedical research concerning drug development.',
    altLabel: null,
    subclassOf: 'DUO:0000037',
    requiredFields: ['investigation'],
  },
  'DUO:0000040': {
    label: 'disease category research',
    definition: 'Biomedical research concerning specific disease(s).',
    altLabel: null,
    subclassOf: 'DUO:0000037',
    requiredFields: ['diseaseCategory'],
  },
  'DUO:0000042': {
    label: 'general research use',
    definition: 'Use allowed for any research purpose (catch‑all research permission).',
    altLabel: 'GRU',
    subclassOf: 'DUO:0000001',
  },
  'DUO:0000043': {
    label: 'clinical care use',
    definition: 'Use allowed for clinical care and decision‑making.',
    altLabel: 'CC',
    subclassOf: 'DUO:0000054',
    requiredFields: ['purpose'],
  },
  'DUO:0000044': {
    label: 'ancestry research prohibited',
    definition: 'Use for ancestry/population origins research is disallowed.',
    altLabel: 'NPOA',
    subclassOf: 'DUO:0000017',
    requiredFields: ['purpose'],
  },
  'DUO:0000045': {
    label: 'not‑for‑profit organization use only',
    definition: 'Use limited to not‑for‑profit organisations.',
    altLabel: 'NPU',
    subclassOf: 'DUO:0000018',
    requiredFields: ['researchType'],
  },
  'DUO:0000046': {
    label: 'non‑commercial use only',
    definition: 'No commercial use; research by commercial orgs is disallowed.',
    altLabel: 'NCU',
    subclassOf: 'DUO:0000018',
    requiredFields: ['purpose'],
  },
  'DUO:0000050': {
    label: 'Should requesters publish results or return data?',
    definition: 'Publication, data return required.',
    altLabel: 'AdaptedDUO',
    subclassOf: 'IAA',
    requiredFields: ['purpose'],
  },
  'DUO:0000051': {
    label: '  Do you require requesters to obtain ethics approval or collaboration?',
    definition: 'Ethical approval or collaboration required',
    altLabel: 'AdaptedDUO',
    subclassOf: 'IAA',
    requiredFields: ['purpose'],
  },
  'DUO:0000052': {
    label: '  Are there geographic or institutional restrictions?',
    definition: 'Geographic or institutional restrictions required',
    altLabel: 'AdaptedDUO',
    subclassOf: 'IAA',
    requiredFields: ['purpose'],
  },
  'DUO:0000053': {
    label: '   Is use limited by time or publication embargo? ',
    definition: 'Geographic or institutional restrictions required',
    altLabel: 'AdaptedDUO',
    subclassOf: 'IAA',
    requiredFields: ['purpose'],
  },
  'DUO:0000054': {
    label: '   Clinical Care use? ',
    definition: 'clinical care use required',
    altLabel: 'AdaptedDUO',
    subclassOf: 'IAA',
    requiredFields: ['purpose'],
  },
};
