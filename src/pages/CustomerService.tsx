import { ArrowLeft, Headphones, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import SmartImage from '../components/SmartImage';

export default function CustomerServicePage() {
  const { customerServices } = useStore();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen bg-white max-w-[480px] mx-auto">
      <header className="flex items-center px-4 py-4 border-b border-gray-200">
        <button onClick={() => navigate(-1)} className="mr-3 text-gray-700">
          <ArrowLeft size={22} />
        </button>
        <span className="text-base font-medium text-gray-700">Customer Service</span>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {customerServices.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6 text-center">
            <Headphones size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-400 text-sm">No customer service links available yet.</p>
          </div>
        ) : (
          <div className="py-2">
            {customerServices.map((cs) => (
              <div
                key={cs.id}
                className="flex items-center px-4 py-4 border-b border-gray-100 gap-3"
              >
                <SmartImage
                  path={cs.iconUrl}
                  alt={cs.name}
                  className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0"
                  imgClassName="w-10 h-10 object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-medium text-gray-700">{cs.name}</div>
                  {cs.description && (
                    <div className="text-[13px] text-gray-400 truncate">{cs.description}</div>
                  )}
                </div>
                <a
                  href={cs.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 px-5 py-2 bg-[#62007a] text-white text-sm rounded-lg font-medium hover:bg-[#4a005c] transition-colors flex items-center gap-1.5"
                >
                  Go <ExternalLink size={14} />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
