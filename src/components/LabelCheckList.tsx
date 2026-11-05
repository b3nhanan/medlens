import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Edit3, Check } from 'lucide-react';

export interface LabelCheckItem {
  key: string;
  status: 'ok' | 'warn';
  message: string;
}

interface LabelCheckListProps {
  checks: LabelCheckItem[];
  values: {
    name: string;
    strength: string;
    expiry: string;
    batch: string;
  };
  onUpdateValue: (key: 'name' | 'strength' | 'expiry' | 'batch', newValue: string) => void;
}

export const LabelCheckList: React.FC<LabelCheckListProps> = ({
  checks,
  values,
  onUpdateValue
}) => {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');

  const startEdit = (key: string, current: string) => {
    setEditingKey(key);
    setTempValue(current);
  };

  const saveEdit = (key: 'name' | 'strength' | 'expiry' | 'batch') => {
    onUpdateValue(key, tempValue);
    setEditingKey(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Packaging Label Verification
        </h4>
        <span className="text-[11px] text-slate-400">Tap to edit uncertain fields</span>
      </div>

      <div className="space-y-3">
        {/* Name Check */}
        {renderItem(
          'name',
          checks.find(c => c.key === 'name'),
          'Medicine Name',
          values.name || 'Not detected',
          startEdit,
          editingKey,
          tempValue,
          setTempValue,
          saveEdit
        )}

        {/* Strength Check */}
        {renderItem(
          'strength',
          checks.find(c => c.key === 'strength'),
          'Strength',
          values.strength || 'Not detected',
          startEdit,
          editingKey,
          tempValue,
          setTempValue,
          saveEdit
        )}

        {/* Expiry Check */}
        {renderItem(
          'expiry',
          checks.find(c => c.key === 'expiry'),
          'Expiry Date',
          values.expiry || 'Not detected',
          startEdit,
          editingKey,
          tempValue,
          setTempValue,
          saveEdit,
          'date'
        )}

        {/* Batch Check */}
        {renderItem(
          'batch',
          checks.find(c => c.key === 'batch'),
          'Batch Number',
          values.batch || 'Not detected',
          startEdit,
          editingKey,
          tempValue,
          setTempValue,
          saveEdit
        )}
      </div>
    </div>
  );
};

function renderItem(
  key: 'name' | 'strength' | 'expiry' | 'batch',
  check: LabelCheckItem | undefined,
  label: string,
  currentVal: string,
  startEdit: (k: string, val: string) => void,
  editingKey: string | null,
  tempVal: string,
  setTempVal: (v: string) => void,
  saveEdit: (k: 'name' | 'strength' | 'expiry' | 'batch') => void,
  inputType = 'text'
) {
  const isOk = check ? check.status === 'ok' : false;
  const isEditing = editingKey === key;

  return (
    <div className={`p-3 rounded-xl border transition-colors ${
      isOk ? 'bg-slate-50/70 border-slate-200/80' : 'bg-amber-50/70 border-amber-200'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start space-x-2.5">
          <div className="mt-0.5">
            {isOk ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600" />
            )}
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
              <span>{label}:</span>
              <span className="font-mono-clinical font-bold text-slate-800">
                {currentVal}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {check?.message || (isOk ? 'Verified from packaging' : 'Please check and enter')}
            </div>
          </div>
        </div>

        {!isEditing ? (
          <button
            type="button"
            onClick={() => startEdit(key, currentVal === 'Not detected' ? '' : currentVal)}
            className="p-1.5 rounded-lg hover:bg-slate-200/60 text-slate-500 hover:text-slate-800 transition-colors"
            title="Edit value"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>

      {isEditing && (
        <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center gap-2">
          <input
            type={inputType}
            value={tempVal}
            onChange={e => setTempVal(e.target.value)}
            placeholder={`Enter ${label}...`}
            className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
            autoFocus
          />
          <button
            type="button"
            onClick={() => saveEdit(key)}
            className="px-2.5 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-teal-700 transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            Save
          </button>
        </div>
      )}
    </div>
  );
}
