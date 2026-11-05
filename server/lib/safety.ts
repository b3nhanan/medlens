import { db } from '../db.ts';

export interface SafetyAlert {
  id: string;
  type: 'duplicate' | 'known' | 'same_class';
  severity: 'high' | 'moderate' | 'info';
  items: number[]; // cabinet_item_ids
  itemNames: string[];
  ingredients: string[];
  title: string;
  explanation: string;
  source: string;
}

export function runSafetyCheck(profileId: number): { alerts: SafetyAlert[]; itemCount: number } {
  // Fetch all cabinet items for the profile with their medicine records
  const items = db.prepare(`
    SELECT c.id as cabinet_item_id, c.display_name, c.batch_number, c.expiry_date,
           m.id as medicine_id, m.brand_names, m.generic_name, m.ingredients,
           m.drug_class, m.category
    FROM cabinet_items c
    JOIN medicines m ON c.medicine_id = m.id
    WHERE c.profile_id = ?
  `).all(profileId) as any[];

  if (items.length === 0) {
    return { alerts: [], itemCount: 0 };
  }

  const parsedItems = items.map(item => ({
    ...item,
    brand_names: JSON.parse(item.brand_names),
    ingredients: JSON.parse(item.ingredients) as Array<{ name: string; strength: string }>
  }));

  const alerts: SafetyAlert[] = [];
  const processedPairKeys = new Set<string>();

  // 1. DUPLICATE ACTIVE INGREDIENT DETECTION
  // Map ingredient name (lowercase) -> array of { cabinet_item_id, display_name }
  const ingredientMap = new Map<string, Array<{ id: number; name: string }>>();

  for (const item of parsedItems) {
    for (const ing of item.ingredients) {
      const ingKey = ing.name.toLowerCase().trim();
      if (!ingredientMap.has(ingKey)) {
        ingredientMap.set(ingKey, []);
      }
      ingredientMap.get(ingKey)!.push({ id: item.cabinet_item_id, name: item.display_name });
    }
  }

  ingredientMap.forEach((matchedList, ingName) => {
    // If more than one medicine shares this active ingredient
    if (matchedList.length > 1) {
      // Remove duplicate cabinet item entries if any
      const uniqueItems = Array.from(new Map(matchedList.map(m => [m.id, m])).values());
      if (uniqueItems.length > 1) {
        const names = uniqueItems.map(m => m.name);
        const nameListStr = names.length === 2 
          ? `${names[0]} and ${names[1]}` 
          : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;

        alerts.push({
          id: `dup-${ingName}`,
          type: 'duplicate',
          severity: 'high',
          items: uniqueItems.map(m => m.id),
          itemNames: names,
          ingredients: [ingName],
          title: `Duplicate active ingredient: ${ingName}`,
          explanation: `${nameListStr} all contain ${ingName}, so using them together could mean taking more ${ingName} than intended. Please review this with your pharmacist or doctor.`,
          source: 'MedLens Safety Engine & Package Leaflet Verification'
        });
      }
    }
  });

  // 2. KNOWN INTERACTIONS AND SAME-CLASS LOOKUP
  const interactionsDb = db.prepare('SELECT * FROM interactions').all() as any[];

  for (let i = 0; i < parsedItems.length; i++) {
    for (let j = i + 1; j < parsedItems.length; j++) {
      const itemA = parsedItems[i];
      const itemB = parsedItems[j];
      const pairKey = `${Math.min(itemA.cabinet_item_id, itemB.cabinet_item_id)}-${Math.max(itemA.cabinet_item_id, itemB.cabinet_item_id)}`;

      // Check ingredient pairs against curated interactions
      for (const ingA of itemA.ingredients) {
        const nameA = ingA.name.toLowerCase().trim();
        for (const ingB of itemB.ingredients) {
          const nameB = ingB.name.toLowerCase().trim();
          if (nameA === nameB) continue; // Already covered by duplicate check

          const match = interactionsDb.find(it => 
            (it.ingredient_a === nameA && it.ingredient_b === nameB) ||
            (it.ingredient_a === nameB && it.ingredient_b === nameA)
          );

          if (match && !processedPairKeys.has(`${pairKey}-${match.id}`)) {
            processedPairKeys.add(`${pairKey}-${match.id}`);
            alerts.push({
              id: `int-${match.id}-${itemA.cabinet_item_id}-${itemB.cabinet_item_id}`,
              type: match.type,
              severity: match.severity,
              items: [itemA.cabinet_item_id, itemB.cabinet_item_id],
              itemNames: [itemA.display_name, itemB.display_name],
              ingredients: [nameA, nameB],
              title: `${match.type === 'same_class' ? 'Same Drug Class Warning' : 'Known Interaction'}: ${itemA.display_name} + ${itemB.display_name}`,
              explanation: `${match.plain_explanation} Please review this with your pharmacist or doctor.`,
              source: match.source
            });
          }
        }
      }

      // Check drug class similarity if not already flagged for this pair
      if (itemA.drug_class && itemB.drug_class && itemA.drug_class === itemB.drug_class) {
        const classPairKey = `${pairKey}-class-${itemA.drug_class}`;
        const alreadyFlagged = alerts.some(a => 
          a.items.includes(itemA.cabinet_item_id) && 
          a.items.includes(itemB.cabinet_item_id) && 
          a.type === 'same_class'
        );

        if (!alreadyFlagged && !processedPairKeys.has(classPairKey)) {
          processedPairKeys.add(classPairKey);
          alerts.push({
            id: `class-${itemA.drug_class}-${itemA.cabinet_item_id}-${itemB.cabinet_item_id}`,
            type: 'same_class',
            severity: 'moderate',
            items: [itemA.cabinet_item_id, itemB.cabinet_item_id],
            itemNames: [itemA.display_name, itemB.display_name],
            ingredients: [
              ...itemA.ingredients.map((i: any) => i.name),
              ...itemB.ingredients.map((i: any) => i.name)
            ],
            title: `Same Drug Class: ${itemA.display_name} & ${itemB.display_name}`,
            explanation: `Both medicines belong to the ${itemA.drug_class.toUpperCase()} category. Taking two medicines of the same class at the same time may cause cumulative side effects. Please review this with your pharmacist or doctor.`,
            source: 'MedLens Drug Classification Index'
          });
        }
      }
    }
  }

  // Sort alerts: high severity first, then moderate, then info
  const severityOrder: Record<string, number> = { high: 1, moderate: 2, info: 3 };
  alerts.sort((a, b) => (severityOrder[a.severity] || 9) - (severityOrder[b.severity] || 9));

  return { alerts, itemCount: parsedItems.length };
}
