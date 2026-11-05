import test from 'node:test';
import assert from 'node:assert/strict';
import { initDb, seedDatabase } from '../db.ts';
import { runSafetyCheck } from './safety.ts';

initDb();
seedDatabase();

test('Safety check for profile "Me" detects duplicate paracetamol and ibuprofen+aspirin interaction', () => {
  const result = runSafetyCheck(1); // Profile 1 is "Me"
  
  assert.ok(result.alerts.length >= 2, `Expected at least 2 alerts, got ${result.alerts.length}`);

  // 1. Verify Duplicate Paracetamol Alert
  const dupAlert = result.alerts.find(a => a.type === 'duplicate' && a.ingredients.includes('paracetamol'));
  assert.ok(dupAlert, 'Duplicate paracetamol alert should exist');
  assert.equal(dupAlert.severity, 'high');
  assert.ok(dupAlert.itemNames.some(n => n.includes('Dolo')));
  assert.ok(dupAlert.itemNames.some(n => n.includes('Combiflam')));
  assert.ok(dupAlert.explanation.includes('paracetamol'));
  assert.ok(dupAlert.explanation.includes('Please review this with your pharmacist or doctor.'));

  // 2. Verify Known Interaction Alert (Combiflam ibuprofen + Ecosprin aspirin)
  const intAlert = result.alerts.find(a => 
    a.type === 'known' && 
    (a.ingredients.includes('ibuprofen') && a.ingredients.includes('aspirin'))
  );
  assert.ok(intAlert, 'Ibuprofen + Aspirin interaction alert should exist');
  assert.equal(intAlert.severity, 'moderate');
  assert.ok(intAlert.explanation.includes('Please review this with your pharmacist or doctor.'));
});
