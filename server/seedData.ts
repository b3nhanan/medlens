/**
 * Seed data for MedLens verified local reference database,
 * multi-language medical glossary, curated interactions, and demo profiles.
 */

export interface MedicineRecord {
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
  refrigerate: number; // 0 or 1
  protect_light: number;
  protect_moisture: number;
  warnings: string[];
  do_not_use_if: string[];
  ask_pharmacist_if: string[];
  barcode: string;
  source_name: string;
  source_url: string;
}

export const VERIFIED_MEDICINES: MedicineRecord[] = [
  {
    id: 'dolo-650',
    brand_names: ['Dolo 650', 'Dolo'],
    generic_name: 'paracetamol',
    ingredients: [{ name: 'paracetamol', strength: '650 mg' }],
    strength_label: '650 mg',
    form: 'Tablet',
    category: 'Analgesic & antipyretic',
    drug_class: 'analgesic-antipyretic',
    manufacturer: 'Micro Labs Ltd',
    used_for_plain: 'Relieves mild to moderate pain (headaches, muscle aches, backaches) and reduces fever.',
    how_it_works_plain: 'Blocks pain-causing chemical messengers in the brain and acts on the temperature-regulating center to lower fever.',
    storage_text: 'Store below 30°C. Protect from light and moisture. Keep in dry place.',
    storage_max_temp_c: 30,
    storage_min_temp_c: null,
    refrigerate: 0,
    protect_light: 1,
    protect_moisture: 1,
    warnings: [
      'Do not take more than the label or doctor advises.',
      'Many cold, flu, and pain products also contain paracetamol. Taking multiples causes accidental overdose.',
      'Take special care if you have liver disease or drink alcohol regularly.',
      'Read the package leaflet and ask a pharmacist if unsure.'
    ],
    do_not_use_if: ['You are allergic to paracetamol', 'You have severe active liver failure'],
    ask_pharmacist_if: ['You take other pain or cough medications', 'You have kidney or liver problems'],
    barcode: '8901234500011',
    source_name: 'DailyMed / openFDA (demo-curated)',
    source_url: 'https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=paracetamol'
  },
  {
    id: 'crocin-500',
    brand_names: ['Crocin', 'Crocin 500'],
    generic_name: 'paracetamol',
    ingredients: [{ name: 'paracetamol', strength: '500 mg' }],
    strength_label: '500 mg',
    form: 'Tablet',
    category: 'Analgesic & antipyretic',
    drug_class: 'analgesic-antipyretic',
    manufacturer: 'GSK',
    used_for_plain: 'Relieves aches, pains, toothache, and helps lower fever in viral infections.',
    how_it_works_plain: 'Stops chemical messengers from sending pain signals to the brain and resets body temperature regulation.',
    storage_text: 'Store below 30°C in a dry place. Protect from moisture.',
    storage_max_temp_c: 30,
    storage_min_temp_c: null,
    refrigerate: 0,
    protect_light: 0,
    protect_moisture: 1,
    warnings: [
      'Do not exceed the recommended dose.',
      'Check all other pain or cold medicines to avoid taking duplicate paracetamol.',
      'Use caution if you have liver problems or frequent alcohol consumption.',
      'Read the package leaflet and ask a pharmacist if unsure.'
    ],
    do_not_use_if: ['Known hypersensitivity to paracetamol', 'Severe liver impairment'],
    ask_pharmacist_if: ['You are taking blood thinners like warfarin', 'Pain persists for over 3 days'],
    barcode: '8901234500028',
    source_name: 'DailyMed / openFDA (demo-curated)',
    source_url: 'https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=paracetamol'
  },
  {
    id: 'calpol-500',
    brand_names: ['Calpol 500', 'Calpol'],
    generic_name: 'paracetamol',
    ingredients: [{ name: 'paracetamol', strength: '500 mg' }],
    strength_label: '500 mg',
    form: 'Tablet',
    category: 'Analgesic & antipyretic',
    drug_class: 'analgesic-antipyretic',
    manufacturer: 'GSK',
    used_for_plain: 'Treats mild pain, fever, teething pain, and throat discomfort.',
    how_it_works_plain: 'Works on the central nervous system to decrease pain perception and cool the body during fever.',
    storage_text: 'Store below 30°C in a dry place. Protect from direct heat.',
    storage_max_temp_c: 30,
    storage_min_temp_c: null,
    refrigerate: 0,
    protect_light: 0,
    protect_moisture: 1,
    warnings: [
      'Do not take more than the label or doctor advises.',
      'Do not combine with any other paracetamol-containing remedy.',
      'Excessive paracetamol may cause irreversible liver damage.',
      'Read the package leaflet and ask a pharmacist if unsure.'
    ],
    do_not_use_if: ['Allergic to paracetamol', 'Severe hepatic impairment'],
    ask_pharmacist_if: ['You have malnutrition or chronic kidney disease'],
    barcode: '8901234500035',
    source_name: 'DailyMed / openFDA (demo-curated)',
    source_url: 'https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=paracetamol'
  },
  {
    id: 'combiflam',
    brand_names: ['Combiflam'],
    generic_name: 'ibuprofen + paracetamol',
    ingredients: [
      { name: 'ibuprofen', strength: '400 mg' },
      { name: 'paracetamol', strength: '325 mg' }
    ],
    strength_label: '400 mg + 325 mg',
    form: 'Tablet',
    category: 'Pain reliever (NSAID + analgesic)',
    drug_class: 'nsaid',
    manufacturer: 'Sanofi India Ltd',
    used_for_plain: 'Relieves moderate to severe body pain, joint pain, dental pain, fever, and inflammatory aches.',
    how_it_works_plain: 'Combines ibuprofen (which decreases inflammation and swelling) with paracetamol (which relieves pain and fever through the brain).',
    storage_text: 'Store below 25°C. Protect from light and direct moisture.',
    storage_max_temp_c: 25,
    storage_min_temp_c: null,
    refrigerate: 0,
    protect_light: 1,
    protect_moisture: 1,
    warnings: [
      'Can irritate the stomach; take with food or milk to prevent stomach upset.',
      'Contains paracetamol: do NOT take alongside Dolo, Crocin, or any other paracetamol product.',
      'Use caution with stomach ulcers, kidney problems, high blood pressure, or heart disease.',
      'Avoid if allergic to NSAIDs or aspirin.',
      'Read the package leaflet and ask a pharmacist if unsure.'
    ],
    do_not_use_if: ['History of stomach bleeding or peptic ulcer', 'Known allergy to ibuprofen, aspirin, or paracetamol', 'Third trimester of pregnancy'],
    ask_pharmacist_if: ['You take blood pressure tablets, aspirin, or blood thinners', 'You experience heartburn or stomach discomfort'],
    barcode: '8901234500042',
    source_name: 'DailyMed / openFDA (demo-curated)',
    source_url: 'https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=ibuprofen'
  },
  {
    id: 'brufen-400',
    brand_names: ['Brufen 400', 'Brufen'],
    generic_name: 'ibuprofen',
    ingredients: [{ name: 'ibuprofen', strength: '400 mg' }],
    strength_label: '400 mg',
    form: 'Tablet',
    category: 'NSAID pain & inflammation reliever',
    drug_class: 'nsaid',
    manufacturer: 'Abbott',
    used_for_plain: 'Reduces pain, stiffness, and inflammation caused by arthritis, sprains, muscle injuries, and backaches.',
    how_it_works_plain: 'Inhibits cyclooxygenase enzymes (COX) that produce inflammatory prostaglandins in tissues.',
    storage_text: 'Store below 30°C in a dry place. Protect from moisture.',
    storage_max_temp_c: 30,
    storage_min_temp_c: null,
    refrigerate: 0,
    protect_light: 0,
    protect_moisture: 1,
    warnings: [
      'Can irritate the stomach; take with or immediately after food.',
      'Avoid if you have active stomach ulcers, bleeding tendencies, or severe heart failure.',
      'Do not take alongside other NSAIDs like diclofenac or naproxen.',
      'Read the package leaflet and ask a pharmacist if unsure.'
    ],
    do_not_use_if: ['Active peptic ulcer or gastrointestinal hemorrhage', 'Asthma triggered by aspirin/NSAIDs'],
    ask_pharmacist_if: ['You have hypertension, kidney disease, or cardiovascular risk factors'],
    barcode: '8901234500059',
    source_name: 'DailyMed / openFDA (demo-curated)',
    source_url: 'https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=ibuprofen'
  },
  {
    id: 'voveran-50',
    brand_names: ['Voveran 50', 'Voveran'],
    generic_name: 'diclofenac',
    ingredients: [{ name: 'diclofenac', strength: '50 mg' }],
    strength_label: '50 mg',
    form: 'Tablet',
    category: 'NSAID pain & inflammation reliever',
    drug_class: 'nsaid',
    manufacturer: 'Novartis',
    used_for_plain: 'Treats intense joint swelling, rheumatoid arthritis, gout, dental pain, and post-injury stiffness.',
    how_it_works_plain: 'A potent nonsteroidal anti-inflammatory that targets enzymes responsible for pain-mediating chemicals.',
    storage_text: 'Store below 25°C. Protect from moisture and keep container tightly closed.',
    storage_max_temp_c: 25,
    storage_min_temp_c: null,
    refrigerate: 0,
    protect_light: 0,
    protect_moisture: 1,
    warnings: [
      'Can irritate the stomach lining; take with plenty of water after a meal.',
      'Use caution with kidney disease, heart conditions, or high blood pressure.',
      'Avoid taking with other NSAIDs (ibuprofen) or blood thinners (aspirin).',
      'Read the package leaflet and ask a pharmacist if unsure.'
    ],
    do_not_use_if: ['Severe heart failure or established ischemic heart disease', 'Active stomach ulcers or gastrointestinal perforation'],
    ask_pharmacist_if: ['You are elderly or on ACE inhibitors / ARB blood pressure medicines'],
    barcode: '8901234500066',
    source_name: 'DailyMed / openFDA (demo-curated)',
    source_url: 'https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=diclofenac'
  },
  {
    id: 'ecosprin-75',
    brand_names: ['Ecosprin 75', 'Ecosprin'],
    generic_name: 'aspirin',
    ingredients: [{ name: 'aspirin', strength: '75 mg' }],
    strength_label: '75 mg',
    form: 'Gastro-resistant tablet',
    category: 'Antiplatelet (blood thinner)',
    drug_class: 'antiplatelet',
    manufacturer: 'USV',
    used_for_plain: 'Prescribed to prevent blood clots, heart attacks, and strokes in people at cardiovascular risk.',
    how_it_works_plain: 'Prevents blood platelets from sticking together to form dangerous arterial clots.',
    storage_text: 'Store below 30°C in a dry place. Protect from moisture and heat.',
    storage_max_temp_c: 30,
    storage_min_temp_c: null,
    refrigerate: 0,
    protect_light: 0,
    protect_moisture: 1,
    warnings: [
      'Can increase bleeding risk (bruising, prolonged nosebleeds, bleeding gums).',
      'Do not stop unless your doctor specifically tells you to do so.',
      'Gastro-resistant coating protects stomach: swallow whole, do not crush or chew.',
      'Do not take alongside painkillers like ibuprofen without medical supervision.',
      'Read the package leaflet and ask a pharmacist if unsure.'
    ],
    do_not_use_if: ['Active bleeding disorders or severe thrombocytopenia', 'Children under 16 with viral illness (Reye syndrome risk)'],
    ask_pharmacist_if: ['You have upcoming surgery or dental procedures', 'You have asthma or history of stomach ulcers'],
    barcode: '8901234500073',
    source_name: 'DailyMed / openFDA (demo-curated)',
    source_url: 'https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=aspirin'
  },
  {
    id: 'clopilet-75',
    brand_names: ['Clopilet 75', 'Clopilet'],
    generic_name: 'clopidogrel',
    ingredients: [{ name: 'clopidogrel', strength: '75 mg' }],
    strength_label: '75 mg',
    form: 'Tablet',
    category: 'Antiplatelet',
    drug_class: 'antiplatelet',
    manufacturer: 'Sun Pharma',
    used_for_plain: 'Prevents blood clots after heart stents, heart attack, stroke, or peripheral artery disease.',
    how_it_works_plain: 'Selectively blocks ADP receptors on platelets, stopping them from aggregating.',
    storage_text: 'Store below 30°C in a dry place. Protect from excessive moisture.',
    storage_max_temp_c: 30,
    storage_min_temp_c: null,
    refrigerate: 0,
    protect_light: 0,
    protect_moisture: 1,
    warnings: [
      'Can increase bleeding risk. Tell all doctors and dentists you take clopidogrel.',
      'Do not stop without consulting your cardiologist, as stopping early can cause life-threatening clots.',
      'Omeprazole may significantly reduce how well clopidogrel protects you.',
      'Read the package leaflet and ask a pharmacist if unsure.'
    ],
    do_not_use_if: ['Active pathological bleeding such as peptic ulcer or intracranial hemorrhage', 'Severe liver impairment'],
    ask_pharmacist_if: ['You are scheduled for surgery or take proton pump inhibitors'],
    barcode: '8901234500080',
    source_name: 'DailyMed / openFDA (demo-curated)',
    source_url: 'https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=clopidogrel'
  },
  {
    id: 'allegra-120',
    brand_names: ['Allegra 120', 'Allegra'],
    generic_name: 'fexofenadine',
    ingredients: [{ name: 'fexofenadine', strength: '120 mg' }],
    strength_label: '120 mg',
    form: 'Tablet',
    category: 'Antihistamine (allergy)',
    drug_class: 'antihistamine',
    manufacturer: 'Sanofi',
    used_for_plain: 'Relieves allergy symptoms like sneezing, runny nose, itchy watery eyes, and hives without causing heavy drowsiness.',
    how_it_works_plain: 'Second-generation antihistamine that selectively blocks peripheral H1 histamine receptors.',
    storage_text: 'Store below 25°C. Protect from moisture. Keep in original blister pack.',
    storage_max_temp_c: 25,
    storage_min_temp_c: null,
    refrigerate: 0,
    protect_light: 0,
    protect_moisture: 1,
    warnings: [
      'Avoid taking with fruit juices (grapefruit, orange, apple) as they can reduce medicine absorption.',
      'Do not take antacids containing aluminum or magnesium within 2 hours of this medicine.',
      'Read the package leaflet and ask a pharmacist if unsure.'
    ],
    do_not_use_if: ['Known hypersensitivity to fexofenadine'],
    ask_pharmacist_if: ['You have kidney disease or are elderly'],
    barcode: '8901234500097',
    source_name: 'DailyMed / openFDA (demo-curated)',
    source_url: 'https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=fexofenadine'
  },
  {
    id: 'cetzine-10',
    brand_names: ['Cetzine', 'Cetzine 10'],
    generic_name: 'cetirizine',
    ingredients: [{ name: 'cetirizine', strength: '10 mg' }],
    strength_label: '10 mg',
    form: 'Tablet',
    category: 'Antihistamine (allergy)',
    drug_class: 'antihistamine',
    manufacturer: 'GSK',
    used_for_plain: 'Treats seasonal allergies, dust allergies, skin itching, hives, and continuous sneezing.',
    how_it_works_plain: 'Blocks histamine, the natural body chemical that produces redness, swelling, and itchiness during an allergic reaction.',
    storage_text: 'Store below 30°C in a dry place. Protect from moisture.',
    storage_max_temp_c: 30,
    storage_min_temp_c: null,
    refrigerate: 0,
    protect_light: 0,
    protect_moisture: 1,
    warnings: [
      'May cause mild drowsiness in some individuals. Avoid driving if feeling sleepy.',
      'Avoid drinking alcohol while taking cetirizine as it increases sedation.',
      'Do not combine with other antihistamines.',
      'Read the package leaflet and ask a pharmacist if unsure.'
    ],
    do_not_use_if: ['End-stage renal disease (CrCl < 10 ml/min) or undergoing dialysis', 'Allergy to hydroxyzine'],
    ask_pharmacist_if: ['You have prostate enlargement or difficulty urinating'],
    barcode: '8901234500103',
    source_name: 'DailyMed / openFDA (demo-curated)',
    source_url: 'https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=cetirizine'
  },
  {
    id: 'pan-40',
    brand_names: ['Pan 40', 'Pan'],
    generic_name: 'pantoprazole',
    ingredients: [{ name: 'pantoprazole', strength: '40 mg' }],
    strength_label: '40 mg',
    form: 'Gastro-resistant tablet',
    category: 'Acid reducer',
    drug_class: 'ppi',
    manufacturer: 'Alkem',
    used_for_plain: 'Treats acid reflux, heartburn, GERD, and heals stomach and intestinal ulcers.',
    how_it_works_plain: 'A proton pump inhibitor (PPI) that turns off the acid-producing pumps in the stomach lining.',
    storage_text: 'Store below 25°C. Protect from moisture and excessive light.',
    storage_max_temp_c: 25,
    storage_min_temp_c: null,
    refrigerate: 0,
    protect_light: 1,
    protect_moisture: 1,
    warnings: [
      'Take 30 to 60 minutes before morning breakfast with a full glass of water.',
      'Swallow whole: do not crush, split, or chew the tablet.',
      'Long-term daily use should only be done under doctor supervision.',
      'Read the package leaflet and ask a pharmacist if unsure.'
    ],
    do_not_use_if: ['Allergy to pantoprazole or other substituted benzimidazoles'],
    ask_pharmacist_if: ['You have unexplained weight loss, difficulty swallowing, or persistent stomach pain'],
    barcode: '8901234500110',
    source_name: 'DailyMed / openFDA (demo-curated)',
    source_url: 'https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=pantoprazole'
  },
  {
    id: 'omez-20',
    brand_names: ['Omez 20', 'Omez'],
    generic_name: 'omeprazole',
    ingredients: [{ name: 'omeprazole', strength: '20 mg' }],
    strength_label: '20 mg',
    form: 'Capsule',
    category: 'Acid reducer',
    drug_class: 'ppi',
    manufacturer: "Dr. Reddy's",
    used_for_plain: 'Reduces excess stomach acid, relieves frequent heartburn, and protects the stomach while on strong medications.',
    how_it_works_plain: 'Directly blocks the final step of acid secretion in the stomach wall cells.',
    storage_text: 'Store below 25°C in a dry place. Keep container tightly closed to protect from moisture.',
    storage_max_temp_c: 25,
    storage_min_temp_c: null,
    refrigerate: 0,
    protect_light: 0,
    protect_moisture: 1,
    warnings: [
      'Take before breakfast for best effectiveness.',
      'Can weaken the anti-clotting action of clopidogrel. Discuss with doctor if taking both.',
      'Do not combine with another PPI like pantoprazole.',
      'Read the package leaflet and ask a pharmacist if unsure.'
    ],
    do_not_use_if: ['Concomitant administration with nelfinavir', 'Allergy to omeprazole'],
    ask_pharmacist_if: ['You are taking clopidogrel, digoxin, or antifungal medicines'],
    barcode: '8901234500127',
    source_name: 'DailyMed / openFDA (demo-curated)',
    source_url: 'https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=omeprazole'
  },
  {
    id: 'glycomet-500',
    brand_names: ['Glycomet 500', 'Glycomet'],
    generic_name: 'metformin',
    ingredients: [{ name: 'metformin', strength: '500 mg' }],
    strength_label: '500 mg',
    form: 'Tablet',
    category: 'Blood-sugar lowering (diabetes)',
    drug_class: 'biguanide',
    manufacturer: 'USV',
    used_for_plain: 'Lowers high blood sugar in patients with type 2 diabetes mellitus.',
    how_it_works_plain: 'Reduces glucose production in the liver, lowers intestinal absorption of sugars, and makes body cells more sensitive to insulin.',
    storage_text: 'Store below 30°C in a dry place. Protect from moisture.',
    storage_max_temp_c: 30,
    storage_min_temp_c: null,
    refrigerate: 0,
    protect_light: 0,
    protect_moisture: 1,
    warnings: [
      'Take with meals to minimize temporary stomach upset or diarrhea.',
      'Avoid heavy or binge alcohol intake while on metformin.',
      'Must be temporarily paused before radiological scans using iodinated contrast dye.',
      'Read the package leaflet and ask a pharmacist if unsure.'
    ],
    do_not_use_if: ['Severe kidney dysfunction (eGFR < 30 mL/min)', 'Acute or chronic metabolic acidosis / diabetic ketoacidosis'],
    ask_pharmacist_if: ['You feel extreme weakness, unusual muscle pain, or difficulty breathing (rare lactic acidosis signs)'],
    barcode: '8901234500134',
    source_name: 'DailyMed / openFDA (demo-curated)',
    source_url: 'https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=metformin'
  },
  {
    id: 'amlong-5',
    brand_names: ['Amlong 5', 'Amlong'],
    generic_name: 'amlodipine',
    ingredients: [{ name: 'amlodipine', strength: '5 mg' }],
    strength_label: '5 mg',
    form: 'Tablet',
    category: 'Blood-pressure lowering',
    drug_class: 'calcium-channel-blocker',
    manufacturer: 'Micro Labs Ltd',
    used_for_plain: 'Treats high blood pressure (hypertension) and prevents chest pain (angina).',
    how_it_works_plain: 'Relaxes and widens the blood vessels so blood flows more easily, lowering workload on the heart.',
    storage_text: 'Store below 30°C. Protect from light and moisture.',
    storage_max_temp_c: 30,
    storage_min_temp_c: null,
    refrigerate: 0,
    protect_light: 1,
    protect_moisture: 1,
    warnings: [
      'Take regularly at the same time each day, with or without food.',
      'May cause mild ankle or lower leg swelling; report if persistent.',
      'Do not abruptly discontinue blood pressure medications.',
      'Read the package leaflet and ask a pharmacist if unsure.'
    ],
    do_not_use_if: ['Severe hypotension', 'Cardiogenic shock or severe aortic stenosis'],
    ask_pharmacist_if: ['You experience dizziness when standing up quickly', 'You have severe hepatic impairment'],
    barcode: '8901234500141',
    source_name: 'DailyMed / openFDA (demo-curated)',
    source_url: 'https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=amlodipine'
  },
  {
    id: 'telma-40',
    brand_names: ['Telma 40', 'Telma'],
    generic_name: 'telmisartan',
    ingredients: [{ name: 'telmisartan', strength: '40 mg' }],
    strength_label: '40 mg',
    form: 'Tablet',
    category: 'Blood-pressure lowering',
    drug_class: 'arb',
    manufacturer: 'Glenmark',
    used_for_plain: 'Treats hypertension (high blood pressure) and protects heart and kidney health in high-risk patients.',
    how_it_works_plain: 'An angiotensin II receptor blocker (ARB) that prevents hormones from constricting arteries.',
    storage_text: 'Store below 30°C. Protect from moisture. Keep in blister until immediately before taking.',
    storage_max_temp_c: 30,
    storage_min_temp_c: null,
    refrigerate: 0,
    protect_light: 0,
    protect_moisture: 1,
    warnings: [
      'Painkillers like ibuprofen or diclofenac may reduce the blood-pressure lowering power and stress the kidneys.',
      'Do not use during pregnancy as it can harm the developing fetus.',
      'Avoid excessive potassium supplements or salt substitutes containing potassium.',
      'Read the package leaflet and ask a pharmacist if unsure.'
    ],
    do_not_use_if: ['Pregnancy (causes fetal toxicity)', 'Biliary obstructive disorders'],
    ask_pharmacist_if: ['You take potassium-sparing diuretics or pain medications regularly'],
    barcode: '8901234500158',
    source_name: 'DailyMed / openFDA (demo-curated)',
    source_url: 'https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=telmisartan'
  },
  {
    id: 'augmentin-625',
    brand_names: ['Augmentin 625', 'Augmentin'],
    generic_name: 'amoxicillin + clavulanic acid',
    ingredients: [
      { name: 'amoxicillin', strength: '500 mg' },
      { name: 'clavulanic acid', strength: '125 mg' }
    ],
    strength_label: '500 mg + 125 mg',
    form: 'Tablet',
    category: 'Antibiotic',
    drug_class: 'penicillin-antibiotic',
    manufacturer: 'GSK',
    used_for_plain: 'Treats bacterial infections of the lungs, sinuses, ears, urinary tract, teeth, and skin.',
    how_it_works_plain: 'Amoxicillin kills bacteria while clavulanic acid blocks bacterial enzymes that try to destroy the antibiotic.',
    storage_text: 'Store below 25°C. Protect from moisture. Keep desiccant in package.',
    storage_max_temp_c: 25,
    storage_min_temp_c: null,
    refrigerate: 0,
    protect_light: 0,
    protect_moisture: 1,
    warnings: [
      'Tell your doctor immediately if you have any history of allergy to penicillin or cephalosporins.',
      'Finish the complete prescribed course even if you feel completely better.',
      'Take at the start of a meal to reduce digestive upset.',
      'Read the package leaflet and ask a pharmacist if unsure.'
    ],
    do_not_use_if: ['History of penicillin hypersensitivity or anaphylaxis', 'History of amoxicillin/clavulanate-associated jaundice or liver dysfunction'],
    ask_pharmacist_if: ['You develop skin rash, swelling, or persistent diarrhea'],
    barcode: '8901234500165',
    source_name: 'DailyMed / openFDA (demo-curated)',
    source_url: 'https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=amoxicillin'
  },
  {
    id: 'lantus-pen',
    brand_names: ['Lantus', 'Lantus Solostar'],
    generic_name: 'insulin glargine',
    ingredients: [{ name: 'insulin glargine', strength: '100 units/mL' }],
    strength_label: '100 units/mL',
    form: 'Pen injection',
    category: 'Long-acting insulin',
    drug_class: 'insulin',
    manufacturer: 'Sanofi',
    used_for_plain: 'Provides 24-hour baseline blood sugar control in adults and children with diabetes.',
    how_it_works_plain: 'A long-acting human insulin analog that slowly releases into the bloodstream at a steady, peakless rate.',
    storage_text: 'Unopened: refrigerate 2–8°C, do not freeze, protect from light. In-use pen: store below 30°C away from direct heat and light for up to 28 days. Do not refrigerate once opened.',
    storage_max_temp_c: 8,
    storage_min_temp_c: 2,
    refrigerate: 1,
    protect_light: 1,
    protect_moisture: 0,
    warnings: [
      'Never share insulin pens or needles with anyone else due to infection risk.',
      'Low blood sugar (hypoglycemia) can occur; always keep fast-acting glucose handy.',
      'Do not freeze. Discard if pen has been frozen.',
      'Follow your doctor’s instructions carefully. Read the package leaflet and ask a pharmacist if unsure.'
    ],
    do_not_use_if: ['During episodes of hypoglycemia', 'Known hypersensitivity to insulin glargine'],
    ask_pharmacist_if: ['You change exercise or meal patterns', 'You have illness with fever or vomiting'],
    barcode: '8901234500172',
    source_name: 'DailyMed / openFDA (demo-curated)',
    source_url: 'https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=insulin'
  }
];

