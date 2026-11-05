import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, Reminder, ReminderLog, CabinetItem } from '../api.ts';
import { useProfile } from '../context/ProfileContext.tsx';
import { useSettings } from '../context/SettingsContext.tsx';
import { 
  Clock, 
  Check, 
  X, 
  Plus, 
  Bell, 
  History, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Share2,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

export const RemindersPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { activeProfile } = useProfile();
  const { t } = useSettings();

  const [activeTab, setActiveTab] = useState<'today' | 'history'>('today');
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [historyLogs, setHistoryLogs] = useState<ReminderLog[]>([]);
  const [cabinetItems, setCabinetItems] = useState<CabinetItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Reminder Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCabinetId, setSelectedCabinetId] = useState<number | ''>('');
  const [reminderLabel, setReminderLabel] = useState('');
  const [reminderTime, setReminderTime] = useState('08:00');
  const [notifyCaregiver, setNotifyCaregiver] = useState(true);

  const loadData = async () => {
    const pid = activeProfile?.id || 1;
    setLoading(true);
    try {
      const [rems, logs, cabs] = await Promise.all([
        api.getReminders(pid),
        api.getReminderLogs(pid),
        api.getCabinet(pid)
      ]);
      setReminders(rems);
      setHistoryLogs(logs);
      setCabinetItems(cabs);

      const addParam = searchParams.get('add');
      if (addParam) {
        const item = cabs.find(c => c.id === parseInt(addParam, 10));
        if (item) {
          setSelectedCabinetId(item.id);
          setReminderLabel(`${item.display_name} Daily Dose`);
          setIsAddModalOpen(true);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeProfile?.id]);

  const handleAction = async (reminder: Reminder, timeStr: string, action: 'taken' | 'skipped') => {
    try {
      const todayDate = new Date().toISOString().split('T')[0];
      const scheduledFor = `${todayDate}T${timeStr}:00`;
      await api.logReminder(reminder.id, scheduledFor, action);

      if (action === 'taken') {
        toast.success(`Dose marked as taken for ${reminder.label}`);
      } else {
        toast('Dose marked as skipped', { icon: '⏭️' });
      }

      if (reminder.notify_caregiver) {
        toast.success('Caregiver notified (demo confirmation sent)', { icon: '📲' });
      }

      // Refresh history
      if (activeProfile) {
        const logs = await api.getReminderLogs(activeProfile.id);
        setHistoryLogs(logs);
      }
    } catch (err: any) {
      toast.error('Failed to log reminder');
    }
  };

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProfile || !reminderLabel.trim()) return;

    try {
      await api.createReminder({
        profile_id: activeProfile.id,
        cabinet_item_id: selectedCabinetId ? Number(selectedCabinetId) : null,
        label: reminderLabel.trim(),
        times: [reminderTime],
        days: [0, 1, 2, 3, 4, 5, 6],
        notify_caregiver: notifyCaregiver ? 1 : 0,
        active: 1
      });

      toast.success('Reminder scheduled successfully');
      setIsAddModalOpen(false);
      setReminderLabel('');
      setSelectedCabinetId('');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create reminder');
    }
  };

  const handleDeleteReminder = async (id: number) => {
    try {
      await api.deleteReminder(id);
      setReminders(prev => prev.filter(r => r.id !== id));
      toast.success('Reminder removed');
    } catch (err: any) {
      toast.error('Failed to delete reminder');
    }
  };

  // Organize today's doses into morning, afternoon, evening
  const morningDoses: Array<{ reminder: Reminder; time: string }> = [];
  const afternoonDoses: Array<{ reminder: Reminder; time: string }> = [];
  const eveningDoses: Array<{ reminder: Reminder; time: string }> = [];

  for (const rem of reminders) {
    if (!rem.active) continue;
    for (const time of rem.times) {
      const hour = parseInt(time.split(':')[0], 10);
      if (hour < 12) {
        morningDoses.push({ reminder: rem, time });
      } else if (hour < 18) {
        afternoonDoses.push({ reminder: rem, time });
      } else {
        eveningDoses.push({ reminder: rem, time });
      }
    }
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {t.reminders.title}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Caregiver synchronized schedule for {activeProfile?.name}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('today')}
          className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'today'
              ? 'bg-white text-teal-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{t.reminders.todayTimeline}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'history'
              ? 'bg-white text-teal-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>{t.reminders.history}</span>
        </button>
      </div>

      {/* Non-Negotiable Safety Disclaimer Box */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 italic text-center">
        {t.reminders.disclaimer}
      </div>

      {/* TAB 1: Today Timeline */}
      {activeTab === 'today' && (
        <div className="space-y-4">
          {loading && (
            <div className="py-12 text-center text-xs text-slate-400">Loading schedule...</div>
          )}

          {!loading && reminders.length === 0 && (
            <div className="py-12 text-center space-y-2 bg-white rounded-2xl border border-slate-200 p-6">
              <Clock className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-xs font-bold text-slate-800">No scheduled reminders</div>
              <p className="text-[11px] text-slate-500">Add a schedule for your medicines.</p>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="mt-2 px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl"
              >
                Create First Reminder
              </button>
            </div>
          )}

          {!loading && (
            <div className="space-y-4">
              {/* Morning Timeline */}
              {renderTimelineSection('Morning (06:00 - 12:00)', morningDoses, handleAction, handleDeleteReminder)}

              {/* Afternoon Timeline */}
              {renderTimelineSection('Afternoon (12:00 - 18:00)', afternoonDoses, handleAction, handleDeleteReminder)}

              {/* Evening Timeline */}
              {renderTimelineSection('Evening (18:00 - 24:00)', eveningDoses, handleAction, handleDeleteReminder)}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: History Log */}
      {activeTab === 'history' && (
        <div className="space-y-2.5">
          {historyLogs.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-400">
              No logged dose activity recorded yet.
            </div>
          )}

          {historyLogs.map(log => (
            <div
              key={log.id}
              className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs shadow-2xs"
            >
              <div>
                <div className="font-bold text-slate-900">{log.label || 'Medication'}</div>
                <div className="text-[10px] text-slate-400 font-mono-clinical mt-0.5">
                  Scheduled: {log.scheduled_for}
                </div>
              </div>

              <div>
                {log.status === 'taken' && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Taken
                  </span>
                )}
                {log.status === 'skipped' && (
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium text-[11px]">
                    Skipped
                  </span>
                )}
                {log.status === 'missed' && (
                  <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-bold text-[11px]">
                    Missed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Reminder Modal */}
      {isAddModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-3.5"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-sm font-bold text-slate-900">Add Medicine Reminder</h3>

            <form onSubmit={handleCreateReminder} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Pick from Cabinet (Optional):</label>
                <select
                  value={selectedCabinetId}
                  onChange={e => {
                    const cid = e.target.value ? Number(e.target.value) : '';
                    setSelectedCabinetId(cid);
                    const item = cabinetItems.find(c => c.id === cid);
                    if (item) setReminderLabel(`${item.display_name} Daily Dose`);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">-- Choose a cabinet medicine --</option>
                  {cabinetItems.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.display_name} ({c.strength_label || 'Standard'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reminder Label:</label>
                <input
                  type="text"
                  value={reminderLabel}
                  onChange={e => setReminderLabel(e.target.value)}
                  placeholder="e.g. Dolo 650 after breakfast"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Scheduled Time:</label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={e => setReminderTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono-clinical font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              {/* Caregiver toggle */}
              <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-teal-950 text-xs">Notify Caregiver</div>
                  <div className="text-[10px] text-teal-800">Alert family if missed after 30 mins</div>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifyCaregiver(!notifyCaregiver)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${
                    notifyCaregiver ? 'bg-teal-600' : 'bg-slate-300'
                  }`}
                  role="switch"
                  aria-checked={notifyCaregiver}
                >
                  <span
                    className={`block w-3.5 h-3.5 rounded-full bg-white shadow transform transition-transform ${
                      notifyCaregiver ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700"
                >
                  Schedule Dose
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

function renderTimelineSection(
  title: string,
  doses: Array<{ reminder: Reminder; time: string }>,
  onAction: (r: Reminder, time: string, action: 'taken' | 'skipped') => void,
  onDelete: (id: number) => void
) {
  if (doses.length === 0) return null;

  return (
    <div className="space-y-2">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-1">
        {title}
      </span>

      <div className="space-y-2">
        {doses.map(({ reminder, time }) => (
          <div
            key={`${reminder.id}-${time}`}
            className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="px-2 py-1 bg-teal-50 text-teal-800 font-mono-clinical font-bold text-xs rounded-lg border border-teal-200">
                {time}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">{reminder.label}</div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  {reminder.notify_caregiver ? (
                    <span className="text-teal-700 font-semibold flex items-center gap-0.5">
                      <Share2 className="w-2.5 h-2.5" /> Caregiver linked
                    </span>
                  ) : (
                    <span>Self-monitored</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => onAction(reminder, time, 'taken')}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-2xs"
              >
                <Check className="w-3 h-3" />
                <span>Taken</span>
              </button>
              <button
                type="button"
                onClick={() => onAction(reminder, time, 'skipped')}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={() => onDelete(reminder.id)}
                className="p-1 text-slate-300 hover:text-red-500 rounded-lg"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
