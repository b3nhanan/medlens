export type SupportedLanguage = 'en' | 'ta' | 'hi' | 'te';

export interface Translations {
  appName: string;
  tagline: string;
  positioning: string;
  disclaimer: string;
  nav: {
    home: string;
    scan: string;
    cabinet: string;
    safety: string;
    reminders: string;
  };
  home: {
    heroTitle: string;
    heroSubtitle: string;
    scanButton: string;
    demoButton: string;
    howItWorks: string;
    stepScan: string;
    stepRecognise: string;
    stepUnderstand: string;
    stepOrganise: string;
    stepStayInformed: string;
    summaryTotal: string;
    summaryExpiring: string;
    summaryExpired: string;
    summaryDuplicates: string;
    quickLinks: string;
    emergencyCard: string;
  };
  scan: {
    title: string;
    photoTab: string;
    barcodeTab: string;
    searchTab: string;
    dragDrop: string;
    orTakePhoto: string;
    runningOcr: string;
    tryDemo: string;
    scanBarcode: string;
    demoBarcodes: string;
    searchPlaceholder: string;
  };
  result: {
    title: string;
    confidenceHigh: string;
    confidenceMed: string;
    confidenceLow: string;
    labelChecks: string;
    whatItMeans: string;
    readingLevel: string;
    simple: string;
    detailed: string;
    storage: string;
    refrigerate: string;
    protectLight: string;
    protectMoisture: string;
    warnings: string;
    expiryStatus: string;
    addToCabinet: string;
    askMedlens: string;
    candidatePrompt: string;
  };
  cabinet: {
    title: string;
    filterAll: string;
    filterValid: string;
    filterExpiring: string;
    filterExpired: string;
    filterRefrigerated: string;
    searchPlaceholder: string;
    empty: string;
    addFirst: string;
    batch: string;
    expiry: string;
  };
  safety: {
    title: string;
    runCheck: string;
    noIssues: string;
    overlapTitle: string;
    duplicateAlert: string;
    knownInteraction: string;
    sameClass: string;
    doctorReviewNote: string;
  };
  reminders: {
    title: string;
    todayTimeline: string;
    morning: string;
    afternoon: string;
    evening: string;
    taken: string;
    skip: string;
    addReminder: string;
    history: string;
    caregiverToggle: string;
    disclaimer: string;
  };
  emergency: {
    title: string;
    allergies: string;
    doctorInstructions: string;
    emergencyContact: string;
    currentMedicines: string;
    printPdf: string;
    fullScreen: string;
    exitFullScreen: string;
  };
}

