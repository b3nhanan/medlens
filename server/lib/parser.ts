import Fuse from 'fuse.js';
import { db } from '../db.ts';

export interface ExtractedInfo {
  name: string | null;
  strength: string | null;
  ingredients: string[];
  form: string | null;
  manufacturer: string | null;
  expiry: string | null; // YYYY-MM-DD
  expiryRaw: string | null;
  batch: string | null;
  mfg: string | null;
}

export interface LabelCheck {
  key: string;
  status: 'ok' | 'warn';
  message: string;
}

export interface IdentifyResult {
  extracted: ExtractedInfo;
  candidates: Array<{ medicine: any; score: number }>;
  best: any | null;
  confidence: 'High' | 'Medium' | 'Low';
  confidenceScore: number;
  checks: LabelCheck[];
}

const MONTH_MAP: Record<string, number> = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12
};

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Normalizes an extracted date string to YYYY-MM-DD (last day of the month)
 */
export function normalizeExpiryDate(rawStr: string): string | null {
  if (!rawStr) return null;
  // Strip prefixes like "EXP:", "EXPIRY DATE", "Exp. Date:"
  let cleaned = rawStr.trim()
    .replace(/^(?:EXP(?:IRY)?\.?\s*(?:DATE)?\s*[:\-]?\s*)/i, '')
    .trim()
    .replace(/^[^\w]+|[^\w]+$/g, '');

  // 1. Month name + Year: "DEC 2026", "DEC. 2026", "NOV 26"
  const monthNameMatch = cleaned.match(/^([a-z]{3,9})\.?\s*[\/-]?\s*(\d{2,4})$/i);
  if (monthNameMatch) {
    const monthKey = monthNameMatch[1].toLowerCase().slice(0, 3);
    const monthNum = MONTH_MAP[monthKey];
    let year = parseInt(monthNameMatch[2], 10);
    if (year < 100) year += 2000;
    if (monthNum && year >= 2000 && year <= 2100) {
      const lastDay = daysInMonth(year, monthNum);
      return `${year}-${String(monthNum).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    }
  }

  // 2. MM/YYYY or MM/YY or MM-YYYY or MM.YYYY
  const mmYyyyMatch = cleaned.match(/^(\d{1,2})[\/\-\.](\d{2,4})$/);
  if (mmYyyyMatch) {
    const monthNum = parseInt(mmYyyyMatch[1], 10);
    let year = parseInt(mmYyyyMatch[2], 10);
    if (year < 100) year += 2000;
    if (monthNum >= 1 && monthNum <= 12 && year >= 2000 && year <= 2100) {
      const lastDay = daysInMonth(year, monthNum);
      return `${year}-${String(monthNum).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    }
  }

  // 3. YYYY/MM or YYYY-MM
  const yyyyMmMatch = cleaned.match(/^(\d{4})[\/\-](\d{1,2})$/);
  if (yyyyMmMatch) {
    const year = parseInt(yyyyMmMatch[1], 10);
    const monthNum = parseInt(yyyyMmMatch[2], 10);
    if (monthNum >= 1 && monthNum <= 12 && year >= 2000 && year <= 2100) {
      const lastDay = daysInMonth(year, monthNum);
      return `${year}-${String(monthNum).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    }
  }

  return null;
}

export function parseOcrText(text: string): ExtractedInfo {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // 1. Expiry regex candidates:
  const expRegex = /(?:EXP(?:IRY)?\.?\s*(?:DATE)?\s*[:\-]?\s*)([0-9]{1,2}[\/\-\.][0-9]{2,4}|[A-Z]{3,9}\.?\s*[0-9]{2,4}|[0-9]{4}[\/\-][0-9]{1,2})/i;
  const expMatch = text.match(expRegex);
  let expiryRaw = expMatch ? expMatch[1] : null;
  let expiry = expiryRaw ? normalizeExpiryDate(expiryRaw) : null;

  // 2. Manufacturing Date (MFG) check:
  const mfgRegex = /(?:MFG(?:DATE|\.?)?\s*[:\-]?\s*)([0-9]{1,2}[\/\-\.][0-9]{2,4}|[A-Z]{3,9}\.?\s*[0-9]{2,4}|[0-9]{4}[\/\-][0-9]{1,2})/i;
  const mfgMatch = text.match(mfgRegex);
  const mfgRaw = mfgMatch ? mfgMatch[1] : null;
  const mfg = mfgRaw ? normalizeExpiryDate(mfgRaw) : null;

  // 3. Batch: (B\.?\s*No\.?|Batch(?:\s*No\.?)?)\s*[:\-]?\s*([A-Z0-9\-]{3,})
  const batchRegex = /(?:B\.?\s*No\.?|Batch(?:\s*No\.?)?)\s*[:\-]?\s*([A-Z0-9\-]{3,})/i;
  const batchMatch = text.match(batchRegex);
  const batch = batchMatch ? batchMatch[1].trim() : null;

  // 4. Strength: (\d+(?:\.\d+)?)\s*(mg|mcg|g|ml|iu|units)
  const strengthMatches = [...text.matchAll(/(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml|iu|units)/gi)];
  let strength: string | null = null;
  if (strengthMatches.length > 0) {
    strength = strengthMatches.map(m => `${m[1]} ${m[2].toLowerCase()}`).join(' + ');
  }

  // 5. Form (Tablet, Capsule, Injection, Pen)
  let form: string | null = null;
  if (/tablets?|tab\b/i.test(text)) form = 'Tablet';
  else if (/capsules?|cap\b/i.test(text)) form = 'Capsule';
  else if (/pen|injection|inj\b/i.test(text)) form = 'Pen injection';
  else if (/syrup|suspension\b/i.test(text)) form = 'Syrup';

  // 6. Manufacturer
  let manufacturer: string | null = null;
  const mfdRegex = /(?:Mfd\.?\s*(?:by)?|Manufactured\s*by|Ltd\b|Pvt\b)[^\n:]*[:\-]?\s*([A-Za-z0-9\s.,]+?)(?=\n|$)/i;
  const mfdMatch = text.match(mfdRegex);
  if (mfdMatch && mfdMatch[1].trim().length > 2) {
    manufacturer = mfdMatch[1].trim();
  }

  // 7. Ingredients extraction from common keywords
  const ingredients: string[] = [];
  const knownIngredients = [
    'paracetamol', 'acetaminophen', 'ibuprofen', 'diclofenac', 'aspirin',
    'clopidogrel', 'fexofenadine', 'cetirizine', 'pantoprazole', 'omeprazole',
    'metformin', 'amlodipine', 'telmisartan', 'amoxicillin', 'clavulanic acid',
    'insulin glargine'
  ];
  const lowerText = text.toLowerCase();
  for (const ing of knownIngredients) {
    if (lowerText.includes(ing)) {
      ingredients.push(ing);
    }
  }

  // 8. Name heuristic: First line or prominent title
  let name: string | null = null;
  if (lines.length > 0) {
    const firstClean = lines[0].replace(/^(rx|b\.?no|exp|mfg)[^a-z0-9]*/i, '').trim();
    if (firstClean.length >= 2) {
      name = firstClean;
    }
  }

  return {
    name,
    strength,
    ingredients,
    form,
    manufacturer,
    expiry,
    expiryRaw,
    batch,
    mfg
  };
}

export function identifyMedicine(ocrText: string, barcode?: string): IdentifyResult {
  const rawMeds = db.prepare('SELECT * FROM medicines').all() as any[];
  const medicines = rawMeds.map(m => ({
    ...m,
    brand_names: JSON.parse(m.brand_names),
    ingredients: JSON.parse(m.ingredients),
    warnings: JSON.parse(m.warnings),
    do_not_use_if: JSON.parse(m.do_not_use_if),
    ask_pharmacist_if: JSON.parse(m.ask_pharmacist_if)
  }));

  const checks: LabelCheck[] = [];
  const extracted = parseOcrText(ocrText || '');
  const lowerText = (ocrText || '').toLowerCase();

  // 1. Barcode direct lookup
  if (barcode && barcode.trim()) {
    const cleanBarcode = barcode.trim();
    const barcodeMatch = medicines.find(m => m.barcode === cleanBarcode);
    if (barcodeMatch) {
      checks.push({ key: 'barcode', status: 'ok', message: `Barcode ${cleanBarcode} matched in database` });
      checks.push({ key: 'name', status: 'ok', message: `Name verified: ${barcodeMatch.brand_names[0]}` });
      if (extracted.expiry) {
        checks.push({ key: 'expiry', status: 'ok', message: `Expiry date detected: ${extracted.expiry}` });
      }
      return {
        extracted,
        candidates: [{ medicine: barcodeMatch, score: 0.98 }],
        best: barcodeMatch,
        confidence: 'High',
        confidenceScore: 0.98,
        checks
      };
    } else {
      checks.push({ key: 'barcode', status: 'warn', message: `Barcode ${cleanBarcode} not found in database. Searching text...` });
    }
  }

  // 2. Score candidates using direct brand name matching + Fuse.js fuzzy fallback
  const fuseItems = medicines.map(m => ({
    medicine: m,
    searchableBrands: m.brand_names.join(' '),
    generic: m.generic_name,
    ingredientNames: m.ingredients.map((i: any) => i.name).join(' '),
    strengthLabel: m.strength_label,
  }));

  const fuse = new Fuse(fuseItems, {
    keys: [
      { name: 'searchableBrands', weight: 0.5 },
      { name: 'generic', weight: 0.3 },
      { name: 'ingredientNames', weight: 0.2 }
    ],
    threshold: 0.45,
    includeScore: true
  });

  const searchTarget = extracted.name || ocrText.slice(0, 100).replace(/\n/g, ' ');
  const fuseResults = fuse.search(searchTarget);
  const fuseMap = new Map<string, number>();
  for (const fr of fuseResults) {
    fuseMap.set(fr.item.medicine.id, 1 - (fr.score ?? 0.5));
  }

  const scoredCandidates = medicines.map(med => {
    let score = fuseMap.get(med.id) || 0;

    // Direct brand matching in OCR text
    for (const b of med.brand_names) {
      const bLower = b.toLowerCase();
      if (lowerText.includes(bLower)) {
        score = Math.max(score, 0.85);
      }
    }

    // Generic name matching
    if (lowerText.includes(med.generic_name.toLowerCase())) {
      score = Math.max(score, 0.70);
    }

    // Ingredient match bonus
    let matchingIngs = 0;
    for (const ing of extracted.ingredients) {
      if (med.ingredients.some((mi: any) => mi.name.toLowerCase() === ing.toLowerCase())) {
        matchingIngs++;
      }
    }
    if (matchingIngs > 0) {
      score += 0.08 * matchingIngs;
    }

    // Strength match bonus or conflict penalty
    if (extracted.strength && med.strength_label) {
      const cleanExtracted = extracted.strength.toLowerCase().replace(/\s+/g, '');
      const cleanMed = med.strength_label.toLowerCase().replace(/\s+/g, '');
      if (cleanExtracted === cleanMed || cleanMed.includes(cleanExtracted)) {
        score += 0.08;
      }
    }

    return {
      medicine: med,
      score: Math.min(0.99, Math.max(0.1, Number(score.toFixed(3))))
    };
  });

  // Sort descending by score
  scoredCandidates.sort((a, b) => b.score - a.score);

  const bestCandidate = scoredCandidates[0] ?? null;
  const bestScore = bestCandidate ? bestCandidate.score : 0;

  let confidence: 'High' | 'Medium' | 'Low' = 'Low';
  if (bestScore >= 0.8) {
    confidence = 'High';
  } else if (bestScore >= 0.5) {
    confidence = 'Medium';
  } else {
    confidence = 'Low';
  }

  // Generate label checks
  if (confidence === 'High' && bestCandidate) {
    checks.push({ key: 'name', status: 'ok', message: `Medicine recognized: ${bestCandidate.medicine.brand_names[0]}` });
  } else if (confidence === 'Medium' && bestCandidate) {
    checks.push({ key: 'name', status: 'warn', message: `Medicine name partially recognized (${bestCandidate.medicine.brand_names[0]}). Please confirm.` });
  } else {
    checks.push({ key: 'name', status: 'warn', message: 'Medicine name not clearly identified. Please verify or search manually.' });
  }

  if (extracted.strength) {
    if (bestCandidate && bestCandidate.medicine.strength_label) {
      const cleanExt = extracted.strength.toLowerCase().replace(/\s+/g, '');
      const cleanMed = bestCandidate.medicine.strength_label.toLowerCase().replace(/\s+/g, '');
      if (cleanMed.includes(cleanExt) || cleanExt.includes(cleanMed)) {
        checks.push({ key: 'strength', status: 'ok', message: `Strength identified: ${extracted.strength}` });
      } else {
        checks.push({ key: 'strength', status: 'warn', message: `Packaging text strength (${extracted.strength}) differs from standard record (${bestCandidate.medicine.strength_label})` });
      }
    } else {
      checks.push({ key: 'strength', status: 'ok', message: `Strength identified: ${extracted.strength}` });
    }
  } else {
    checks.push({ key: 'strength', status: 'warn', message: 'Strength not identified from package' });
  }

  if (extracted.expiry) {
    if (extracted.mfg && extracted.expiry < extracted.mfg) {
      checks.push({ key: 'expiry', status: 'warn', message: `Expiry date (${extracted.expiry}) is earlier than manufacturing date (${extracted.mfg}). Please verify.` });
    } else {
      checks.push({ key: 'expiry', status: 'ok', message: `Expiry date recognized: ${extracted.expiry}` });
    }
  } else {
    checks.push({ key: 'expiry', status: 'warn', message: 'Expiry not readable from package. Please enter it manually.' });
  }

  if (extracted.batch) {
    checks.push({ key: 'batch', status: 'ok', message: `Batch number detected: ${extracted.batch}` });
  }

  return {
    extracted,
    candidates: scoredCandidates.slice(0, 3),
    best: bestCandidate && bestCandidate.score >= 0.4 ? bestCandidate.medicine : null,
    confidence,
    confidenceScore: bestScore,
    checks
  };
}
