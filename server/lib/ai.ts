import { GoogleGenAI } from '@google/genai';
import { db } from '../db.ts';
import { GLOSSARY_TERMS } from '../seedData.ts';
import { lookupOpenFda } from './external.ts';

const SYSTEM_PROMPT = `You are MedLens, a medicine-information explainer. You may ONLY use the VERIFIED RECORD provided below. Rewrite and explain it in simple, kind, plain language at a Grade-6 reading level (or slightly more detail if asked), in the requested language. Keep every warning from the record; never remove or soften warnings. NEVER invent facts, doses, schedules, or advice. NEVER diagnose, recommend a medicine, or tell the user to start/stop/change a medicine or dose. If the question cannot be answered from the record, or is personal medical advice, say: "I can't advise on that from the verified information. Please ask your pharmacist or doctor." Always end explanations with: "Always check the package leaflet and ask your pharmacist if you are unsure." Respond as JSON for /explain with keys: summary, ingredients_explained[], warnings_explained[], storage_explained, safety_note. For /ask respond as plain text of at most 120 words, followed by a line "Source: <source_name>".`;

export interface ExplainResponse {
  summary: string;
  ingredients_explained: Array<{ name: string; explanation: string }>;
  warnings_explained: string[];
  storage_explained: string;
  safety_note: string;
  translation_notice?: string;
  source: string;
}

function getMedicineRecord(medicineId: string) {
  const row = db.prepare('SELECT * FROM medicines WHERE id = ?').get(medicineId) as any;
  if (!row) return null;
  return {
    ...row,
    brand_names: JSON.parse(row.brand_names),
    ingredients: JSON.parse(row.ingredients),
    warnings: JSON.parse(row.warnings),
    do_not_use_if: JSON.parse(row.do_not_use_if),
    ask_pharmacist_if: JSON.parse(row.ask_pharmacist_if)
  };
}

export function buildDeterministicExplanation(
  med: any,
  language: string,
  level: 'simple' | 'detailed'
): ExplainResponse {
  const isSimple = level === 'simple';
  const brand = med.brand_names[0];

  const ingredientsExplained = med.ingredients.map((ing: any) => {
    const term = GLOSSARY_TERMS.find(g => g.term.toLowerCase() === ing.name.toLowerCase());
    const glossaryDef = term ? term.definitions.en : '';
    return {
      name: `${ing.name} (${ing.strength})`,
      explanation: isSimple
        ? `${ing.name} is the active medicine substance (${ing.strength}) that works directly in the body to ${med.how_it_works_plain.toLowerCase()}`
        : `${ing.name} is formulated at ${ing.strength}. Function: ${med.how_it_works_plain}. ${glossaryDef}`
    };
  });

  const warningsExplained = [
    ...med.warnings.map((w: string) => isSimple ? `• ${w}` : `• Precaution: ${w}`),
    ...med.do_not_use_if.map((d: string) => `• Do NOT use if: ${d}`)
  ];

  const storageExplained = isSimple
    ? `${med.storage_text}. ${med.refrigerate ? 'Keep in the refrigerator between 2°C and 8°C (do not freeze).' : 'Keep in a cool, dry spot away from direct sunlight.'}`
    : `Temperature & storage specification: ${med.storage_text}. Protect from humidity and heat. Keep out of reach of children.`;

  const summary = isSimple
    ? `${brand} is used to ${med.used_for_plain.toLowerCase()} It contains ${med.ingredients.map((i: any) => `${i.name} ${i.strength}`).join(', ')}.`
    : `${brand} (${med.generic_name}) belongs to the ${med.category} class. Indication: ${med.used_for_plain} Mechanism: ${med.how_it_works_plain}`;

  return {
    summary,
    ingredients_explained: ingredientsExplained,
    warnings_explained: warningsExplained,
    storage_explained: storageExplained,
    safety_note: 'Always check the package leaflet and ask your pharmacist if you are unsure.',
    translation_notice: language !== 'en' ? 'Add an API key to enable full AI translation for this language' : undefined,
    source: med.source_name
  };
}

