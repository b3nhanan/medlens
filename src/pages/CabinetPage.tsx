import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api, CabinetItem, SafetyAlert } from '../api.ts';
import { useProfile } from '../context/ProfileContext.tsx';
import { useSettings } from '../context/SettingsContext.tsx';
import { 
  Plus, 
  Search, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  Edit3, 
  Bell, 
  MoreVertical, 
  Pill,
  Sun,
  Droplet
} from 'lucide-react';
import toast from 'react-hot-toast';

export const CabinetPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { activeProfile, alertCount } = useProfile();
  const { t } = useSettings();

  const [items, setItems] = useState<CabinetItem[]>([]);
  const [safetyAlerts, setSafetyAlerts] = useState<SafetyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'valid' | 'expiring' | 'expired' | 'refrigerated'>('all');

  // Edit modal state
  const [editingItem, setEditingItem] = useState<CabinetItem | null>(null);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editExpiry, setEditExpiry] = useState('');
  const [editBatch, setEditBatch] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  useEffect(() => {
    const f = searchParams.get('filter');
    if (f === 'expiring' || f === 'expired' || f === 'valid' || f === 'refrigerated') {
      setActiveFilter(f as any);
    }
  }, [searchParams]);

  const loadData = async () => {
    const pid = activeProfile?.id || 1;
    setLoading(true);
    try {
      const [cabinetRes, safetyRes] = await Promise.all([
        api.getCabinet(pid),
        api.getSafetyCheck(pid)
      ]);
      setItems(cabinetRes);
      setSafetyAlerts(safetyRes.alerts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeProfile?.id]);

  const handleDeleteItem = async (id: number, name: string) => {
    try {
      await api.deleteCabinetItem(id);
      setItems(prev => prev.filter(i => i.id !== id));
      toast.success(`${name} removed from cabinet`);
    } catch (err: any) {
      toast.error('Failed to remove item');
    }
  };

  const handleStartEdit = (item: CabinetItem) => {
    setEditingItem(item);
    setEditDisplayName(item.display_name);
    setEditExpiry(item.expiry_date || '');
    setEditBatch(item.batch_number || '');
    setEditNotes(item.notes || '');
    setOpenMenuId(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      const updated = await api.updateCabinetItem(editingItem.id, {
        display_name: editDisplayName,
        expiry_date: editExpiry || null,
        batch_number: editBatch || null,
        notes: editNotes || null
      });
      setItems(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...updated } : i));
      toast.success('Updated medicine details');
      setEditingItem(null);
    } catch (err: any) {
      toast.error('Failed to update details');
    }
  };

  // Filter items
  const now = new Date();
  const filteredItems = items.filter(item => {
    // Search query match
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const nameMatch = item.display_name.toLowerCase().includes(q);
      const genMatch = item.generic_name?.toLowerCase().includes(q);
      const ingMatch = item.ingredients?.some(i => i.name.toLowerCase().includes(q));
      if (!nameMatch && !genMatch && !ingMatch) return false;
    }

    // Status filter
    if (activeFilter === 'all') return true;

    if (activeFilter === 'refrigerated') {
      return item.refrigerate === 1;
    }

    if (!item.expiry_date) {
      return activeFilter === 'valid';
    }

    const exp = new Date(item.expiry_date);
    const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (activeFilter === 'expired') return diffDays < 0;
    if (activeFilter === 'expiring') return diffDays >= 0 && diffDays <= 60;
    if (activeFilter === 'valid') return diffDays > 60;

    return true;
  });

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {t.cabinet.title}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeProfile?.name}'s current medications ({items.length} items)
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/scan')}
          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={t.cabinet.searchPlaceholder}
          className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
        />
      </div>

      {/* Filter Chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-bold">
        {[
          { key: 'all', label: t.cabinet.filterAll },
          { key: 'valid', label: t.cabinet.filterValid },
          { key: 'expiring', label: t.cabinet.filterExpiring },
          { key: 'expired', label: t.cabinet.filterExpired },
          { key: 'refrigerated', label: t.cabinet.filterRefrigerated }
        ].map(f => (
          <button
            key={f.key}
            type="button"
            onClick={() => setActiveFilter(f.key as any)}
            className={`px-3 py-1.5 rounded-xl border whitespace-nowrap transition-colors ${
              activeFilter === f.key
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Medicines Cards List */}
      <div className="space-y-3">
        {loading && (
          <div className="py-12 text-center text-xs text-slate-400">
            Loading medicine cabinet...
          </div>
        )}

        {!loading && filteredItems.length === 0 && (
          <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200 p-6">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-800">{t.cabinet.empty}</div>
              <div className="text-xs text-slate-500 mt-1">{t.cabinet.addFirst}</div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/scan')}
              className="mt-2 px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Scan Medicine
            </button>
          </div>
        )}

        {!loading && filteredItems.map(item => {
          let itemExpiryStatus: 'valid' | 'expiring' | 'expired' | 'unverified' = 'unverified';
          let diffDays = 0;
          if (item.expiry_date) {
            const exp = new Date(item.expiry_date);
            diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays < 0) itemExpiryStatus = 'expired';
            else if (diffDays <= 60) itemExpiryStatus = 'expiring';
            else itemExpiryStatus = 'valid';
          }

          // Check if this item is involved in duplicate alert
          const isDuplicate = safetyAlerts.some(a => a.type === 'duplicate' && a.items.includes(item.id));
          const isInteracting = safetyAlerts.some(a => a.type === 'known' && a.items.includes(item.id));

          return (
            <div
              key={item.id}
              className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all relative"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 
                      onClick={() => navigate(`/medicine/${item.medicine_id}`)}
                      className="text-sm font-bold text-slate-900 hover:text-teal-700 cursor-pointer transition-colors"
                    >
                      {item.display_name}
                    </h3>

                    {/* Refrigeration Badge */}
                    {item.refrigerate === 1 && (
                      <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center gap-0.5">
                        <span>🧊</span> 2-8°C
                      </span>
                    )}

                    {/* Duplicate Warning Tag */}
                    {isDuplicate && (
                      <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold flex items-center gap-0.5">
                        <AlertTriangle className="w-3 h-3 text-red-600" />
                        Duplicate
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-500 mt-0.5">
                    {item.generic_name} • {item.strength_label}
                  </div>
                </div>

                {/* More options menu */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {openMenuId === item.id && (
                    <div className="absolute right-0 top-7 w-36 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-20 text-xs">
                      <button
                        type="button"
                        onClick={() => navigate(`/medicine/${item.medicine_id}`)}
                        className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50"
                      >
                        View Details
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(item)}
                        className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit Details
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/reminders?add=${item.id}`)}
                        className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        Set Reminder
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id, item.display_name)}
                        className="w-full px-3 py-1.5 text-left text-red-600 hover:bg-red-50 flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Active Ingredients Chips */}
              {item.ingredients && item.ingredients.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {item.ingredients.map(ing => (
                    <span
                      key={ing.name}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium"
                    >
                      {ing.name} ({ing.strength})
                    </span>
                  ))}
                </div>
              )}

              {/* Expiry & Batch Footer */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-400 font-medium">Expires:</span>
                  <span className="font-mono-clinical font-semibold text-slate-800">
                    {item.expiry_date || 'Not verified'}
                  </span>
                </div>

                <div>
                  {itemExpiryStatus === 'valid' && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                      Valid
                    </span>
                  )}
                  {itemExpiryStatus === 'expiring' && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold">
                      Expires in {diffDays}d
                    </span>
                  )}
                  {itemExpiryStatus === 'expired' && (
                    <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-bold">
                      Expired
                    </span>
                  )}
                  {itemExpiryStatus === 'unverified' && (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                      Unverified
                    </span>
                  )}
                </div>
              </div>

              {item.notes && (
                <div className="mt-2 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg italic">
                  Note: {item.notes}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Action '+' Button */}
      <button
        type="button"
        onClick={() => navigate('/scan')}
        className="fixed bottom-20 lg:bottom-16 right-6 lg:right-auto lg:translate-x-[180px] w-12 h-12 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white rounded-full shadow-xl flex items-center justify-center transition-all z-20"
        aria-label="Scan new medicine"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Edit Item Modal */}
      {editingItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setEditingItem(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-3"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-sm font-bold text-slate-900">Edit Cabinet Medicine</h3>
            <form onSubmit={handleSaveEdit} className="space-y-2.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Display Name:</label>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={e => setEditDisplayName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Expiry Date:</label>
                <input
                  type="date"
                  value={editExpiry}
                  onChange={e => setEditExpiry(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono-clinical focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Batch Number:</label>
                <input
                  type="text"
                  value={editBatch}
                  onChange={e => setEditBatch(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono-clinical focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Notes:</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
