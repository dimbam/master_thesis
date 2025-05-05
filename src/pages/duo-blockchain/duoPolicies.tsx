// src/duoPolicies.ts

import Constants from 'expo-constants';
import { DUO_METADATA } from './DUO_METADATA';

//
// ─── Configuration ───────────────────────────────────────────────────────────
//

// Prefer Expo Constants (from app.config.js / app.config.ts), fallback to .env if available
export const BIOPORTAL_API_KEY: string =
  (Constants.manifest?.extra as any)?.bioportalApiKey || process.env.BIOPORTAL_API_KEY || '';

if (!BIOPORTAL_API_KEY) {
  console.warn('[DUO] No BioPortal API key found. Disease‑keyword lookups will fail.');
}

//
// ─── Types ────────────────────────────────────────────────────────────────────
//

export type UserAttrs = {
  purpose?: string;
  disease?: string; // free‑text keyword or MONDO:xxxx code
  researchType?: string;
  studyType?: string;
  commercial?: boolean;
  willPublish?: boolean;
  agreedToCollaborate?: boolean;
  irbApprovalDate?: Date;
  accessDate?: Date;
  geo?: string;
  timeLimitMonths?: number;
  userId?: string;
  projectId?: string;
  institutionId?: string;
  willReturnDerived?: boolean;
  investigation?: string;
  ageCategory?: string;
  genderCategory?: string;
  diseaseCategory?: string;
};

export type Dataset = {
  name: string;
  duoCodes: string[];
  metadata: Partial<Record<string, any>>; // may include .disease (string) or .diseases (string[])
  created?: Date;
};

export type Decision = { allowed: true } | { allowed: false; failedCode: string };

//
// ─── BioPortal helper ────────────────────────────────────────────────────────
//

async function lookupDiseaseClasses(term: string): Promise<Set<string>> {
  const out = new Set<string>();
  if (!BIOPORTAL_API_KEY) return out;

  const q = encodeURIComponent(term.trim());
  const url =
    `https://data.bioontology.org/search?q=${q}` + `&ontologies=MONDO,SNOMEDCT&pagesize=50`;

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Authorization: `apikey token=${BIOPORTAL_API_KEY}` },
    });
  } catch (e) {
    console.error('[DUO] Network error during BioPortal fetch:', e);
    return out;
  }

  if (!res.ok) {
    console.warn('[DUO] BioPortal search failed:', res.statusText);
    return out;
  }

  let json: any;
  try {
    json = await res.json();
  } catch (e) {
    console.error('[DUO] Failed to parse BioPortal JSON:', e);
    return out;
  }

  for (const item of json.collection || []) {
    const uri: string = item['@id'];
    const last = uri.split('/').pop()!; // e.g. "MONDO_0005148"
    const [ont, code] = last.split('_', 2);
    if (ont && code) out.add(`${ont}:${code}`);
  }

  return out;
}

//
// ─── Policy functions ─────────────────────────────────────────────────────────
//

function allow_data_use_permission(): boolean {
  return true;
}

function allow_no_restriction(): boolean {
  return true;
}

function allow_health_medical(u: UserAttrs): boolean {
  return ['health', 'medical', 'biomedical'].includes(u.purpose ?? '');
}

/**
 * DUO:0000007 – disease specific research
 *
 * - Checks dataset.metadata.disease (string) or metadata.diseases (string[])
 * - If user’s term/code exactly matches any of those, allow
 * - Else free‑text lookup via BioPortal
 */
async function allow_disease_specific(u: UserAttrs, d: Dataset): Promise<boolean> {
  const term = u.disease?.trim();
  if (!term) return false;

  // collect the dataset’s codes
  const codes = new Set<string>();
  const single = d.metadata.disease as string | undefined;
  const multi = d.metadata.diseases as string[] | undefined;
  if (single) codes.add(single);
  if (Array.isArray(multi)) multi.forEach((c) => codes.add(c));

  // exact match
  if (codes.has(term)) {
    return true;
  }

  // free‑text lookup
  const matches = await lookupDiseaseClasses(term);
  for (const ds of codes) {
    if (matches.has(ds)) return true;
  }
  return false;
}

function allow_population_ancestry_only(u: UserAttrs): boolean {
  return u.purpose === 'ancestry';
}