export async function explainMedicine(
  medicineId: string,
  language: 'en' | 'ta' | 'hi' | 'te' = 'en',
  level: 'simple' | 'detailed' = 'simple'
): Promise<ExplainResponse> {
  const med = getMedicineRecord(medicineId);
  if (!med) {
    throw new Error('Medicine not found in verified database');
  }

  // Attempt external openFDA context
  let openFdaExtra = '';
  try {
    const fda = await lookupOpenFda(med.generic_name);
    if (fda && fda.available && fda.indicationsAndUsage) {
      openFdaExtra = `\nOpenFDA Indication: ${fda.indicationsAndUsage.slice(0, 300)}`;
    }
  } catch {}

  const contextBlock = `
VERIFIED RECORD:
Brand Name: ${med.brand_names.join(', ')}
Generic Name: ${med.generic_name}
Form: ${med.form}
Category: ${med.category} (${med.drug_class})
Ingredients: ${JSON.stringify(med.ingredients)}
Used For: ${med.used_for_plain}
How it works: ${med.how_it_works_plain}
Storage: ${med.storage_text} (Refrigerate: ${med.refrigerate ? 'Yes' : 'No'})
Warnings: ${JSON.stringify(med.warnings)}
Do not use if: ${JSON.stringify(med.do_not_use_if)}
Ask pharmacist if: ${JSON.stringify(med.ask_pharmacist_if)}
Source: ${med.source_name} (${med.source_url})
${openFdaExtra}
  `.trim();

  // Try LLM if GEMINI_API_KEY or ANTHROPIC_API_KEY is available
  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (geminiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const prompt = `${SYSTEM_PROMPT}\n\nLanguage requested: ${language}\nReading level: ${level}\n\n${contextBlock}\n\nRespond with a valid JSON object only.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = response.text?.trim() || '';
      const parsed = JSON.parse(text);
      if (parsed.summary && parsed.ingredients_explained && parsed.warnings_explained) {
        return {
          ...parsed,
          source: med.source_name,
          safety_note: parsed.safety_note || 'Always check the package leaflet and ask your pharmacist if you are unsure.'
        };
      }
    } catch (err) {
      console.warn('Gemini explain error, falling back to deterministic:', err);
    }
  } else if (anthropicKey) {
    try {
      const model = process.env.LLM_MODEL || 'claude-3-5-sonnet-20241022';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model,
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: 'user',
              content: `Language requested: ${language}\nReading level: ${level}\n\n${contextBlock}\n\nRespond with valid JSON with keys: summary, ingredients_explained, warnings_explained, storage_explained, safety_note.`
            }
          ]
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        const contentText = data.content?.[0]?.text || '';
        const jsonMatch = contentText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            ...parsed,
            source: med.source_name,
            safety_note: parsed.safety_note || 'Always check the package leaflet and ask your pharmacist if you are unsure.'
          };
        }
      }
    } catch (err) {
      console.warn('Anthropic explain error, falling back to deterministic:', err);
    }
  }

  // Deterministic fallback
  return buildDeterministicExplanation(med, language, level);
}

export async function askQuestion(
  medicineId: string,
  question: string,
  language: 'en' | 'ta' | 'hi' | 'te' = 'en',
  history: Array<{ role: string; content: string }> = []
): Promise<string> {
  const med = getMedicineRecord(medicineId);
  if (!med) {
    return 'I cannot advise on that medicine. Please ask your pharmacist or doctor.\nSource: MedLens Safety Engine';
  }

  const qLower = question.toLowerCase();

  // STRICT SAFETY REFUSALS: Dosage changes, diagnoses, personal advice
  const personalAdvicePatterns = [
    /\b(how many|should i take|can i take \d|take two|take double|my dose|prescribe|prescribed dose)\b/i,
    /\b(stop taking|can i stop|increase dose|decrease dose|change dose)\b/i,
    /\b(diagnos|do i have|treat my|cure my|disease do i have)\b/i,
    /\b(pregnant|breastfeeding|baby|child dosage)\b/i,
    /\b(emergency|chest pain|overdose|swallowed whole pack)\b/i
  ];

  for (const pattern of personalAdvicePatterns) {
    if (pattern.test(qLower)) {
      return `I can't advise on that from the verified information. Please ask your pharmacist or doctor.\nSource: ${med.source_name}`;
    }
  }

  // Try LLM if key exists
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const contextBlock = `
VERIFIED RECORD:
Brand: ${med.brand_names[0]}
Generic: ${med.generic_name}
Ingredients: ${JSON.stringify(med.ingredients)}
Used For: ${med.used_for_plain}
How it works: ${med.how_it_works_plain}
Storage: ${med.storage_text} (Refrigerate: ${med.refrigerate})
Warnings: ${JSON.stringify(med.warnings)}
Do not use if: ${JSON.stringify(med.do_not_use_if)}
Ask pharmacist if: ${JSON.stringify(med.ask_pharmacist_if)}
Source: ${med.source_name}
      `.trim();

      const userPrompt = `${contextBlock}\n\nQuestion from user: "${question}"\nLanguage: ${language}\n\nAnswer in at most 120 words plain text, strictly following the system prompt rules, ending with "Source: ${med.source_name}".`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
          systemInstruction: SYSTEM_PROMPT
        }
      });

      const reply = response.text?.trim();
      if (reply) return reply;
    } catch (e) {
      console.warn('Gemini ask error, fallback:', e);
    }
  }

  // DETERMINISTIC FALLBACK MATCHING:
  // 1. Ingredients
  if (/ingredient|what does this contain|what is inside/i.test(qLower)) {
    const list = med.ingredients.map((i: any) => `${i.name} (${i.strength})`).join(' and ');
    return `${med.brand_names[0]} contains ${list}. ${med.how_it_works_plain}\nSource: ${med.source_name}`;
  }

  // 2. What is this for / purpose
  if (/what is this for|used for|indication|purpose|why take/i.test(qLower)) {
    return `${med.brand_names[0]} is indicated to ${med.used_for_plain.toLowerCase()}\nSource: ${med.source_name}`;
  }

  // 3. Storage / Refrigeration
  if (/storage|refrigerat|fridge|temperature|store|light|moisture/i.test(qLower)) {
    return `${med.storage_text}. ${med.refrigerate ? 'This medicine requires refrigeration between 2°C and 8°C. Do not freeze.' : 'Store at room temperature in a dry location away from moisture.'}\nSource: ${med.source_name}`;
  }

  // 4. Warnings / Side effects
  if (/warning|side effect|risk|danger|alcohol|safe/i.test(qLower)) {
    const wList = med.warnings.join(' ');
    return `Verified warnings for ${med.brand_names[0]}: ${wList}\nSource: ${med.source_name}`;
  }

  // 5. Medical terms
  for (const term of GLOSSARY_TERMS) {
    if (qLower.includes(term.term.toLowerCase())) {
      const def = term.definitions[language] || term.definitions.en;
      return `${term.term}: ${def}\nSource: MedLens Medical Glossary`;
    }
  }

  // If question cannot be answered from record
  return `I can't advise on that from the verified information. Please ask your pharmacist or doctor.\nSource: ${med.source_name}`;
}
