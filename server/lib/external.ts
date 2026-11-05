/**
 * External reference enrichment proxies: openFDA and RxNorm/RxNav
 * 5s timeout, in-memory caching, graceful fallback to local data.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour
const openFdaCache = new Map<string, CacheEntry<any>>();
const rxNormCache = new Map<string, CacheEntry<any>>();

const GENERIC_US_MAPPING: Record<string, string> = {
  paracetamol: 'acetaminophen'
};

async function fetchWithTimeout(url: string, timeoutMs = 5000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

export async function lookupOpenFda(genericName: string): Promise<any> {
  if (!genericName) return { available: false, reason: 'Missing generic name' };

  const cleanName = genericName.toLowerCase().trim();
  const usGeneric = GENERIC_US_MAPPING[cleanName] || cleanName;

  const cached = openFdaCache.get(usGeneric);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const query = encodeURIComponent(`"${usGeneric}"`);
    const url = `https://api.fda.gov/drug/label.json?search=openfda.generic_name:${query}&limit=1`;
    const res = await fetchWithTimeout(url, 4500);

    if (!res.ok) {
      const fallbackResult = { available: false, genericUsed: usGeneric, status: res.status };
      openFdaCache.set(usGeneric, { data: fallbackResult, timestamp: Date.now() });
      return fallbackResult;
    }

    const json = await res.json();
    const item = json.results?.[0];
    if (!item) {
      const emptyResult = { available: false, genericUsed: usGeneric };
      openFdaCache.set(usGeneric, { data: emptyResult, timestamp: Date.now() });
      return emptyResult;
    }

    const openfda = item.openfda || {};
    const setId = openfda.spl_set_id?.[0] || item.set_id || null;
    const dailyMedUrl = setId
      ? `https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=${setId}`
      : `https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=${encodeURIComponent(usGeneric)}`;

    const result = {
      available: true,
      source: 'US FDA Drug Label (openFDA)',
      genericUsed: usGeneric,
      setId,
      dailyMedUrl,
      brandName: openfda.brand_name?.[0] || null,
      manufacturerName: openfda.manufacturer_name?.[0] || null,
      purpose: item.purpose?.[0] || null,
      indicationsAndUsage: item.indications_and_usage?.[0] || null,
      warnings: item.warnings?.[0] || item.warnings_and_cautions?.[0] || null,
      doNotUse: item.do_not_use?.[0] || null,
      askDoctor: item.ask_doctor?.[0] || item.ask_doctor_or_pharmacist?.[0] || null,
      stopUse: item.stop_use?.[0] || null,
      storageAndHandling: item.storage_and_handling?.[0] || null,
      activeIngredient: item.active_ingredient?.[0] || null
    };

    openFdaCache.set(usGeneric, { data: result, timestamp: Date.now() });
    return result;
  } catch (error: any) {
    return {
      available: false,
      genericUsed: usGeneric,
      error: error.name === 'AbortError' ? 'Request timed out (5s)' : 'Network unreachable'
    };
  }
}

export async function lookupRxNorm(term: string): Promise<any> {
  if (!term) return { available: false };

  const cleanTerm = term.trim();
  const cached = rxNormCache.get(cleanTerm.toLowerCase());
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const encoded = encodeURIComponent(cleanTerm);
    const approxUrl = `https://rxnav.nlm.nih.gov/REST/approximateTerm.json?term=${encoded}&maxEntries=3`;
    const res = await fetchWithTimeout(approxUrl, 4500);

    if (!res.ok) {
      const fallback = { available: false, term: cleanTerm };
      rxNormCache.set(cleanTerm.toLowerCase(), { data: fallback, timestamp: Date.now() });
      return fallback;
    }

    const approxJson = await res.json();
    const candidate = approxJson.approximateGroup?.candidate?.[0];
    const rxcui = candidate?.rxcui;

    if (!rxcui) {
      const empty = { available: false, term: cleanTerm };
      rxNormCache.set(cleanTerm.toLowerCase(), { data: empty, timestamp: Date.now() });
      return empty;
    }

    // Lookup standardized name
    let standardName = null;
    try {
      const propRes = await fetchWithTimeout(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/properties.json`, 2500);
      if (propRes.ok) {
        const propJson = await propRes.json();
        standardName = propJson.properties?.name || null;
      }
    } catch {}

    const result = {
      available: true,
      rxcui,
      standardName: standardName || candidate.name,
      rxNormUrl: `https://mor.nlm.nih.gov/RxNav/search?searchBy=RXCUI&searchTerm=${rxcui}`
    };

    rxNormCache.set(cleanTerm.toLowerCase(), { data: result, timestamp: Date.now() });
    return result;
  } catch (error: any) {
    return { available: false, term: cleanTerm };
  }
}
