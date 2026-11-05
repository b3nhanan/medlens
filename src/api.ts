/**
 * MedLens API Client helper
 */

export interface Profile {
  id: number;
  name: string;
  relation: string;
  avatar_color: string;
  created_at: string;
}

export interface Medicine {
  id: string;
  brand_names: string[];
  generic_name: string;
  ingredients: Array<{ name: string; strength: string }>;
  strength_label: string;
  form: string;
  category: string;
  drug_class: string;
  manufacturer: string;
  used_for_plain: string;
  how_it_works_plain: string;
  storage_text: string;
  storage_max_temp_c: number | null;
  storage_min_temp_c: number | null;
  refrigerate: number;
  protect_light: number;
  protect_moisture: number;
  warnings: string[];
  do_not_use_if: string[];
  ask_pharmacist_if: string[];
  barcode: string;
  source_name: string;
  source_url: string;
}

export interface CabinetItem {
  id: number;
  profile_id: number;
  medicine_id: string;
  display_name: string;
  expiry_date: string | null;
  expiry_verified: number;
  batch_number: string | null;
  notes: string | null;
  added_at: string;
  generic_name?: string;
  ingredients?: Array<{ name: string; strength: string }>;
  strength_label?: string;
  form?: string;
  category?: string;
  drug_class?: string;
  refrigerate?: number;
  protect_light?: number;
  protect_moisture?: number;
  storage_text?: string;
  manufacturer?: string;
}

export interface SafetyAlert {
  id: string;
  type: 'duplicate' | 'known' | 'same_class';
  severity: 'high' | 'moderate' | 'info';
  items: number[];
  itemNames: string[];
  ingredients: string[];
  title: string;
  explanation: string;
  source: string;
}

export interface Reminder {
  id: number;
  profile_id: number;
  cabinet_item_id: number | null;
  label: string;
  times: string[];
  days: number[];
  notify_caregiver: number;
  active: number;
  medicine_name?: string;
}

export interface ReminderLog {
  id: number;
  reminder_id: number;
  scheduled_for: string;
  status: 'taken' | 'skipped' | 'missed' | 'pending';
  logged_at: string;
  label?: string;
  medicine_name?: string;
}

export interface EmergencyCard {
  profile_id: number;
  allergies: string;
  doctor_instructions: string;
  contact_name: string;
  contact_phone: string;
  updated_at: string;
}

export interface IdentifyResult {
  extracted: {
    name: string | null;
    strength: string | null;
    ingredients: string[];
    form: string | null;
    manufacturer: string | null;
    expiry: string | null;
    expiryRaw: string | null;
    batch: string | null;
    mfg: string | null;
  };
  candidates: Array<{ medicine: Medicine; score: number }>;
  best: Medicine | null;
  confidence: 'High' | 'Medium' | 'Low';
  confidenceScore: number;
  checks: Array<{ key: string; status: 'ok' | 'warn'; message: string }>;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    }
  });
  if (!res.ok) {
    let errMessage = `Request failed: ${res.statusText}`;
    try {
      const errJson = await res.json();
      if (errJson.error) errMessage = errJson.error;
    } catch {}
    throw new Error(errMessage);
  }
  return res.json();
}

export const api = {
  // Profiles
  getProfiles: () => request<Profile[]>('/api/profiles'),
  createProfile: (data: { name: string; relation: string; avatar_color: string }) =>
    request<Profile>('/api/profiles', { method: 'POST', body: JSON.stringify(data) }),
  updateProfile: (id: number, data: Partial<Profile>) =>
    request<Profile>(`/api/profiles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProfile: (id: number) =>
    request<{ success: boolean }>(`/api/profiles/${id}`, { method: 'DELETE' }),

  // Medicines
  searchMedicines: (query = '') =>
    request<Medicine[]>(`/api/medicines/search?q=${encodeURIComponent(query)}`),
  getMedicineById: (id: string) =>
    request<Medicine>(`/api/medicines/${id}`),

  // Glossary
  getGlossary: () =>
    request<Array<{ term: string; definitions: Record<string, string> }>>('/api/glossary'),

  // Identify / Scan
  identify: (data: { ocrText: string; barcode?: string }) =>
    request<IdentifyResult>('/api/identify', { method: 'POST', body: JSON.stringify(data) }),

  // External Enrichment
  lookupOpenFda: (generic: string) =>
    request<any>(`/api/lookup/openfda?generic=${encodeURIComponent(generic)}`),
  lookupRxNorm: (name: string) =>
    request<any>(`/api/lookup/rxnorm?name=${encodeURIComponent(name)}`),

  // AI Explain & Ask
  explain: (medicineId: string, language = 'en', level = 'simple') =>
    request<any>('/api/explain', {
      method: 'POST',
      body: JSON.stringify({ medicineId, language, level })
    }),
  ask: (medicineId: string, question: string, language = 'en', history: any[] = []) =>
    request<{ answer: string }>('/api/ask', {
      method: 'POST',
      body: JSON.stringify({ medicineId, question, language, history })
    }),

  // Cabinet
  getCabinet: (profileId: number) =>
    request<CabinetItem[]>(`/api/cabinet?profileId=${profileId}`),
  addCabinetItem: (data: Partial<CabinetItem>) =>
    request<CabinetItem>('/api/cabinet', { method: 'POST', body: JSON.stringify(data) }),
  updateCabinetItem: (id: number, data: Partial<CabinetItem>) =>
    request<CabinetItem>(`/api/cabinet/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCabinetItem: (id: number) =>
    request<{ success: boolean }>(`/api/cabinet/${id}`, { method: 'DELETE' }),

  // Safety Check
  getSafetyCheck: (profileId: number) =>
    request<{ alerts: SafetyAlert[]; itemCount: number }>(`/api/safety-check?profileId=${profileId}`),

  // Reminders
  getReminders: (profileId: number) =>
    request<Reminder[]>(`/api/reminders?profileId=${profileId}`),
  createReminder: (data: Partial<Reminder>) =>
    request<Reminder>('/api/reminders', { method: 'POST', body: JSON.stringify(data) }),
  updateReminder: (id: number, data: Partial<Reminder>) =>
    request<Reminder>(`/api/reminders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteReminder: (id: number) =>
    request<{ success: boolean }>(`/api/reminders/${id}`, { method: 'DELETE' }),
  logReminder: (id: number, scheduled_for: string, status: 'taken' | 'skipped' | 'missed') =>
    request<any>(`/api/reminders/${id}/log`, {
      method: 'POST',
      body: JSON.stringify({ scheduled_for, status })
    }),
  getReminderLogs: (profileId: number) =>
    request<ReminderLog[]>(`/api/reminder-log?profileId=${profileId}`),

  // Emergency Card
  getEmergencyCard: (profileId: number) =>
    request<EmergencyCard>(`/api/emergency/${profileId}`),
  updateEmergencyCard: (profileId: number, data: Partial<EmergencyCard>) =>
    request<EmergencyCard>(`/api/emergency/${profileId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // Reset Demo Data
  resetDemo: () =>
    request<{ success: boolean; message: string }>('/api/reset-demo', { method: 'POST' })
};
