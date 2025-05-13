import { DUO_METADATA } from './DUO_METADATA';

const FORM_ROOTS = [
  'DUO:0000001', // What type of use
  'DUO:0000018', // Commercial use restriction
  'DUO:0000050', // Should publish/return
  'DUO:0000051', // Ethics approval / collaboration
  'DUO:0000052', // Geographic/institutional restriction
  'DUO:0000053', // Time or embargo
  'DUO:0000054', // Clinical care use
];

/**
 * Given DUO metadata and a list of selected codes,
 * walk up their subclassOf chain until you reach a top-level FORM_ROOT.
 */
function findRootAncestor(code: string): string | null {
  let current = code;
  const visited = new Set<string>();

  while (DUO_METADATA[current]?.subclassOf && !visited.has(current)) {
    current = DUO_METADATA[current].subclassOf;
    visited.add(current);
    if (FORM_ROOTS.includes(current)) return current;
  }

  return null;
}

/**
 * Takes parsed `form_data.json` and returns a map of matched root questions
 * with only the relevant selected DUO codes.
 */
export function extractMatchedSectionsFromFormJson(formData: any): Record<string, string[]> {
  const selected: Record<string, boolean> = formData.selected || {};
  const matched: Record<string, string[]> = {};

  for (const code of Object.keys(selected)) {
    if (!selected[code]) continue;

    const root = findRootAncestor(code);
    if (root) {
      if (!matched[root]) matched[root] = [];
      matched[root].push(code);
    }
  }

  return matched;
}