export interface GlossaryEntry {
  term: string;
  definitions: {
    en: string;
    ta: string;
    hi: string;
    te: string;
  };
}

export const GLOSSARY_TERMS: GlossaryEntry[] = [
  {
    term: 'Analgesic',
    definitions: {
      en: 'Medicine used to relieve pain without causing loss of consciousness.',
      ta: 'வலியைப் போக்கப் பயன்படும் வலி நிவாரணி மருந்து.',
      hi: 'दर्द से राहत दिलाने वाली दवा (दर्द निवारक).',
      te: 'నొప్పిని తగ్గించడానికి ఉపయోగించే ఔషధం (నొప్పి నివారిణి).'
    }
  },
  {
    term: 'Antipyretic',
    definitions: {
      en: 'Medicine used to reduce fever and bring high body temperature down to normal.',
      ta: 'காய்ச்சலைத் தணித்து உடல் வெப்பத்தைக் குறைக்கும் மருந்து.',
      hi: 'बुखार कम करने वाली दवा (ज्वरनाशक).',
      te: 'జ్వరాన్ని తగ్గించి శరీర ఉష్ణోగ్రతను సాధారణ స్థితికి తెచ్చే మందు.'
    }
  },
  {
    term: 'Contraindication',
    definitions: {
      en: 'A specific condition or disease in which a particular medicine must not be used because it could cause harm.',
      ta: 'ஒரு மருந்தை உட்கொள்ளக் கூடாத ஆபத்தான மருத்துவ நிலை.',
      hi: 'ऐसी स्थिति जिसमें किसी दवा का उपयोग हानिकारक होने के कारण वर्जित है.',
      te: 'హానికరం కావడం వల్ల నిర్దిష్ట మందును వాడకూడని పరిస్థితి.'
    }
  },
  {
    term: 'Side effects',
    definitions: {
      en: 'Unwanted or unexpected symptoms that may occur in addition to the desired therapeutic effect.',
      ta: 'மருந்தினால் ஏற்படும் தேவையற்ற பக்க விளைவுகள்.',
      hi: 'दवा के कारण होने वाले अवांछित या अप्रत्याशित प्रभाव.',
      te: 'మందు వాడకం వల్ల కలిగే అవాంఛిత దుష్ప్రభావాలు.'
    }
  },
  {
    term: 'Active ingredient',
    definitions: {
      en: 'The exact chemical substance in a medicine that produces the intended health effect.',
      ta: 'மருந்தில் உள்ள முதன்மையான நோய் தீர்க்கும் மூலப்பொருள்.',
      hi: 'दवा का वह मुख्य घटक जो बीमारी पर सीधा असर करता है.',
      te: 'ఔషధంలో చికిత్స అందించే క్రియాశీల రసాయన పదార్థం.'
    }
  },
  {
    term: 'NSAID',
    definitions: {
      en: 'Non-Steroidal Anti-Inflammatory Drug: a pain and inflammation reliever that can irritate the stomach lining.',
      ta: 'வீக்கத்தைக் குறைக்கும் மற்றும் வலி நிவாரணி மருந்து (வயிற்றில் எரிச்சலை ஏற்படுத்தலாம்).',
      hi: 'दर्द और सूजन कम करने वाली दवा जो पेट में जलन पैदा कर सकती है.',
      te: 'నొప్పి, వాపు తగ్గించే మందు (కడుపులో మంట కలిగించే అవకాశం ఉంది).'
    }
  },
  {
    term: 'PPI',
    definitions: {
      en: 'Proton Pump Inhibitor: a medicine that significantly reduces stomach acid production to treat reflux and ulcers.',
      ta: 'வயிற்றில் அமில உற்பத்தியைக் குறைத்து நெஞ்செரிச்சலைக் குணப்படுத்தும் மருந்து.',
      hi: 'पेट में एसिड बनने से रोकने वाली दवा (एसिडिटी और अल्सर के लिए).',
      te: 'కడుపులో యాసిడ్ ఉత్పత్తిని తగ్గించి అల్సర్లు, గుండెల్లో మంటను నయం చేసే మందు.'
    }
  },
  {
    term: 'Antihistamine',
    definitions: {
      en: 'Medicine that eases allergy symptoms like sneezing, runny nose, and itching by blocking histamine.',
      ta: 'தும்மல், அரிப்பு போன்ற ஒவ்வாமை (அலர்ஜி) அறிகுறிகளைத் தடுக்கும் மருந்து.',
      hi: 'एलर्जी, छींक और खुजली के लक्षणों को शांत करने वाली दवा.',
      te: 'అలర్జీ, తుమ్ములు, దురదలను అరికట్టే ఔషధం.'
    }
  },
  {
    term: 'Antiplatelet',
    definitions: {
      en: 'Medicine that makes blood platelets less sticky, preventing dangerous clots in arteries and heart.',
      ta: 'இரத்தம் உறைவதைத் தடுத்து மாரடைப்பிலிருந்து பாதுகாக்கும் இரத்தம் மெலிதாக்கும் மருந்து.',
      hi: 'खून के थक्के बनने से रोकने वाली दवा (रक्त पतला करने वाली).',
      te: 'రక్తం గడ్డకట్టకుండా ఆపి గుండెపోటును నివారించే మందు.'
    }
  },
  {
    term: 'Gastro-resistant',
    definitions: {
      en: 'A protective coating that stops the tablet from dissolving in stomach acid, allowing safe release in the intestines.',
      ta: 'வயிற்று அமிலத்தில் கரையாமல் குடலில் பாதுகாப்பாக கரையும் சிறப்புப் பூச்சு கொண்ட மாத்திரை.',
      hi: 'ऐसी कोटिंग जो दवा को पेट के तेजाब से बचाकर आंतों में सुरक्षित घोलती है.',
      te: 'కడుపులోని ఆమ్లానికి కరిగిపోకుండా పేగులలో సురక్షితంగా పనిచేసే పూత కలిగిన మాత్ర.'
    }
  },
  {
    term: 'Batch number',
    definitions: {
      en: 'A unique code printed on packaging that identifies the specific production lot manufactured by the laboratory.',
      ta: 'மருந்து தயாரிக்கப்பட்ட தொகுதியைக் குறிக்கும் தனிப்பட்ட எண்.',
      hi: 'दवा के निर्माण बैच की पहचान करने वाला विशेष कोड.',
      te: 'మందుల తయారీ విభాగాన్ని గుర్తించే ప్రత్యేక సంఖ్య.'
    }
  }
];

