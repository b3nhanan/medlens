import test from 'node:test';
import assert from 'node:assert/strict';
import { initDb } from '../db.ts';
import { normalizeExpiryDate, parseOcrText, identifyMedicine } from './parser.ts';

// Ensure DB is initialized
initDb();

test('normalizeExpiryDate correctly parses various formats', () => {
  // MM/YYYY
  assert.equal(normalizeExpiryDate('01/2028'), '2028-01-31');
  assert.equal(normalizeExpiryDate('11/2026'), '2026-11-30');
  // Month Name + YYYY
  assert.equal(normalizeExpiryDate('DEC 2026'), '2026-12-31');
  assert.equal(normalizeExpiryDate('NOV 2026'), '2026-11-30');
  assert.equal(normalizeExpiryDate('Exp. Date: DEC 2026'), '2026-12-31');
  // 2-digit year
  assert.equal(normalizeExpiryDate('11/26'), '2026-11-30');
  assert.equal(normalizeExpiryDate('11-26'), '2026-11-30');
  // Invalid
  assert.equal(normalizeExpiryDate('??/26'), null);
});

test('Demo Scan #1: Dolo 650 full extraction and High confidence', () => {
  const ocrText = "Dolo 650\nParacetamol Tablets IP 650 mg\nMfd. by: Micro Labs Ltd\nB.No. DL2290 MFG 12/2025 EXP 01/2028\nStore below 30°C. Protect from light and moisture.";
  
  const extracted = parseOcrText(ocrText);
  assert.equal(extracted.batch, 'DL2290');
  assert.equal(extracted.expiry, '2028-01-31');
  assert.ok(extracted.strength?.includes('650 mg'));
  assert.equal(extracted.form, 'Tablet');

  const identified = identifyMedicine(ocrText);
  assert.equal(identified.confidence, 'High');
  assert.equal(identified.best?.id, 'dolo-650');
  assert.ok(identified.checks.some(c => c.key === 'name' && c.status === 'ok'));
  assert.ok(identified.checks.some(c => c.key === 'expiry' && c.status === 'ok'));
});

test('Demo Scan #2: Combiflam full extraction and dual ingredients', () => {
  const ocrText = "COMBIFLAM\nIbuprofen 400 mg + Paracetamol 325 mg Tablets\nSanofi India Ltd\nBatch No: CF1187 Exp. Date: DEC 2026\nStore in a cool dry place below 25°C";
  
  const extracted = parseOcrText(ocrText);
  assert.equal(extracted.batch, 'CF1187');
  assert.equal(extracted.expiry, '2026-12-31');
  assert.ok(extracted.ingredients.includes('ibuprofen'));
  assert.ok(extracted.ingredients.includes('paracetamol'));

  const identified = identifyMedicine(ocrText);
  assert.equal(identified.confidence, 'High');
  assert.equal(identified.best?.id, 'combiflam');
  assert.ok(identified.checks.some(c => c.key === 'strength' && c.status === 'ok'));
});

test('Demo Scan #3: Deliberately unclear text gives Low confidence & warnings', () => {
  const ocrText = "C?oc1n\nParacet... Tabl\nB.No CR09 EXP ??/26";
  
  const extracted = parseOcrText(ocrText);
  assert.equal(extracted.expiry, null);
  assert.equal(extracted.strength, null);

  const identified = identifyMedicine(ocrText);
  assert.notEqual(identified.confidence, 'High');
  // Must have warnings for strength and expiry
  assert.ok(identified.checks.some(c => c.key === 'strength' && c.status === 'warn'));
  assert.ok(identified.checks.some(c => c.key === 'expiry' && c.status === 'warn'));
});

test('Barcode lookup returns High confidence immediately', () => {
  const identified = identifyMedicine('', '8901234500011');
  assert.equal(identified.confidence, 'High');
  assert.equal(identified.best?.id, 'dolo-650');
  assert.ok(identified.checks.some(c => c.key === 'barcode' && c.status === 'ok'));
});
