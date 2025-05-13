// matchMainSections.ts
export const MAIN_SECTIONS: Record<string, string[]> = {
  'What type of use will your data be permitted for?': [
    'DUO:0000004',
    'DUO:0000011',
    'DUO:0000007',
  ],
  'Do you want to set restrictions on commercial use?': ['DUO:0000045', 'DUO:0000046'],
  'Should requesters publish results or return data?': ['DUO:0000019', 'DUO:0000029'],
  'Do you require requesters to obtain ethics approval or collaboration?': [
    'DUO:0000020',
    'DUO:0000021',
  ],
  'Are there geographic or institutional restrictions?': [
    'DUO:0000022',
    'DUO:0000026',
    'DUO:0000027',
    'DUO:0000028',
  ],
  'Is use limited by time or publication embargo?': ['DUO:0000024', 'DUO:0000025'],
  'Clinical Care use?': ['DUO:0000012', 'DUO:0000015', 'DUO:0000016', 'DUO:0000043'],
};