function allow_research_specific(u: UserAttrs, d: Dataset): boolean {
  return !!d.metadata.researchType && u.researchType === d.metadata.researchType;
}

function allow_no_general_methods(u: UserAttrs): boolean {
  return u.studyType !== 'methods_development';
}

function allow_genetic_studies_only(u: UserAttrs): boolean {
  return u.studyType === 'genetic';
}

function allow_data_use_modifier(): boolean {
  return true;
}

function allow_not_for_profit_non_commercial(u: UserAttrs): boolean {
  return u.commercial === false;
}

function allow_publication_required(u: UserAttrs): boolean {
  return u.willPublish === true;
}

function allow_collaboration_required(u: UserAttrs): boolean {
  return u.agreedToCollaborate === true;
}

function allow_ethics_approval_required(u: UserAttrs): boolean {
  return (
    !!u.irbApprovalDate && !!u.accessDate && u.irbApprovalDate.getTime() <= u.accessDate.getTime()
  );
}

function allow_geographical_restriction(u: UserAttrs, d: Dataset): boolean {
  return !!d.metadata.region && u.geo === d.metadata.region;
}

function allow_publication_moratorium(u: UserAttrs, d: Dataset): boolean {
  const e = d.metadata.embargoDate as Date | undefined;
  if (!e || !u.accessDate) return true;
  return u.accessDate.getTime() >= e.getTime();
}

function allow_time_limit_on_use(u: UserAttrs, d: Dataset): boolean {
  const m = d.metadata.timeLimitMonths as number | undefined;
  if (!m || !u.accessDate || !d.created) return false;
  const days = (u.accessDate.getTime() - d.created.getTime()) / 86400000;
  return days / 30 <= m;
}

function allow_user_specific_restriction(u: UserAttrs, d: Dataset): boolean {
  const allowed = d.metadata.allowedUsers as string[] | undefined;
  return !!allowed && allowed.includes(u.userId ?? '');
}

function allow_project_specific_restriction(u: UserAttrs, d: Dataset): boolean {
  return u.projectId === d.metadata.allowedProject;
}

function allow_institution_specific_restriction(u: UserAttrs, d: Dataset): boolean {
  return u.institutionId === d.metadata.institutionId;
}

function allow_return_to_database(u: UserAttrs): boolean {
  return u.willReturnDerived === true;
}

// investigation‑type policies

function allow_method_development(u: UserAttrs): boolean {
  return u.investigation === 'method_development';
}

function allow_population_research(u: UserAttrs): boolean {
  return u.investigation === 'population_research';
}

function allow_ancestry_research(u: UserAttrs): boolean {
  return u.investigation === 'ancestry_research';
}

function allow_age_category_research(u: UserAttrs, d: Dataset): boolean {
  return !!d.metadata.ageCategory && u.ageCategory === d.metadata.ageCategory;
}

function allow_gender_category_research(u: UserAttrs, d: Dataset): boolean {
  return !!d.metadata.genderCategory && u.genderCategory === d.metadata.genderCategory;
}

function allow_research_control(u: UserAttrs): boolean {
  return u.investigation === 'research_control';
}

function allow_biomedical_research(u: UserAttrs): boolean {
  return u.investigation === 'biomedical_research';
}

function allow_genetic_research(u: UserAttrs): boolean {
  return u.investigation === 'genetic_research';
}

function allow_drug_development_research(u: UserAttrs): boolean {
  return u.investigation === 'drug_development_research';
}

function allow_disease_category_research(u: UserAttrs, d: Dataset): boolean {
  return !!d.metadata.diseaseCategory && u.diseaseCategory === d.metadata.diseaseCategory;
}

// catch‑all modifiers

function allow_general_research_use(): boolean {
  return true;
}

function allow_clinical_care_use(u: UserAttrs): boolean {
  return u.purpose === 'clinical';
}

function allow_ancestry_prohibited(u: UserAttrs): boolean {
  return u.purpose !== 'ancestry';
}

function allow_not_for_profit_org_use(u: UserAttrs): boolean {
  return u.researchType === 'not‑for‑profit';
}

function allow_non_commercial_use_only(u: UserAttrs): boolean {
  return u.commercial === false;
}

