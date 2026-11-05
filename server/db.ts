import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { VERIFIED_MEDICINES, CURATED_INTERACTIONS } from './seedData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, '../medlens.db');

export const db = new Database(DB_PATH, { timeout: 10000 });
// Set pragmas safely
try {
  db.pragma('journal_mode = WAL');
  db.pragma('busy_timeout = 10000');
} catch {}

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      relation TEXT NOT NULL,
      avatar_color TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS medicines (
      id TEXT PRIMARY KEY,
      brand_names TEXT NOT NULL,
      generic_name TEXT NOT NULL,
      ingredients TEXT NOT NULL,
      strength_label TEXT NOT NULL,
      form TEXT NOT NULL,
      category TEXT NOT NULL,
      drug_class TEXT NOT NULL,
      manufacturer TEXT NOT NULL,
      used_for_plain TEXT NOT NULL,
      how_it_works_plain TEXT NOT NULL,
      storage_text TEXT NOT NULL,
      storage_max_temp_c INTEGER,
      storage_min_temp_c INTEGER,
      refrigerate INTEGER NOT NULL DEFAULT 0,
      protect_light INTEGER NOT NULL DEFAULT 0,
      protect_moisture INTEGER NOT NULL DEFAULT 0,
      warnings TEXT NOT NULL,
      do_not_use_if TEXT NOT NULL,
      ask_pharmacist_if TEXT NOT NULL,
      barcode TEXT,
      source_name TEXT NOT NULL,
      source_url TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cabinet_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER NOT NULL,
      medicine_id TEXT NOT NULL,
      display_name TEXT NOT NULL,
      expiry_date TEXT,
      expiry_verified INTEGER NOT NULL DEFAULT 1,
      batch_number TEXT,
      notes TEXT,
      added_at TEXT NOT NULL,
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
      FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER NOT NULL,
      cabinet_item_id INTEGER,
      label TEXT NOT NULL,
      times TEXT NOT NULL,
      days TEXT NOT NULL,
      notify_caregiver INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
      FOREIGN KEY (cabinet_item_id) REFERENCES cabinet_items(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS reminder_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reminder_id INTEGER NOT NULL,
      scheduled_for TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('taken', 'skipped', 'missed', 'pending')),
      logged_at TEXT NOT NULL,
      FOREIGN KEY (reminder_id) REFERENCES reminders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS emergency_cards (
      profile_id INTEGER PRIMARY KEY,
      allergies TEXT NOT NULL,
      doctor_instructions TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      contact_phone TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS interactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ingredient_a TEXT NOT NULL,
      ingredient_b TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('known', 'same_class')),
      severity TEXT NOT NULL CHECK(severity IN ('moderate', 'high', 'info')),
      plain_explanation TEXT NOT NULL,
      source TEXT NOT NULL
    );
  `);

  const countRow = db.prepare('SELECT COUNT(*) as count FROM medicines').get() as { count: number };
  if (countRow.count === 0) {
    seedDatabase();
  }
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function seedDatabase() {
  const now = new Date();
  const nowIso = now.toISOString();

  // Clear existing data safely
  db.exec(`
    DELETE FROM reminder_log;
    DELETE FROM reminders;
    DELETE FROM emergency_cards;
    DELETE FROM cabinet_items;
    DELETE FROM profiles;
    DELETE FROM interactions;
    DELETE FROM medicines;
  `);

  // 1. Insert Verified Medicines
  const insertMed = db.prepare(`
    INSERT INTO medicines (
      id, brand_names, generic_name, ingredients, strength_label, form,
      category, drug_class, manufacturer, used_for_plain, how_it_works_plain,
      storage_text, storage_max_temp_c, storage_min_temp_c, refrigerate,
      protect_light, protect_moisture, warnings, do_not_use_if, ask_pharmacist_if,
      barcode, source_name, source_url
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);

  for (const m of VERIFIED_MEDICINES) {
    insertMed.run(
      m.id,
      JSON.stringify(m.brand_names),
      m.generic_name,
      JSON.stringify(m.ingredients),
      m.strength_label,
      m.form,
      m.category,
      m.drug_class,
      m.manufacturer,
      m.used_for_plain,
      m.how_it_works_plain,
      m.storage_text,
      m.storage_max_temp_c,
      m.storage_min_temp_c,
      m.refrigerate,
      m.protect_light,
      m.protect_moisture,
      JSON.stringify(m.warnings),
      JSON.stringify(m.do_not_use_if),
      JSON.stringify(m.ask_pharmacist_if),
      m.barcode,
      m.source_name,
      m.source_url
    );
  }

  // 2. Insert Curated Interactions
  const insertInteraction = db.prepare(`
    INSERT INTO interactions (ingredient_a, ingredient_b, type, severity, plain_explanation, source)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const it of CURATED_INTERACTIONS) {
    insertInteraction.run(
      it.ingredient_a.toLowerCase(),
      it.ingredient_b.toLowerCase(),
      it.type,
      it.severity,
      it.plain_explanation,
      it.source
    );
  }

  // 3. Insert Profiles: Me (1), Grandma (2), Dad (3)
  const insertProfile = db.prepare(`
    INSERT INTO profiles (id, name, relation, avatar_color, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertProfile.run(1, 'Me', 'Self', '#0D9488', nowIso);
  insertProfile.run(2, 'Grandma', 'Grandmother', '#8B5CF6', nowIso);
  insertProfile.run(3, 'Dad', 'Father', '#3B82F6', nowIso);

  // 4. Relative dates calculation
  const addMonths = (months: number) => {
    const d = new Date(now);
    d.setMonth(d.getMonth() + months);
    return formatDate(d);
  };
  const addDays = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    return formatDate(d);
  };

  const insertCabinet = db.prepare(`
    INSERT INTO cabinet_items (
      profile_id, medicine_id, display_name, expiry_date, expiry_verified, batch_number, notes, added_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Cabinet for "Me" (id: 1)
  // Dolo 650: expiry today + 14 months (Valid), batch DL2290
  const doloItem = insertCabinet.run(1, 'dolo-650', 'Dolo 650', addMonths(14), 1, 'DL2290', 'For fever or headaches', nowIso);
  // Combiflam: expiry today + 20 days (Expiring soon <= 60 days), batch CF1187
  insertCabinet.run(1, 'combiflam', 'Combiflam', addDays(20), 1, 'CF1187', 'Take with food for body ache', nowIso);
  // Crocin: expiry today - 25 days (Expired), batch CR0931
  insertCabinet.run(1, 'crocin-500', 'Crocin 500', addDays(-25), 1, 'CR0931', 'Older strip in drawer', nowIso);
  // Pan 40: expiry today + 9 months (Valid), batch PN4410
  const panItem = insertCabinet.run(1, 'pan-40', 'Pan 40', addMonths(9), 1, 'PN4410', 'Take before morning breakfast', nowIso);
  // Ecosprin 75: expiry today + 11 months (Valid)
  insertCabinet.run(1, 'ecosprin-75', 'Ecosprin 75', addMonths(11), 1, 'EC8812', 'Prescribed blood thinner', nowIso);
  // Lantus pen: expiry today + 6 months (Valid), refrigerated
  insertCabinet.run(1, 'lantus-pen', 'Lantus Solostar', addMonths(6), 1, 'LT4402', 'Store unopened in door of fridge (2-8°C)', nowIso);

  // Cabinet for "Grandma" (id: 2)
  insertCabinet.run(2, 'amlong-5', 'Amlong 5', addMonths(12), 1, 'AM902', 'Morning BP pill', nowIso);
  insertCabinet.run(2, 'telma-40', 'Telma 40', addMonths(8), 1, 'TL771', 'Blood pressure management', nowIso);
  insertCabinet.run(2, 'glycomet-500', 'Glycomet 500', addMonths(10), 1, 'GL550', 'Twice daily with meals', nowIso);
  insertCabinet.run(2, 'voveran-50', 'Voveran 50', addMonths(5), 1, 'VV210', 'For knee joint pain as directed', nowIso);

  // 5. Emergency Card for "Me"
  const insertEmergency = db.prepare(`
    INSERT INTO emergency_cards (profile_id, allergies, doctor_instructions, contact_name, contact_phone, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertEmergency.run(
    1,
    'Penicillin (causes hives and facial swelling)',
    'Monitor blood pressure weekly. Take cardiac medication in morning. Never stop blood thinners without cardiology consent.',
    'Priya (Sister)',
    '+91 90000 00000',
    nowIso
  );

  // 6. Reminders for "Me"
  const insertReminder = db.prepare(`
    INSERT INTO reminders (profile_id, cabinet_item_id, label, times, days, notify_caregiver, active)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const r1 = insertReminder.run(
    1,
    doloItem.lastInsertRowid,
    'Dolo 650 (As needed post-surgery)',
    JSON.stringify(['08:00']),
    JSON.stringify([0, 1, 2, 3, 4, 5, 6]),
    1, // Caregiver notified
    1
  );
  const r2 = insertReminder.run(
    1,
    panItem.lastInsertRowid,
    'Pan 40 before breakfast',
    JSON.stringify(['07:30']),
    JSON.stringify([0, 1, 2, 3, 4, 5, 6]),
    0,
    1
  );

  // 7. Seeded Reminder Logs for History
  const insertLog = db.prepare(`
    INSERT INTO reminder_log (reminder_id, scheduled_for, status, logged_at)
    VALUES (?, ?, ?, ?)
  `);
  const yesterday = addDays(-1);
  const twoDaysAgo = addDays(-2);

  insertLog.run(Number(r1.lastInsertRowid), `${twoDaysAgo}T08:00:00`, 'taken', `${twoDaysAgo}T08:04:12`);
  insertLog.run(Number(r2.lastInsertRowid), `${twoDaysAgo}T07:30:00`, 'taken', `${twoDaysAgo}T07:32:00`);
  insertLog.run(Number(r1.lastInsertRowid), `${yesterday}T08:00:00`, 'taken', `${yesterday}T08:02:40`);
  insertLog.run(Number(r2.lastInsertRowid), `${yesterday}T07:30:00`, 'skipped', `${yesterday}T08:15:00`);
}