export interface CuratedInteraction {
  ingredient_a: string;
  ingredient_b: string;
  type: 'known' | 'same_class';
  severity: 'moderate' | 'high' | 'info';
  plain_explanation: string;
  source: string;
}

export const CURATED_INTERACTIONS: CuratedInteraction[] = [
  {
    ingredient_a: 'ibuprofen',
    ingredient_b: 'aspirin',
    type: 'known',
    severity: 'moderate',
    plain_explanation: 'Taking ibuprofen and aspirin together can raise the risk of stomach bleeding and ulcers. Additionally, ibuprofen may reduce the cardioprotective effect of low-dose aspirin.',
    source: 'Clinical Pharmacology & Curated Interaction DB'
  },
  {
    ingredient_a: 'ibuprofen',
    ingredient_b: 'diclofenac',
    type: 'same_class',
    severity: 'high',
    plain_explanation: 'Both ibuprofen and diclofenac are NSAIDs (non-steroidal anti-inflammatory drugs). Taking two NSAIDs at the same time significantly increases the risk of severe stomach bleeding, ulcers, and kidney strain.',
    source: 'Clinical Pharmacology & Curated Interaction DB'
  },
  {
    ingredient_a: 'diclofenac',
    ingredient_b: 'aspirin',
    type: 'known',
    severity: 'moderate',
    plain_explanation: 'Higher chance of stomach irritation and bleeding when taking diclofenac with aspirin. Please review this with your pharmacist or doctor.',
    source: 'Clinical Pharmacology & Curated Interaction DB'
  },
  {
    ingredient_a: 'ibuprofen',
    ingredient_b: 'telmisartan',
    type: 'known',
    severity: 'moderate',
    plain_explanation: 'NSAIDs like ibuprofen may weaken the blood-pressure-lowering effect of telmisartan and can strain the kidneys when used concurrently.',
    source: 'Clinical Pharmacology & Curated Interaction DB'
  },
  {
    ingredient_a: 'diclofenac',
    ingredient_b: 'telmisartan',
    type: 'known',
    severity: 'moderate',
    plain_explanation: 'NSAIDs like diclofenac may reduce the antihypertensive effectiveness of telmisartan and increase renal stress, particularly in elderly or dehydrated individuals.',
    source: 'Clinical Pharmacology & Curated Interaction DB'
  },
  {
    ingredient_a: 'omeprazole',
    ingredient_b: 'clopidogrel',
    type: 'known',
    severity: 'high',
    plain_explanation: 'Omeprazole inhibits the CYP2C19 enzyme needed to activate clopidogrel. This may significantly reduce how well clopidogrel protects you against blood clots.',
    source: 'FDA Drug Safety Communication / Curated Interaction DB'
  },
  {
    ingredient_a: 'aspirin',
    ingredient_b: 'clopidogrel',
    type: 'known',
    severity: 'info',
    plain_explanation: 'Together they raise bleeding risk (dual antiplatelet effect). Doctors sometimes intentionally prescribe them together after stents or heart procedures, so do not stop either without medical advice.',
    source: 'American College of Cardiology / Curated Interaction DB'
  },
  {
    ingredient_a: 'pantoprazole',
    ingredient_b: 'omeprazole',
    type: 'same_class',
    severity: 'moderate',
    plain_explanation: 'Both are Proton Pump Inhibitors (PPIs) that suppress stomach acid. Taking two medications from the same class is generally duplicative and increases potential side effects without added therapeutic benefit.',
    source: 'Clinical Pharmacology & Curated Interaction DB'
  },
  {
    ingredient_a: 'cetirizine',
    ingredient_b: 'fexofenadine',
    type: 'same_class',
    severity: 'moderate',
    plain_explanation: 'Both are antihistamines used for allergies. Taking two concurrent antihistamines may cause increased drowsiness, dry mouth, or other anticholinergic symptoms.',
    source: 'Clinical Pharmacology & Curated Interaction DB'
  }
];