//
// ─── Which UserAttrs each DUO code needs ─────────────────────────────────────
//

export const requiredFieldsMap: Record<string, (keyof UserAttrs)[]> = {
  'DUO:0000006': ['purpose'],
  'DUO:0000007': ['disease'],
  'DUO:0000011': ['purpose'],
  'DUO:0000012': ['researchType'],
  'DUO:0000015': ['studyType'],
  'DUO:0000016': ['studyType'],
  'DUO:0000018': ['commercial'],
  'DUO:0000019': ['willPublish'],
  'DUO:0000020': ['agreedToCollaborate'],
  'DUO:0000021': ['irbApprovalDate', 'accessDate'],
  'DUO:0000022': ['geo'],
  'DUO:0000024': ['accessDate'],
  'DUO:0000025': ['accessDate'],
  'DUO:0000026': ['userId'],
  'DUO:0000027': ['projectId'],
  'DUO:0000028': ['institutionId'],
  'DUO:0000029': ['willReturnDerived'],
  'DUO:0000031': ['investigation'],
  'DUO:0000032': ['investigation'],
  'DUO:0000033': ['investigation'],
  'DUO:0000034': ['ageCategory'],
  'DUO:0000035': ['genderCategory'],
  'DUO:0000037': ['investigation'],
  'DUO:0000038': ['investigation'],
  'DUO:0000039': ['investigation'],
  'DUO:0000040': ['diseaseCategory'],
  'DUO:0000043': ['purpose'],
  'DUO:0000044': ['purpose'],
  'DUO:0000045': ['researchType'],
  'DUO:0000046': ['commercial'],
};

//
// ─── Map DUO code → policy fn ────────────────────────────────────────────────
//

const policyMap: Record<string, (u: UserAttrs, d: Dataset) => boolean | Promise<boolean>> = {
  'DUO:0000001': allow_data_use_permission,
  'DUO:0000004': allow_no_restriction,
  'DUO:0000006': allow_health_medical,
  'DUO:0000007': allow_disease_specific,
  'DUO:0000011': allow_population_ancestry_only,
  'DUO:0000012': allow_research_specific,
  'DUO:0000015': allow_no_general_methods,
  'DUO:0000016': allow_genetic_studies_only,
  'DUO:0000017': allow_data_use_modifier,
  'DUO:0000018': allow_not_for_profit_non_commercial,
  'DUO:0000019': allow_publication_required,
  'DUO:0000020': allow_collaboration_required,
  'DUO:0000021': allow_ethics_approval_required,
  'DUO:0000022': allow_geographical_restriction,
  'DUO:0000024': allow_publication_moratorium,
  'DUO:0000025': allow_time_limit_on_use,
  'DUO:0000026': allow_user_specific_restriction,
  'DUO:0000027': allow_project_specific_restriction,
  'DUO:0000028': allow_institution_specific_restriction,
  'DUO:0000029': allow_return_to_database,
  'DUO:0000031': allow_method_development,
  'DUO:0000032': allow_population_research,
  'DUO:0000033': allow_ancestry_research,
  'DUO:0000034': allow_age_category_research,
  'DUO:0000035': allow_gender_category_research,
  'DUO:0000036': allow_research_control,
  'DUO:0000037': allow_biomedical_research,
  'DUO:0000038': allow_genetic_research,
  'DUO:0000039': allow_drug_development_research,
  'DUO:0000040': allow_disease_category_research,
  'DUO:0000042': allow_general_research_use,
  'DUO:0000043': allow_clinical_care_use,
  'DUO:0000044': allow_ancestry_prohibited,
  'DUO:0000045': allow_not_for_profit_org_use,
  'DUO:0000046': allow_non_commercial_use_only,
};

//
// ─── Master evaluator (async) ────────────────────────────────────────────
//

export async function evaluateAccess(u: UserAttrs, d: Dataset): Promise<Decision> {
  for (const code of d.duoCodes) {
    const fn = policyMap[code];
    if (!fn) {
      return { allowed: false, failedCode: code };
    }
    const ok = await fn(u, d);
    if (!ok) {
      return { allowed: false, failedCode: code };
    }
  }
  return { allowed: true };
}