export const I18N_DICT: Record<SupportedLanguage, Translations> = {
  en: {
    appName: 'MedLens',
    tagline: 'Making medicine information understandable to everyone.',
    positioning: 'MedLens is not another reminder app. It is an intelligent interface between complicated pharmaceutical information and ordinary people.',
    disclaimer: 'MedLens is an information and organisation tool, not a medical decision-maker. It does not replace a pharmacist or doctor.',
    nav: {
      home: 'Home',
      scan: 'Scan',
      cabinet: 'Cabinet',
      safety: 'Safety Check',
      reminders: 'Reminders'
    },
    home: {
      heroTitle: 'Scan. Understand. Stay informed.',
      heroSubtitle: 'Instant medicine packaging recognition, plain-language explanations, duplicate active ingredient alerts, and expiry tracking.',
      scanButton: 'Scan a medicine',
      demoButton: 'Try a demo scan',
      howItWorks: 'How MedLens Works',
      stepScan: 'Scan',
      stepRecognise: 'Recognise',
      stepUnderstand: 'Understand',
      stepOrganise: 'Organise',
      stepStayInformed: 'Stay Informed',
      summaryTotal: 'Total Medicines',
      summaryExpiring: 'Expiring Soon',
      summaryExpired: 'Expired',
      summaryDuplicates: 'Duplicate Alerts',
      quickLinks: 'Quick Access',
      emergencyCard: 'Emergency Medicine Card'
    },
    scan: {
      title: 'Scan Medicine',
      photoTab: 'Photo (OCR)',
      barcodeTab: 'Barcode',
      searchTab: 'Search by Name',
      dragDrop: 'Upload photo or point camera at medicine packaging',
      orTakePhoto: 'Take photo or select file',
      runningOcr: 'Scanning packaging text with optical recognition...',
      tryDemo: 'Or try an instant demo scan:',
      scanBarcode: 'Point camera at packaging barcode or enter code',
      demoBarcodes: 'Try a demo barcode:',
      searchPlaceholder: 'Search by brand (e.g. Dolo) or generic name...'
    },
    result: {
      title: 'Medicine Identified',
      confidenceHigh: 'High Confidence Match',
      confidenceMed: 'Medium Match (Verify)',
      confidenceLow: 'Low Confidence (Please Check)',
      labelChecks: 'Label Verification Checklist',
      whatItMeans: 'What Does This Mean?',
      readingLevel: 'Reading Level',
      simple: 'Simple',
      detailed: 'Detailed',
      storage: 'Storage Requirements',
      refrigerate: 'Needs Refrigeration (2-8°C)',
      protectLight: 'Protect from Light',
      protectMoisture: 'Protect from Moisture',
      warnings: 'Warnings & Precautions',
      expiryStatus: 'Expiry Date & Validation',
      addToCabinet: 'Add to my cabinet',
      askMedlens: 'Ask MedLens',
      candidatePrompt: 'Did you mean one of these medicines?'
    },
    cabinet: {
      title: 'My Medicine Cabinet',
      filterAll: 'All',
      filterValid: 'Valid',
      filterExpiring: 'Expiring soon',
      filterExpired: 'Expired',
      filterRefrigerated: 'Refrigerated',
      searchPlaceholder: 'Filter cabinet medicines...',
      empty: 'No medicines in this cabinet yet.',
      addFirst: 'Scan a medicine to get started.',
      batch: 'Batch',
      expiry: 'Expires'
    },
    safety: {
      title: 'Safety & Interaction Check',
      runCheck: 'Run Safety Check',
      noIssues: 'No duplicates or known interactions found among your listed medicines. This is not a guarantee of safety.',
      overlapTitle: 'Active Ingredient Overlap Map',
      duplicateAlert: 'Duplicate Active Ingredient Alert',
      knownInteraction: 'Known Clinical Interaction',
      sameClass: 'Same Drug Class Precaution',
      doctorReviewNote: 'Please review this with your pharmacist or doctor.'
    },
    reminders: {
      title: 'Daily Medication Timeline',
      todayTimeline: "Today's Schedule",
      morning: 'Morning',
      afternoon: 'Afternoon',
      evening: 'Evening',
      taken: 'Taken ✓',
      skip: 'Skip',
      addReminder: 'Add Reminder',
      history: 'History Log',
      caregiverToggle: 'Notify my caregiver',
      disclaimer: 'Schedules are entered by you or your healthcare professional. MedLens does not suggest doses.'
    },
    emergency: {
      title: 'Emergency Medicine Card',
      allergies: 'Known Drug Allergies',
      doctorInstructions: "Doctor's Key Instructions",
      emergencyContact: 'Emergency Contact Person',
      currentMedicines: 'Current Active Medicines',
      printPdf: 'Print / Save as PDF',
      fullScreen: 'Show Full Screen',
      exitFullScreen: 'Exit Full Screen'
    }
  },
  ta: {
    appName: 'MedLens',
    tagline: 'மருந்து தகவல்களை அனைவருக்கும் எளிய மொழியில் புரிந்துகொள்ள செய்தல்.',
    positioning: 'MedLens மற்றொரு நினைவூட்டல் செயலி அல்ல. இது கடினமான மருந்து விவரங்களை மக்களுக்கு எளிமையாக்கும் ஒரு நுண்ணறிவு தளம்.',
    disclaimer: 'MedLens ஒரு தகவல் மற்றும் ஒழுங்கமைப்பு கருவியாகும், மருத்துவ முடிவு எடுக்கும் கருவி அல்ல. இது மருத்துவர் அல்லது மருந்தாளுநருக்கு மாற்றாகாது.',
    nav: {
      home: 'முகப்பு',
      scan: 'ஸ்கேன்',
      cabinet: 'மருந்து பெட்டி',
      safety: 'பாதுகாப்பு',
      reminders: 'நினைவூட்டல்'
    },
    home: {
      heroTitle: 'ஸ்கேன் செய்திடுங்கள். அறிந்திடுங்கள்.',
      heroSubtitle: 'மருந்து அட்டையை ஸ்கேன் செய்து காலாவதி தேதி, சேமிப்பு முறை மற்றும் இரட்டை மருந்து எச்சரிக்கைகளைத் தெரிந்து கொள்ளுங்கள்.',
      scanButton: 'மருந்தை ஸ்கேன் செய்க',
      demoButton: 'டெமோ ஸ்கேன் காண்க',
      howItWorks: 'MedLens எவ்வாறு செயல்படுகிறது',
      stepScan: 'ஸ்கேன்',
      stepRecognise: 'அறிதல்',
      stepUnderstand: 'புரிதல்',
      stepOrganise: 'ஒழுங்கமைத்தல்',
      stepStayInformed: 'தகவல் பெறுதல்',
      summaryTotal: 'மொத்த மருந்துகள்',
      summaryExpiring: 'விரைவில் காலாவதி',
      summaryExpired: 'காலாவதியானது',
      summaryDuplicates: 'இரட்டை மருந்து எச்சரிக்கை',
      quickLinks: 'விரைவு இணைப்புகள்',
      emergencyCard: 'அவசர மருத்துவ அட்டை'
    },
    scan: {
      title: 'மருந்தை ஸ்கேன் செய்',
      photoTab: 'புகைப்படம் (OCR)',
      barcodeTab: 'பார்கோடு',
      searchTab: 'பெயர் மூலம் தேடல்',
      dragDrop: 'மருந்து அட்டையை கேமரா மூலம் படம்பிடிக்கவும்',
      orTakePhoto: 'புகைப்படம் எடு / கோப்பைத் தேர்ந்தெடு',
      runningOcr: 'எழுத்துக்களை ஸ்கேன் செய்கிறது...',
      tryDemo: 'மாதிரி டெமோ ஸ்கேன் முயற்சிக்கவும்:',
      scanBarcode: 'பார்கோடை கேமரா மூலம் காட்டவும்',
      demoBarcodes: 'டெமோ பார்கோடு:',
      searchPlaceholder: 'மருந்து பெயரைத் தேடவும்...'
    },
    result: {
      title: 'மருந்து கண்டறியப்பட்டது',
      confidenceHigh: 'துல்லியமான பொருத்தம்',
      confidenceMed: 'நடுத்தர பொருத்தம் (சரிபார்க்கவும்)',
      confidenceLow: 'குறைந்த பொருத்தம் (சரிபார்க்கவும்)',
      labelChecks: 'லேபிள் சரிபார்ப்பு பட்டியல்',
      whatItMeans: 'இதன் பொருள் என்ன?',
      readingLevel: 'படிக்கும் நிலை',
      simple: 'எளிய முறை',
      detailed: 'விரிவான முறை',
      storage: 'சேமிப்பு முறைகள்',
      refrigerate: 'குளிர்சாதனப் பெட்டியில் வைக்கவும் (2-8°C)',
      protectLight: 'ஒளியிலிருந்து பாதுகாக்கவும்',
      protectMoisture: 'ஈரப்பதத்திலிருந்து பாதுகாக்கவும்',
      warnings: 'எச்சரிக்கைகள் & முன்னெச்சரிக்கைகள்',
      expiryStatus: 'காலாவதி தேதி',
      addToCabinet: 'என் பெட்டியில் சேர்',
      askMedlens: 'கேள்வி கேளுங்கள்',
      candidatePrompt: 'இந்த மருந்துகளில் ஒன்றா?'
    },
    cabinet: {
      title: 'என் மருந்துப் பெட்டி',
      filterAll: 'அனைத்தும்',
      filterValid: 'செல்லுபடியாகும்',
      filterExpiring: 'விரைவில் முடியும்',
      filterExpired: 'காலாவதியானது',
      filterRefrigerated: 'குளிர்சாதனம் தேவை',
      searchPlaceholder: 'பெட்டியில் தேடவும்...',
      empty: 'இன்னும் மருந்துகள் சேர்க்கப்படவில்லை.',
      addFirst: 'முதலில் ஒரு மருந்தை ஸ்கேன் செய்யுங்கள்.',
      batch: 'தொகுதி எண்',
      expiry: 'காலாவதி'
    },
    safety: {
      title: 'பாதுகாப்பு & மருந்து மோதல் ஆய்வு',
      runCheck: 'ஆய்வு செய்',
      noIssues: 'உங்கள் மருந்துகளில் மோதலோ அல்லது இரட்டை மூலப்பொருளோ கண்டறியப்படவில்லை. இது முழுமையான பாதுகாப்பிற்கு உத்தரவாதமல்ல.',
      overlapTitle: 'இரட்டை மூலப்பொருள் வரைபடம்',
      duplicateAlert: 'இரட்டை மூலப்பொருள் எச்சரிக்கை',
      knownInteraction: 'மருந்து சேர்க்கை எச்சரிக்கை',
      sameClass: 'ஒரே வகை மருந்து எச்சரிக்கை',
      doctorReviewNote: 'மருத்துவர் அல்லது மருந்தாளுநரிடம் கலந்து ஆலோசிக்கவும்.'
    },
    reminders: {
      title: 'தினசரி மருந்து அட்டவணை',
      todayTimeline: 'இன்றைய அட்டவணை',
      morning: 'காலை',
      afternoon: 'மதியம்',
      evening: 'இரவு',
      taken: 'உட்கொண்டேன் ✓',
      skip: 'தவிர்',
      addReminder: 'நினைவூட்டல் சேர்',
      history: 'வரலாறு',
      caregiverToggle: 'பராமரிப்பாளருக்கு அறிவி',
      disclaimer: 'அட்டவணை உங்களால் அல்லது மருத்துவ நிபுணரால் உருவாக்கப்பட்டது. MedLens மருந்தளவை பரிந்துரைக்காது.'
    },
    emergency: {
      title: 'அவசர மருத்துவ அட்டை',
      allergies: 'மருந்து ஒவ்வாமை (அலர்ஜி)',
      doctorInstructions: 'மருத்துவரின் முக்கிய அறிவுரைகள்',
      emergencyContact: 'அவசர தொடர்பு நபர்',
      currentMedicines: 'தற்போது உட்கொள்ளும் மருந்துகள்',
      printPdf: 'அச்சிடு / PDF சேமி',
      fullScreen: 'முழுத்திரை',
      exitFullScreen: 'வெளியேறு'
    }
  },
  hi: {
    appName: 'MedLens',
    tagline: 'दवाइयों की जानकारी को हर किसी के लिए आसान बनाना।',
    positioning: 'MedLens केवल एक रिमाइंडर ऐप नहीं है। यह जटिल दवा जानकारी और आम लोगों के बीच एक समझदार माध्यम है।',
    disclaimer: 'MedLens केवल जानकारी और व्यवस्था के लिए एक टूल है, चिकित्सकीय निर्णय लेने वाला नहीं। यह डॉक्टर या फार्मासिस्ट का विकल्प नहीं है।',
    nav: {
      home: 'होम',
      scan: 'स्कैन',
      cabinet: 'दवा पेटी',
      safety: 'सुरक्षा जांच',
      reminders: 'रिमाइंडर'
    },
    home: {
      heroTitle: 'स्कैन करें। समझें। सुरक्षित रहें।',
      heroSubtitle: 'दवा की स्ट्रिप स्कैन करें, एक्सपायरी जानें, साधारण भाषा में समझें और डुप्लीकेट दवाओं से बचें।',
      scanButton: 'दवा स्कैन करें',
      demoButton: 'डेमो स्कैन देखें',
      howItWorks: 'MedLens कैसे काम करता है',
      stepScan: 'स्कैन',
      stepRecognise: 'पहचान',
      stepUnderstand: 'समझें',
      stepOrganise: 'व्यवस्थित करें',
      stepStayInformed: 'जानकारी रखें',
      summaryTotal: 'कुल दवाइयाँ',
      summaryExpiring: 'जल्द एक्सपायर',
      summaryExpired: 'एक्सपायर हो चुकी',
      summaryDuplicates: 'डुप्लीकेट चेतावनी',
      quickLinks: 'त्वरित लिंक',
      emergencyCard: 'इमरजेंसी मेडिकल कार्ड'
    },
    scan: {
      title: 'दवा स्कैन करें',
      photoTab: 'फोटो (OCR)',
      barcodeTab: 'बारकोड',
      searchTab: 'नाम से खोजें',
      dragDrop: 'दवा के पैकेट की फोटो लें या अपलोड करें',
      orTakePhoto: 'फोटो लें या फाइल चुनें',
      runningOcr: 'दवा के शब्दों को पढ़ा जा रहा है...',
      tryDemo: 'या तुरंत डेमो स्कैन चलाएं:',
      scanBarcode: 'बारकोड को कैमरे के सामने लाएं',
      demoBarcodes: 'डेमो बारकोड:',
      searchPlaceholder: 'दवा का नाम लिखें (जैसे Dolo)...'
    },
    result: {
      title: 'दवा की पहचान हुई',
      confidenceHigh: 'सटीक पहचान (High)',
      confidenceMed: 'मध्यम पहचान (जाँचें)',
      confidenceLow: 'कम निश्चित (कृपया जाँचें)',
      labelChecks: 'लेबल जाँच चेकलिस्ट',
      whatItMeans: 'इसका क्या मतलब है?',
      readingLevel: 'पढ़ने का स्तर',
      simple: 'सरल',
      detailed: 'विस्तृत',
      storage: 'रखरखाव के निर्देश',
      refrigerate: 'फ्रिज में रखें (2-8°C)',
      protectLight: 'रोशनी से बचाएं',
      protectMoisture: 'नमी से बचाएं',
      warnings: 'चेतावनी और सावधानियां',
      expiryStatus: 'एक्सपायरी तारीख',
      addToCabinet: 'दवा पेटी में जोड़ें',
      askMedlens: 'सवाल पूछें',
      candidatePrompt: 'क्या आपकी दवा इनमें से कोई है?'
    },
    cabinet: {
      title: 'मेरी दवा पेटी',
      filterAll: 'सभी',
      filterValid: 'वैध',
      filterExpiring: 'जल्द खत्म',
      filterExpired: 'एक्सपायर',
      filterRefrigerated: 'फ्रिज वाली',
      searchPlaceholder: 'पेटी में खोजें...',
      empty: 'अभी कोई दवा नहीं जोड़ी गई है।',
      addFirst: 'दवा स्कैन करके शुरुआत करें।',
      batch: 'बैच नंबर',
      expiry: 'एक्सपायरी'
    },
    safety: {
      title: 'सुरक्षा और इंटरैक्शन जांच',
      runCheck: 'सुरक्षा जांच चलाएं',
      noIssues: 'आपकी चुनी हुई दवाओं में कोई डुप्लीकेट घटक या परस्पर टकराव नहीं मिला। यह पूर्ण सुरक्षा की गारंटी नहीं है।',
      overlapTitle: 'समान घटक (Active Ingredient) ओवरलैप',
      duplicateAlert: 'डुप्लीकेट एक्टिव घटक चेतावनी',
      knownInteraction: 'ज्ञात दवा परस्पर क्रिया',
      sameClass: 'समान वर्ग की दवा चेतावनी',
      doctorReviewNote: 'कृपया अपने फार्मासिस्ट या डॉक्टर से इसकी समीक्षा अवश्य करें।'
    },
    reminders: {
      title: 'दैनिक खुराक समय-सारणी',
      todayTimeline: 'आज का शेड्यूल',
      morning: 'सुबह',
      afternoon: 'दोपहर',
      evening: 'शाम',
      taken: 'ली गई ✓',
      skip: 'छोड़ें',
      addReminder: 'नया रिमाइंडर जोड़ें',
      history: 'इतिहास',
      caregiverToggle: 'देखभालकर्ता को सूचित करें',
      disclaimer: 'शेड्यूल आपके या आपके डॉक्टर द्वारा दर्ज किया गया है। MedLens खुराक नहीं बताता।'
    },
    emergency: {
      title: 'इमरजेंसी मेडिकल कार्ड',
      allergies: 'दवा एलर्जी',
      doctorInstructions: 'डॉक्टर के मुख्य निर्देश',
      emergencyContact: 'आपातकालीन संपर्क',
      currentMedicines: 'वर्तमान दवाइयाँ',
      printPdf: 'प्रिंट / PDF सेव करें',
      fullScreen: 'फुल स्क्रीन',
      exitFullScreen: 'फुल स्क्रीन बंद करें'
    }
  },
  te: {
    appName: 'MedLens',
    tagline: 'ఔషధ సమాచారాన్ని అందరికీ సులభంగా అర్థమయ్యేలా చేయడం.',
    positioning: 'MedLens కేవలం రిమైండర్ యాప్ కాదు. ఇది సంక్లిష్టమైన మందుల సమాచారానికి మరియు సామాన్య ప్రజలకు మధ్య ఒక తెలివైన వారధి.',
    disclaimer: 'MedLens అనేది సమాచారం మరియు నిర్వహణ సాధనం మాత్రమే, వైద్య నిర్ణేత కాదు. ఇది డాక్టర్ లేదా ఫార్మసిస్ట్‌కు ప్రత్యామ్నాయం కాదు.',
    nav: {
      home: 'హోమ్',
      scan: 'స్కాన్',
      cabinet: 'ఔషధ పెట్టె',
      safety: 'భద్రత',
      reminders: 'రిమైండర్లు'
    },
    home: {
      heroTitle: 'స్కాన్ చేయండి. అర్థం చేసుకోండి.',
      heroSubtitle: 'మందుల ప్యాకెట్‌ను స్కాన్ చేయండి, గడువు తేదీని తెలుసుకోండి, సులభమైన భాషలో అర్థం చేసుకోండి.',
      scanButton: 'మందును స్కాన్ చేయండి',
      demoButton: 'డెమో స్కాన్ ప్రయత్నించండి',
      howItWorks: 'MedLens ఎలా పనిచేస్తుంది',
      stepScan: 'స్కాన్',
      stepRecognise: 'గుర్తింపు',
      stepUnderstand: 'అవగాహన',
      stepOrganise: 'నిర్వహణ',
      stepStayInformed: 'సమాచారం',
      summaryTotal: 'మొత్తం మందులు',
      summaryExpiring: 'త్వరలో గడువు ముగిసేవి',
      summaryExpired: 'గడువు ముగిసినవి',
      summaryDuplicates: 'డూప్లికేట్ హెచ్చరికలు',
      quickLinks: 'త్వరిత లింకులు',
      emergencyCard: 'ఎమర్జెన్సీ మెడికల్ కార్డ్'
    },
    scan: {
      title: 'మందుల స్కాన్',
      photoTab: 'ఫోటో (OCR)',
      barcodeTab: 'బార్‌కోడ్',
      searchTab: 'పేరుతో వెతకండి',
      dragDrop: 'మందు ప్యాకెట్ ఫోటో తీయండి లేదా అప్‌లోడ్ చేయండి',
      orTakePhoto: 'ఫోటో తీయండి / ఫైల్ ఎంచుకోండి',
      runningOcr: 'అక్షరాలను గుర్తిస్తున్నాము...',
      tryDemo: 'లేదా తక్షణ డెమో స్కాన్ చేయండి:',
      scanBarcode: 'బార్‌కోడ్‌ను కెమెరా ముందు ఉంచండి',
      demoBarcodes: 'డెమో బార్‌కోడ్:',
      searchPlaceholder: 'మందు పేరు రాయండి...'
    },
    result: {
      title: 'మందు గుర్తించబడింది',
      confidenceHigh: 'ఖచ్చితమైన సరిపోలిక (High)',
      confidenceMed: 'మధ్యస్థ సరిపోలిక (తనిఖీ చేయండి)',
      confidenceLow: 'తక్కువ సరిపోలిక (తనిఖీ చేయండి)',
      labelChecks: 'లేబుల్ తనిఖీ జాబితా',
      whatItMeans: 'దీని అర్థం ఏమిటి?',
      readingLevel: 'చదివే స్థాయి',
      simple: 'సులభమైన',
      detailed: 'వివరణాత్మక',
      storage: 'నిల్వ నిబంధనలు',
      refrigerate: 'ఫ్రిజ్‌లో ఉంచాలి (2-8°C)',
      protectLight: 'వెలుతురు నుండి రక్షించండి',
      protectMoisture: 'తేమ నుండి రక్షించండి',
      warnings: 'హెచ్చరికలు మరియు జాగ్రత్తలు',
      expiryStatus: 'గడువు తేదీ',
      addToCabinet: 'పెట్టెలో చేర్చండి',
      askMedlens: 'ప్రశ్న అడగండి',
      candidatePrompt: 'మీ మందు వీటిలో ఒకటా?'
    },
    cabinet: {
      title: 'నా మందుల పెట్టె',
      filterAll: 'అన్నీ',
      filterValid: 'చెల్లుబాటు అయ్యేవి',
      filterExpiring: 'త్వరలో ముగిసేవి',
      filterExpired: 'గడువు ముగిసినవి',
      filterRefrigerated: 'శీతలీకరణ అవసరం',
      searchPlaceholder: 'పెట్టెలో వెతకండి...',
      empty: 'ఇంకా మందులు ఏవీ జోడించబడలేదు.',
      addFirst: 'మందును స్కాన్ చేసి ప్రారంభించండి.',
      batch: 'బ్యాచ్ సంఖ్య',
      expiry: 'గడువు'
    },
    safety: {
      title: 'భద్రత మరియు పరస్పర చర్యల తనిఖీ',
      runCheck: 'తనిఖీ చేయండి',
      noIssues: 'మీ మందులలో ఎటువంటి డూప్లికేట్ పదార్థాలు లేదా పరస్పర విరుద్ధ చర్యలు కనుగొనబడలేదు. ఇది సంపూర్ణ భద్రతకు హామీ కాదు.',
      overlapTitle: 'ఒకే పదార్థం (Active Ingredient) ఓవర్‌లాప్',
      duplicateAlert: 'డూప్లికేట్ యాక్టివ్ పదార్థ హెచ్చరిక',
      knownInteraction: 'ఔషధ పరస్పర చర్య హెచ్చరిక',
      sameClass: 'ఒకే వర్గానికి చెందిన ఔషధ జాగ్రత్త',
      doctorReviewNote: 'దయచేసి మీ ఫార్మసిస్ట్ లేదా వైద్యుడితో సమీక్షించండి.'
    },
    reminders: {
      title: 'రోజువారీ మందుల సమయ పట్టిక',
      todayTimeline: 'నేటి షెడ్యూల్',
      morning: 'ఉదయం',
      afternoon: 'మధ్యాహ్నం',
      evening: 'రాత్రి',
      taken: 'వేసుకున్నాను ✓',
      skip: 'దాటవేయి',
      addReminder: 'కొత్త రిమైండర్',
      history: 'చరిత్ర',
      caregiverToggle: 'సంరక్షకునికి తెలియజేయండి',
      disclaimer: 'షెడ్యూల్‌ను మీరు లేదా మీ వైద్య నిపుణులు నమోదు చేశారు. MedLens మోతాదులను సూచించదు.'
    },
    emergency: {
      title: 'ఎమర్జెన్సీ మెడికల్ కార్డ్',
      allergies: 'ఔషధ అలర్జీలు',
      doctorInstructions: 'వైద్యుని ముఖ్య సూచనలు',
      emergencyContact: 'అత్యవసర సంప్రదింపు వ్యక్తి',
      currentMedicines: 'ప్రస్తుతం వాడుతున్న మందులు',
      printPdf: 'ప్రింట్ / PDF సేవ్',
      fullScreen: 'పూర్తి స్క్రీన్',
      exitFullScreen: 'స్క్రీన్ సాధారణ స్థితికి తెండి'
    }
  }
};
