import { useState } from 'react';
import { Copy, QrCode, Users, ChevronRight } from 'lucide-react';
import { useStore } from '../lib/store';
import { useToast } from '../lib/toast';

export default function Team() {
  const { currentUser } = useStore();
  const toast = useToast();
  const [showLink, setShowLink] = useState(true);
  const inviteLink = `https://vivrapay.app/#/rs/${(currentUser?.id ?? 'guest').slice(-10)}`;

  const copy = () => {
    navigator.clipboard.writeText(inviteLink).then(() => toast('Link Copied!', 'success'));
  };

  return (
    <div>
      <div className="text-center py-4 text-lg font-medium text-gray-700">Team</div>

      <div className="flex items-center px-5 py-3 pb-5 border-b border-gray-200">
        <div className="w-[60px] h-[60px] rounded-full border border-gray-200 flex justify-center items-center bg-[#f4f8fc] mr-4 overflow-hidden">
          <Users size={36} className="text-[#a4c2f4]" />
        </div>
        <div className="flex-1 flex justify-between text-gray-400 text-sm">
          <span>Reward:0%</span>
          <span>ID: {currentUser?.id.slice(-10) ?? '—'}</span>
        </div>
      </div>

      <Row label="Team Count" value="0" arrow />
      <Row label="Total Commission" value="0.00" />
      <Row label="My Total Profit" value="0.00" arrow />
      <Row label="Invite Friends Reward" value="View" arrow />
      <Row label="Recall Friends Reward" value="Show Recall Reward" arrow />
      <Row label="Yesterday Team Commission" value="0.00" arrow />
      <Row label="Today Team Commission" value="0" color="orange" />

      <div className="px-5 py-4 pb-6 border-b-[10px] border-[#f8f9fb]">
        <div className="w-full h-3.5 bg-[#edf1fa] rounded-full mb-2.5" />
        <div className="flex justify-between text-[13px] text-gray-400">
          <span>0</span>
          <span className="flex-1 text-center">Daily Commission Tasks 0%</span>
          <span>500</span>
        </div>
      </div>

      <div className="px-5 py-5">
        <div className="flex items-center mb-2.5">
          <div className="w-6 flex justify-center mr-2.5 text-[#5ea3db] z-2 bg-white">
            <Users size={20} />
          </div>
          <div className="flex items-center text-[15px] text-gray-700">
            Invitation Link{' '}
            <button
              onClick={() => setShowLink((s) => !s)}
              className="text-[#5ea3db] ml-4 text-sm cursor-pointer"
            >
              {showLink ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between ml-8 pb-5 border-b border-gray-200">
          <div className="text-gray-400 text-sm truncate max-w-[220px]">
            {showLink ? inviteLink : '••••••••••••••••'}
          </div>
          <div className="flex gap-3 items-center">
            <QrCode size={20} className="text-[#eb7a44] cursor-pointer" />
            <Copy size={20} className="text-[#5ea3db] cursor-pointer" onClick={copy} />
          </div>
        </div>

        <div className="ml-3 relative pt-5">
          <div className="absolute left-0 top-[-40px] bottom-2.5 w-px bg-[#cde4f5] z-1" />
          {[
            { level: 1, pct: '20%' },
            { level: 2, pct: '15%' },
            { level: 3, pct: '10%' },
          ].map((row) => (
            <div key={row.level} className="flex items-center mb-8 relative last:mb-0">
              <div className="bg-white text-[#5ea3db] absolute -left-3 z-2 flex justify-center items-center w-6">
                <Users size={20} />
              </div>
              <div className="ml-8 text-[15px] text-gray-600">
                level {row.level} Commission = Buy *{' '}
                <span className="text-[#d98246] font-medium">{row.pct}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  arrow,
  color = 'blue',
}: {
  label: string;
  value: string;
  arrow?: boolean;
  color?: 'blue' | 'orange';
}) {
  return (
    <div className="flex justify-between items-center px-5 py-4.5 border-b border-gray-200 text-[15px] text-gray-700">
      <span>{label}</span>
      <div className={`flex items-center ${color === 'orange' ? 'text-[#d98246]' : 'text-[#5ea3db]'}`}>
        {value} {arrow && <ChevronRight size={16} className="text-gray-300 ml-2" />}
      </div>
    </div>
  );
}
