import { useEffect, useState } from 'react';
import { Save, Settings as SettingsIcon } from 'lucide-react';
import { useStore } from '../../lib/store';
import { useToast } from '../../lib/toast';

export default function Settings() {
  const { appSettings, updateAppSettings } = useStore();
  const toast = useToast();
  const [reward, setReward] = useState('4');
  const [min, setMin] = useState('300');
  const [max, setMax] = useState('50000');
  const [newbieReq, setNewbieReq] = useState('300');
  const [newbieReward, setNewbieReward] = useState('60');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (appSettings) {
      setReward(String(appSettings.rewardPercentage));
      setMin(String(appSettings.minOrderSize));
      setMax(String(appSettings.maxOrderSize));
      setNewbieReq(String(appSettings.newbieRequiredOrderAmount));
      setNewbieReward(String(appSettings.newbieRewardAmount));
    }
  }, [appSettings]);

  const save = async () => {
    if (saving) return;
    const r = Number(reward);
    const mn = Number(min);
    const mx = Number(max);
    const nr = Number(newbieReq);
    const nrw = Number(newbieReward);
    if ([r, mn, mx, nr, nrw].some((v) => isNaN(v) || v < 0) || mx <= 0) {
      toast('Enter valid numeric values', 'error');
      return;
    }
    if (mn >= mx) {
      toast('Min order size must be less than max', 'error');
      return;
    }
    setSaving(true);
    try {
      await updateAppSettings({
        rewardPercentage: r,
        minOrderSize: mn,
        maxOrderSize: mx,
        newbieRequiredOrderAmount: nr,
        newbieRewardAmount: nrw,
      });
      toast('Settings updated', 'success');
    } catch {
      toast('Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!appSettings) {
    return <div className="text-slate-400">Loading settings...</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon size={24} className="text-slate-700" />
        <h1 className="text-2xl font-semibold text-slate-800">Global Settings</h1>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm max-w-lg">
        <p className="text-sm text-slate-500 mb-6">
          Configure the dynamic reward rate, order size limits, and newbie reward. These values apply to all
          Buy/Deposit screens in real time.
        </p>

        <div className="space-y-5">
          <Field label="Reward Percentage (%)" hint="Users receive this percentage of their deposit as bonus Itoken." value={reward} onChange={setReward} step="0.1" />
          <Field label="Minimum Order Size (₹)" value={min} onChange={setMin} />
          <Field label="Maximum Order Size (₹)" value={max} onChange={setMax} />

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Newbie Reward</h3>
            <div className="space-y-5">
              <Field
                label="Newbie Required Order Amount (₹)"
                hint="Amount a new user must deposit (once) to unlock the newbie reward."
                value={newbieReq}
                onChange={setNewbieReq}
              />
              <Field
                label="Newbie Reward Amount (₹)"
                hint="Bonus credited to a new user's wallet when they complete their first qualifying deposit."
                value={newbieReward}
                onChange={setNewbieReward}
              />
            </div>
          </div>
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {saving
            ? <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
            : <Save size={16} />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  hint,
  step,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  step?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700 block mb-1.5">{label}</label>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500"
      />
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}
