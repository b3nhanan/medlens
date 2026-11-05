import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createWorker } from 'tesseract.js';
import { Html5Qrcode } from 'html5-qrcode';
import { api, IdentifyResult, Medicine } from '../api.ts';
import { useSettings } from '../context/SettingsContext.tsx';
import { ViewfinderOverlay } from '../components/ViewfinderOverlay.tsx';
import { 
  Camera, 
  Barcode, 
  Search, 
  Upload, 
  Sparkles, 
  AlertCircle, 
  Pill,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const DEMO_SCANS = [
  {
    id: 'demo-dolo',
    label: 'Demo #1: Dolo 650 (Clear)',
    badge: 'Valid & Clean',
    text: "Dolo 650\nParacetamol Tablets IP 650 mg\nMfd. by: Micro Labs Ltd\nB.No. DL2290 MFG 12/2025 EXP 01/2028\nStore below 30°C. Protect from light and moisture."
  },
  {
    id: 'demo-combiflam',
    label: 'Demo #2: Combiflam (Expiring)',
    badge: 'Dual Ingredient',
    text: "COMBIFLAM\nIbuprofen 400 mg + Paracetamol 325 mg Tablets\nSanofi India Ltd\nBatch No: CF1187 Exp. Date: DEC 2026\nStore in a cool dry place below 25°C"
  },
  {
    id: 'demo-unclear',
    label: 'Demo #3: Unclear / Damaged Label',
    badge: 'Error Verification',
    text: "C?oc1n\nParacet... Tabl\nB.No CR09 EXP ??/26"
  }
];

const DEMO_BARCODES = [
  { code: '8901234500011', name: 'Dolo 650 (Paracetamol)' },
  { code: '8901234500042', name: 'Combiflam (Ibuprofen + Paracetamol)' },
  { code: '8901234500172', name: 'Lantus Pen (Insulin Glargine)' }
];

export const ScanPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useSettings();

  const [activeTab, setActiveTab] = useState<'photo' | 'barcode' | 'search'>('photo');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  // Barcode state
  const [manualBarcode, setManualBarcode] = useState('');
  const [isBarcodeCameraRunning, setIsBarcodeCameraRunning] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  // Search tab state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Medicine[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchParams.get('tab') === 'demo') {
      setActiveTab('photo');
    }
  }, [searchParams]);

  // Handle Search Input Debounce
  useEffect(() => {
    if (activeTab !== 'search') return;
    const timer = setTimeout(() => {
      setIsSearching(true);
      api.searchMedicines(searchQuery)
        .then(res => setSearchResults(res))
        .catch(() => {})
        .finally(() => setIsSearching(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, activeTab]);

  // Clean up barcode scanner on unmount or tab switch
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && isBarcodeCameraRunning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, [isBarcodeCameraRunning]);

  const processOcrAndNavigate = async (text: string, barcode?: string) => {
    try {
      setStatusMessage('Parsing medicine name, strength, expiry and ingredients...');
      const identifyResult = await api.identify({ ocrText: text, barcode });
      sessionStorage.setItem('medlens_scan_result', JSON.stringify(identifyResult));
      navigate('/result', { state: { result: identifyResult } });
    } catch (err: any) {
      toast.error(err.message || 'Error processing medicine scan');
      setIsScanning(false);
    }
  };

  const handleDemoScan = async (demoText: string) => {
    setIsScanning(true);
    setScanProgress(15);
    setStatusMessage('Reading sample packaging text...');
    
    // Simulate short smooth scanning animation
    setTimeout(() => setScanProgress(55), 350);
    setTimeout(async () => {
      setScanProgress(90);
      await processOcrAndNavigate(demoText);
      setIsScanning(false);
    }, 700);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setIsScanning(true);
    setScanProgress(10);
    setStatusMessage('Initializing Tesseract OCR engine...');

    try {
      const worker = await createWorker('eng');
      
      setStatusMessage('Analyzing packaging typography and text lines...');
      setScanProgress(40);

      const ret = await worker.recognize(file);
      setScanProgress(80);
      await worker.terminate();

      const ocrText = ret.data.text || '';
      setStatusMessage('Matching against verified medicine records...');
      setScanProgress(95);

      await processOcrAndNavigate(ocrText);
    } catch (err: any) {
      console.error('OCR Error:', err);
      toast.error('Could not complete optical scan. Try a demo scan.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleStartBarcodeCamera = async () => {
    try {
      const scanner = new Html5Qrcode('barcode-reader');
      html5QrCodeRef.current = scanner;
      setIsBarcodeCameraRunning(true);
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 150 } },
        async (decodedText) => {
          await scanner.stop();
          setIsBarcodeCameraRunning(false);
          toast.success(`Barcode detected: ${decodedText}`);
          processOcrAndNavigate('', decodedText);
        },
        () => {}
      );
    } catch (err: any) {
      toast.error('Camera not accessible. Please enter barcode number below.');
      setIsBarcodeCameraRunning(false);
    }
  };

  const handleManualBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBarcode.trim()) return;
    processOcrAndNavigate('', manualBarcode.trim());
  };

  const handleSelectSearchResult = (med: Medicine) => {
    const mockResult: IdentifyResult = {
      extracted: {
        name: med.brand_names[0],
        strength: med.strength_label,
        ingredients: med.ingredients.map(i => i.name),
        form: med.form,
        manufacturer: med.manufacturer,
        expiry: null,
        expiryRaw: null,
        batch: null,
        mfg: null
      },
      candidates: [{ medicine: med, score: 0.99 }],
      best: med,
      confidence: 'High',
      confidenceScore: 0.99,
      checks: [
        { key: 'name', status: 'ok', message: `Medicine verified from database: ${med.brand_names[0]}` },
        { key: 'strength', status: 'ok', message: `Standard strength: ${med.strength_label}` },
        { key: 'expiry', status: 'warn', message: 'Manual search: please enter package expiry date' }
      ]
    };
    sessionStorage.setItem('medlens_scan_result', JSON.stringify(mockResult));
    navigate('/result', { state: { result: mockResult } });
  };

  return (
    <div className="p-4 space-y-5">
      {/* Page Title */}
      <div className="px-1">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          {t.scan.title}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Capture package photo, scan barcode, or search by name.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('photo')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'photo'
              ? 'bg-white text-teal-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>{t.scan.photoTab}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('barcode')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'barcode'
              ? 'bg-white text-teal-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Barcode className="w-3.5 h-3.5" />
          <span>{t.scan.barcodeTab}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('search')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'search'
              ? 'bg-white text-teal-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>{t.scan.searchTab}</span>
        </button>
      </div>

      {/* TAB 1: Photo OCR */}
      {activeTab === 'photo' && (
        <div className="space-y-4">
          {/* Viewfinder Preview */}
          <div className="relative">
            <ViewfinderOverlay
              isScanning={isScanning}
              progress={scanProgress}
              statusText={statusMessage}
            />

            {selectedImage && !isScanning && (
              <img
                src={selectedImage}
                alt="Captured packaging"
                className="absolute inset-0 w-full h-full object-contain bg-slate-950 rounded-2xl pointer-events-none"
              />
            )}
          </div>

          {/* Camera & File Upload Button */}
          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isScanning}
              className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-bold text-xs rounded-2xl shadow-md flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
              <span>{t.scan.orTakePhoto}</span>
            </button>
          </div>

          {/* Demo Scan Chips (Critical for lighting / no camera) */}
          <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-200/80 space-y-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-teal-700" />
              <span className="text-xs font-extrabold text-teal-950 uppercase tracking-wider">
                Instant Demo Scans
              </span>
            </div>
            <p className="text-[11px] text-teal-800 leading-relaxed">
              Feed verified packaging label text directly into the parsing engine:
            </p>

            <div className="space-y-2">
              {DEMO_SCANS.map(demo => (
                <button
                  key={demo.id}
                  type="button"
                  onClick={() => handleDemoScan(demo.text)}
                  disabled={isScanning}
                  className="w-full p-2.5 bg-white hover:bg-teal-100/50 rounded-xl border border-teal-200 flex items-center justify-between text-left transition-colors shadow-2xs group"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-teal-900">
                      {demo.label}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono-clinical truncate max-w-[260px]">
                      {demo.text.split('\n')[0]} • {demo.text.split('\n')[1]}
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold shrink-0">
                    {demo.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Barcode Scanner */}
      {activeTab === 'barcode' && (
        <div className="space-y-4">
          <div id="barcode-reader" className="w-full rounded-2xl overflow-hidden bg-slate-900 min-h-[220px] flex items-center justify-center text-white text-xs text-center p-4">
            {!isBarcodeCameraRunning && (
              <div>
                <Barcode className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                <p className="text-slate-400 max-w-xs text-xs">
                  Scan 13-digit EAN medicine barcode printed on packaging box or bottle.
                </p>
                <button
                  type="button"
                  onClick={handleStartBarcodeCamera}
                  className="mt-3 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700"
                >
                  Start Camera Scanner
                </button>
              </div>
            )}
          </div>

          {/* Manual Input Form */}
          <form onSubmit={handleManualBarcodeSubmit} className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Enter Barcode Number Manually:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualBarcode}
                onChange={e => setManualBarcode(e.target.value)}
                placeholder="e.g. 8901234500011"
                className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono-clinical text-slate-900"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800"
              >
                Lookup
              </button>
            </div>
          </form>

          {/* Demo Barcodes */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
            <span className="text-xs font-bold text-slate-700 block">
              {t.scan.demoBarcodes}
            </span>
            <div className="space-y-1.5">
              {DEMO_BARCODES.map(b => (
                <button
                  key={b.code}
                  type="button"
                  onClick={() => processOcrAndNavigate('', b.code)}
                  className="w-full p-2 bg-white rounded-xl border border-slate-200 hover:border-teal-400 flex items-center justify-between text-xs text-left transition-colors"
                >
                  <span className="font-semibold text-slate-900">{b.name}</span>
                  <span className="font-mono-clinical text-[11px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded">
                    {b.code}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Search by Name */}
      {activeTab === 'search' && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t.scan.searchPlaceholder}
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            {isSearching && (
              <div className="text-center py-6 text-xs text-slate-400">Searching database...</div>
            )}

            {!isSearching && searchResults.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400">
                Type medicine name to look up verified record.
              </div>
            )}

            {!isSearching && searchResults.map(med => (
              <div
                key={med.id}
                onClick={() => handleSelectSearchResult(med)}
                className="p-3 bg-white rounded-2xl border border-slate-200 hover:border-teal-500 cursor-pointer transition-colors shadow-2xs flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                    <Pill className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {med.brand_names[0]}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {med.generic_name} • {med.strength_label}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
