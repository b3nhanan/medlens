import { Router } from 'express';
import { z } from 'zod';
import { db, seedDatabase } from '../db.ts';
import { GLOSSARY_TERMS } from '../seedData.ts';
import { identifyMedicine } from '../lib/parser.ts';
import { runSafetyCheck } from '../lib/safety.ts';
import { lookupOpenFda, lookupRxNorm } from '../lib/external.ts';
import { explainMedicine, askQuestion } from '../lib/ai.ts';

export const apiRouter = Router();

// Health Check
apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'MedLens', timestamp: new Date().toISOString() });
});

// Profiles
apiRouter.get('/profiles', (req, res) => {
  try {
    const profiles = db.prepare('SELECT * FROM profiles ORDER BY id ASC').all();
    res.json(profiles);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const ProfileSchema = z.object({
  name: z.string().min(1),
  relation: z.string().default('Family'),
  avatar_color: z.string().default('#0D9488')
});

apiRouter.post('/profiles', (req, res) => {
  try {
    const data = ProfileSchema.parse(req.body);
    const nowIso = new Date().toISOString();
    const result = db.prepare(`
      INSERT INTO profiles (name, relation, avatar_color, created_at)
      VALUES (?, ?, ?, ?)
    `).run(data.name, data.relation, data.avatar_color, nowIso);
    const profile = db.prepare('SELECT * FROM profiles WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(profile);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/profiles/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = ProfileSchema.partial().parse(req.body);
    const existing = db.prepare('SELECT * FROM profiles WHERE id = ?').get(id) as any;
    if (!existing) return res.status(404).json({ error: 'Profile not found' });

    db.prepare(`
      UPDATE profiles
      SET name = COALESCE(?, name),
          relation = COALESCE(?, relation),
          avatar_color = COALESCE(?, avatar_color)
      WHERE id = ?
    `).run(data.name ?? null, data.relation ?? null, data.avatar_color ?? null, id);

    const updated = db.prepare('SELECT * FROM profiles WHERE id = ?').get(id);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.delete('/profiles/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const countRow = db.prepare('SELECT COUNT(*) as count FROM profiles').get() as { count: number };
    if (countRow.count <= 1) {
      return res.status(400).json({ error: 'Cannot delete the only remaining profile' });
    }
    db.prepare('DELETE FROM profiles WHERE id = ?').run(id);
    res.json({ success: true, deletedId: id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Medicines search & detail
apiRouter.get('/medicines/search', (req, res) => {
  try {
    const query = String(req.query.q || '').trim().toLowerCase();
    const rows = db.prepare('SELECT * FROM medicines').all() as any[];
    const parsed = rows.map(r => ({
      ...r,
      brand_names: JSON.parse(r.brand_names),
      ingredients: JSON.parse(r.ingredients),
      warnings: JSON.parse(r.warnings),
      do_not_use_if: JSON.parse(r.do_not_use_if),
      ask_pharmacist_if: JSON.parse(r.ask_pharmacist_if)
    }));

    if (!query) {
      return res.json(parsed);
    }

    const filtered = parsed.filter(m => {
      const brandMatch = m.brand_names.some((b: string) => b.toLowerCase().includes(query));
      const genericMatch = m.generic_name.toLowerCase().includes(query);
      const ingredientMatch = m.ingredients.some((i: any) => i.name.toLowerCase().includes(query));
      const categoryMatch = m.category.toLowerCase().includes(query);
      return brandMatch || genericMatch || ingredientMatch || categoryMatch;
    });

    res.json(filtered);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/medicines/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM medicines WHERE id = ?').get(req.params.id) as any;
    if (!row) return res.status(404).json({ error: 'Medicine not found' });
    res.json({
      ...row,
      brand_names: JSON.parse(row.brand_names),
      ingredients: JSON.parse(row.ingredients),
      warnings: JSON.parse(row.warnings),
      do_not_use_if: JSON.parse(row.do_not_use_if),
      ask_pharmacist_if: JSON.parse(row.ask_pharmacist_if)
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Glossary
apiRouter.get('/glossary', (req, res) => {
  res.json(GLOSSARY_TERMS);
});

// OCR & Barcode Identification
apiRouter.post('/identify', (req, res) => {
  try {
    const { ocrText, barcode } = req.body || {};
    const result = identifyMedicine(ocrText || '', barcode);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// External Lookups
apiRouter.get('/lookup/openfda', async (req, res) => {
  try {
    const generic = String(req.query.generic || '');
    const data = await lookupOpenFda(generic);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ available: false, error: err.message });
  }
});

apiRouter.get('/lookup/rxnorm', async (req, res) => {
  try {
    const name = String(req.query.name || '');
    const data = await lookupRxNorm(name);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ available: false, error: err.message });
  }
});

// AI Explain & Ask
apiRouter.post('/explain', async (req, res) => {
  try {
    const { medicineId, language = 'en', level = 'simple' } = req.body || {};
    if (!medicineId) return res.status(400).json({ error: 'Missing medicineId' });
    const result = await explainMedicine(medicineId, language, level);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/ask', async (req, res) => {
  try {
    const { medicineId, question, language = 'en', history = [] } = req.body || {};
    if (!medicineId || !question) {
      return res.status(400).json({ error: 'Missing medicineId or question' });
    }
    const answer = await askQuestion(medicineId, question, language, history);
    res.json({ answer });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Cabinet CRUD
apiRouter.get('/cabinet', (req, res) => {
  try {
    const profileId = parseInt(String(req.query.profileId || '1'), 10);
    const rows = db.prepare(`
      SELECT c.*, m.generic_name, m.ingredients, m.strength_label, m.form,
             m.category, m.drug_class, m.refrigerate, m.protect_light, m.protect_moisture,
             m.storage_text, m.manufacturer
      FROM cabinet_items c
      JOIN medicines m ON c.medicine_id = m.id
      WHERE c.profile_id = ?
      ORDER BY c.added_at DESC
    `).all(profileId) as any[];

    const parsed = rows.map(r => ({
      ...r,
      ingredients: JSON.parse(r.ingredients)
    }));

    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const CabinetItemSchema = z.object({
  profile_id: z.number().int(),
  medicine_id: z.string().min(1),
  display_name: z.string().min(1),
  expiry_date: z.string().nullable().optional(),
  expiry_verified: z.number().int().default(1),
  batch_number: z.string().nullable().optional(),
  notes: z.string().nullable().optional()
});

apiRouter.post('/cabinet', (req, res) => {
  try {
    const data = CabinetItemSchema.parse(req.body);
    const nowIso = new Date().toISOString();
    const result = db.prepare(`
      INSERT INTO cabinet_items (
        profile_id, medicine_id, display_name, expiry_date, expiry_verified, batch_number, notes, added_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.profile_id,
      data.medicine_id,
      data.display_name,
      data.expiry_date || null,
      data.expiry_verified ?? 1,
      data.batch_number || null,
      data.notes || null,
      nowIso
    );

    const inserted = db.prepare('SELECT * FROM cabinet_items WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(inserted);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/cabinet/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = CabinetItemSchema.partial().parse(req.body);
    const existing = db.prepare('SELECT * FROM cabinet_items WHERE id = ?').get(id) as any;
    if (!existing) return res.status(404).json({ error: 'Cabinet item not found' });

    db.prepare(`
      UPDATE cabinet_items
      SET display_name = COALESCE(?, display_name),
          expiry_date = COALESCE(?, expiry_date),
          expiry_verified = COALESCE(?, expiry_verified),
          batch_number = COALESCE(?, batch_number),
          notes = COALESCE(?, notes)
      WHERE id = ?
    `).run(
      data.display_name ?? null,
      data.expiry_date !== undefined ? data.expiry_date : null,
      data.expiry_verified !== undefined ? data.expiry_verified : null,
      data.batch_number !== undefined ? data.batch_number : null,
      data.notes !== undefined ? data.notes : null,
      id
    );

    const updated = db.prepare('SELECT * FROM cabinet_items WHERE id = ?').get(id);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.delete('/cabinet/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    db.prepare('DELETE FROM cabinet_items WHERE id = ?').run(id);
    res.json({ success: true, deletedId: id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Safety Check
apiRouter.get('/safety-check', (req, res) => {
  try {
    const profileId = parseInt(String(req.query.profileId || '1'), 10);
    const result = runSafetyCheck(profileId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Reminders CRUD & Logging
apiRouter.get('/reminders', (req, res) => {
  try {
    const profileId = parseInt(String(req.query.profileId || '1'), 10);
    const rows = db.prepare(`
      SELECT r.*, c.display_name as medicine_name, c.expiry_date
      FROM reminders r
      LEFT JOIN cabinet_items c ON r.cabinet_item_id = c.id
      WHERE r.profile_id = ?
      ORDER BY r.id DESC
    `).all(profileId) as any[];

    const parsed = rows.map(r => ({
      ...r,
      times: JSON.parse(r.times),
      days: JSON.parse(r.days)
    }));

    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const ReminderSchema = z.object({
  profile_id: z.number().int(),
  cabinet_item_id: z.number().int().nullable().optional(),
  label: z.string().min(1),
  times: z.array(z.string()),
  days: z.array(z.number()),
  notify_caregiver: z.number().int().default(0),
  active: z.number().int().default(1)
});

apiRouter.post('/reminders', (req, res) => {
  try {
    const data = ReminderSchema.parse(req.body);
    const result = db.prepare(`
      INSERT INTO reminders (profile_id, cabinet_item_id, label, times, days, notify_caregiver, active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.profile_id,
      data.cabinet_item_id || null,
      data.label,
      JSON.stringify(data.times),
      JSON.stringify(data.days),
      data.notify_caregiver ?? 0,
      data.active ?? 1
    );

    const inserted = db.prepare('SELECT * FROM reminders WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(inserted);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/reminders/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = ReminderSchema.partial().parse(req.body);

    db.prepare(`
      UPDATE reminders
      SET label = COALESCE(?, label),
          times = COALESCE(?, times),
          days = COALESCE(?, days),
          notify_caregiver = COALESCE(?, notify_caregiver),
          active = COALESCE(?, active)
      WHERE id = ?
    `).run(
      data.label ?? null,
      data.times ? JSON.stringify(data.times) : null,
      data.days ? JSON.stringify(data.days) : null,
      data.notify_caregiver !== undefined ? data.notify_caregiver : null,
      data.active !== undefined ? data.active : null,
      id
    );

    const updated = db.prepare('SELECT * FROM reminders WHERE id = ?').get(id);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.delete('/reminders/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    db.prepare('DELETE FROM reminders WHERE id = ?').run(id);
    res.json({ success: true, deletedId: id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/reminders/:id/log', (req, res) => {
  try {
    const reminderId = parseInt(req.params.id, 10);
    const { scheduled_for, status } = req.body || {};
    if (!scheduled_for || !status) {
      return res.status(400).json({ error: 'Missing scheduled_for or status' });
    }
    const nowIso = new Date().toISOString();
    const result = db.prepare(`
      INSERT INTO reminder_log (reminder_id, scheduled_for, status, logged_at)
      VALUES (?, ?, ?, ?)
    `).run(reminderId, scheduled_for, status, nowIso);

    res.status(201).json({ id: result.lastInsertRowid, reminderId, scheduled_for, status });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/reminder-log', (req, res) => {
  try {
    const profileId = parseInt(String(req.query.profileId || '1'), 10);
    const logs = db.prepare(`
      SELECT l.*, r.label, r.times, c.display_name as medicine_name
      FROM reminder_log l
      JOIN reminders r ON l.reminder_id = r.id
      LEFT JOIN cabinet_items c ON r.cabinet_item_id = c.id
      WHERE r.profile_id = ?
      ORDER BY l.logged_at DESC
      LIMIT 50
    `).all(profileId);
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Emergency Card
apiRouter.get('/emergency/:profileId', (req, res) => {
  try {
    const profileId = parseInt(req.params.profileId, 10);
    let card = db.prepare('SELECT * FROM emergency_cards WHERE profile_id = ?').get(profileId) as any;
    if (!card) {
      // Create empty record if not present
      const nowIso = new Date().toISOString();
      db.prepare(`
        INSERT INTO emergency_cards (profile_id, allergies, doctor_instructions, contact_name, contact_phone, updated_at)
        VALUES (?, '', '', '', '', ?)
      `).run(profileId, nowIso);
      card = db.prepare('SELECT * FROM emergency_cards WHERE profile_id = ?').get(profileId);
    }
    res.json(card);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/emergency/:profileId', (req, res) => {
  try {
    const profileId = parseInt(req.params.profileId, 10);
    const { allergies, doctor_instructions, contact_name, contact_phone } = req.body || {};
    const nowIso = new Date().toISOString();
    db.prepare(`
      INSERT INTO emergency_cards (profile_id, allergies, doctor_instructions, contact_name, contact_phone, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(profile_id) DO UPDATE SET
        allergies = excluded.allergies,
        doctor_instructions = excluded.doctor_instructions,
        contact_name = excluded.contact_name,
        contact_phone = excluded.contact_phone,
        updated_at = excluded.updated_at
    `).run(
      profileId,
      allergies || '',
      doctor_instructions || '',
      contact_name || '',
      contact_phone || '',
      nowIso
    );

    const updated = db.prepare('SELECT * FROM emergency_cards WHERE profile_id = ?').get(profileId);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Reset Demo Data
apiRouter.post('/reset-demo', (req, res) => {
  try {
    seedDatabase();
    res.json({ success: true, message: 'Database reset to initial verified seed state' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
