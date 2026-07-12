import { useState } from 'react';
import { ChevronLeft, Link as LinkIcon, Play, Settings, FileText, X, CheckCircle2, CreditCard } from 'lucide-react';
import { useStore } from '../lib/store';
import { useToast } from '../lib/toast';

const PARTNERS = [
  { id: 'paytm-biz', name: 'Paytm Business', desc: 'Paytm Business is an Indian digital payment platform.', img: 'https://kxddhnncgrxinftkjpcw.supabase.co/storage/v1/object/public/logos/Paytmbusiness.png', disabled: false },
  { id: 'phonepe-biz', name: 'Phonepe Business', desc: 'PhonePe Business is an Indian digital payment platform.', img: 'https://kxddhnncgrxinftkjpcw.supabase.co/storage/v1/object/public/logos/Phonepebusiness.png', disabled: true },
  { id: 'mobikwik', name: 'Mobikwik', desc: 'MobiKwik is an Indian digital payment platform.', img: 'https://kxddhnncgrxinftkjpcw.supabase.co/storage/v1/object/public/logos/MobiKwik.jpg', disabled: false },
  { id: 'paytm', name: 'Paytm', desc: 'Paytm is an Indian digital payment platform.', img: 'https://kxddhnncgrxinftkjpcw.supabase.co/storage/v1/object/public/logos/Paytm.png', disabled: true },
  { id: 'phonepe', name: 'Phonepe', desc: 'PhonePe is an Indian digital payment platform.', img: 'https://kxddhnncgrxinftkjpcw.supabase.co/storage/v1/object/public/logos/Phonepe.png', disabled: false },
  { id: 'freecharge', name: 'Freecharge', desc: 'Freecharge offers digital payment and mobile recharge services in India.', img: 'https://kxddhnncgrxinftkjpcw.supabase.co/storage/v1/object/public/logos/Freecharge.png', disabled: false },
  { id: 'airtel', name: 'Airtel', desc: 'Airtel is an Indian digital payment platform.', img: 'https://kxddhnncgrxinftkjpcw.supabase.co/storage/v1/object/public/logos/Airtel.png', disabled: true },
  { id: 'slice', name: 'Slice', desc: 'Slice is an Indian digital payment platform.', img: 'https://kxddhnncgrxinftkjpcw.supabase.co/storage/v1/object/public/logos/Slice.png', disabled: true },
  { id: 'induspay', name: 'IndusPay', desc: 'IndusPay is an Indian digital payment platform.', img: 'https://kxddhnncgrxinftkjpcw.supabase.co/storage/v1/object/public/logos/Induspay.png', disabled: false },
  { id: 'amazonpay', name: 'Amazon Pay', desc: 'Amazon Pay is an Indian digital payment platform.', img: 'https://kxddhnncgrxinftkjpcw.supabase.co/storage/v1/object/public/logos/Amazonpay.jpg', disabled: false },
  { id: 'bharatpe', name: 'BharatPe Business', desc: 'BharatPe Business is an Indian digital payment platform.', img: 'https://kxddhnncgrxinftkjpcw.supabase.co/storage/v1/object/public/logos/Bharatpaybusiness.png', disabled: false },
];

type Phase = 'main' | 'kyc' | 'processing' | 'upi-input';
type Tab = 'Buy' | 'Sell';

const UPI_HANDLE: Record<string, string> = {
  'paytm-biz': '@paytm',
  paytm: '@paytm',
  'phonepe-biz': '@ybl',
  phonepe: '@ybl',
  mobikwik: '@ikwik',
  freecharge: '@freecharge',
  airtel: '@airtel',
  slice: '@slice',
  induspay: '@indus',
  amazonpay: '@apl',
  bharatpe: '@bharatpe',
};

export default function UPI() {
  const { currentUser, addLinkedUPI, toggleSelling } = useStore();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('Buy');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<(typeof PARTNERS)[number] | null>(null);
  const [kycName, setKycName] = useState('');
  const [kycNumber, setKycNumber] = useState('');
  const [kycError, setKycError] = useState(false);
  const [phase, setPhase] = useState<Phase>('main');
  const [processText, setProcessText] = useState('');
  const [finalUpi, setFinalUpi] = useState('');

  const linked = (currentUser?.upis ?? []).filter((u) => u.tabType === tab);

  const openSheet = () => setSheetOpen(true);
  const closeSheet = () => setSheetOpen(false);

  const selectPartner = (p: (typeof PARTNERS)[number]) => {
    if (p.disabled) {
      toast('This partner is currently unavailable', 'info');
      return;
    }
    setSelectedPartner(p);
    setKycName('');
    setKycNumber('');
    setKycError(false);
    closeSheet();
    setPhase('kyc');
  };

  const startVerification = () => {
    if (kycNumber.length !== 10) {
      setKycError(true);
      return;
    }
    setKycError(false);
    setPhase('processing');
    setProcessText('Detecting OTP...');
    setTimeout(() => setProcessText('Sending...'), 1500);
    setTimeout(() => setProcessText('Loading...'), 2500);
    setTimeout(() => {
      setProcessText('Verified successfully!');
      setTimeout(() => {
        setProcessText('Setup your UPI');
        setPhase('upi-input');
        const suffix = UPI_HANDLE[selectedPartner!.id] ?? `@${selectedPartner!.name.toLowerCase().replace(/\s/g, '').substring(0, 3)}`;
        setFinalUpi(`${kycNumber}${suffix}`);
      }, 1200);
    }, 4000);
  };

  const saveUpi = async () => {
    if (!selectedPartner || !currentUser) return;
    const masked = kycNumber.substring(0, 3) + '****' + kycNumber.substring(7);
    await addLinkedUPI({
      partnerId: selectedPartner.id,
      partnerName: selectedPartner.name,
      maskedPhone: masked,
      upiId: finalUpi,
      tabType: tab,
      isSelling: tab === 'Sell',
    });
    setPhase('main');
    toast(`UPI Linked Successfully in ${tab}!`, 'success');
  };

  const partnerOf = (id: string) => PARTNERS.find((p) => p.id === id);

  return (
    <div className="relative h-full overflow-hidden">
      {phase === 'main' && (
        <div className="flex flex-col h-full">
          <div className="text-center py-4 text-base font-medium bg-white sticky top-0 z-10 border-b border-gray-100">
            UPI
          </div>
          <div className="text-rose-500 text-center text-[13px] font-medium my-2.5 px-4">
            If you Change your upi id, please relink UPI.
          </div>

          <div className="flex justify-between px-4 gap-2.5 mb-5">
            <button className="flex-1 border-none rounded-lg py-3 text-white text-sm font-medium flex flex-col items-center gap-1.5 bg-[#5b9ed5]">
              <Play size={16} /> UPI Tutorial
            </button>
            <button
              onClick={openSheet}
              className="flex-1 border-none rounded-lg py-3 text-white text-sm font-medium flex flex-col items-center gap-1.5 bg-[#188bf4]"
            >
              <LinkIcon size={16} /> Link New UPI
            </button>
          </div>

          <div className="flex border-b border-gray-200 bg-white">
            {(['Buy', 'Sell'] as Tab[]).map((t) => (
              <div
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 text-center py-3 text-[15px] cursor-pointer relative ${
                  tab === t ? 'text-[#188bf4] font-medium' : 'text-gray-400'
                }`}
              >
                {t}
                {tab === t && (
                  <span className="absolute -bottom-px left-1/2 -translate-x-1/2 w-10 h-0.5 bg-[#188bf4]" />
                )}
              </div>
            ))}
          </div>

          <div className="flex-1 bg-[#f5f6f8] min-h-[300px] overflow-y-auto no-scrollbar">
            {linked.length === 0 ? (
              <div className="text-center py-10 px-5 text-gray-400 text-sm">
                No UPI linked yet for {tab}. Click 'Link New UPI' to add.
              </div>
            ) : (
              linked.map((item) => {
                const p = partnerOf(item.partnerId);
                return (
                  <div key={item.id} className="bg-white px-4 py-5 border-b border-gray-200 mb-2">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 shrink-0">
                        {p && (p.img ? <img src={p.img} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><CreditCard size={20} className="text-gray-400" /></div>)}
                      </div>
                      <div className="flex-1">
                        <div className="text-[15px] text-gray-700 mb-1 font-medium">
                          {p?.name.toLowerCase()}({item.maskedPhone})
                        </div>
                        <div className="text-[13px] text-gray-400 mb-1">{item.upiId}</div>
                        <div className="flex items-center gap-1.5 text-gray-400 text-[13px] mb-2.5">
                          <span className="w-2 h-2 bg-[#00d26a] rounded-full" /> Active
                        </div>
                        <div className="flex items-center justify-between mt-2.5">
                          {/* FIX #4: Toggle works for both Buy and Sell tabs */}
                          <button
                            onClick={() => toggleSelling(item.id)}
                            className={`flex items-center gap-2 text-sm transition-colors ${
                              item.isSelling ? 'text-[#00d26a]' : 'text-gray-400'
                            }`}
                          >
                            {item.isSelling ? 'Selling' : 'Stopped'}
                            <span
                              className={`relative inline-flex w-11 h-6 rounded-full transition-colors duration-200 ${
                                item.isSelling ? 'bg-[#188bf4]' : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`absolute h-5 w-5 left-0.5 top-0.5 bg-white rounded-full shadow transition-transform duration-200 ${
                                  item.isSelling ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </span>
                          </button>
                          <div className="flex gap-2.5">
                            <button className="border border-gray-200 bg-transparent px-3 py-1.5 rounded text-xs text-gray-400 flex items-center gap-1.5">
                              <Settings size={12} /> Operate
                            </button>
                            <button className="border border-gray-200 bg-transparent px-3 py-1.5 rounded text-xs text-gray-400 flex items-center gap-1.5">
                              <FileText size={12} /> Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* FIX #2: Bottom sheet — fixed position, full height, safe z-index above bottom nav, proper overflow + bottom padding */}
          {sheetOpen && (
            <>
              <div
                className="fixed inset-0 bg-black/50 z-[500]"
                onClick={closeSheet}
              />
              <div
                className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-[501] flex flex-col rounded-t-[20px] bg-white"
                style={{ height: '80vh', maxHeight: '80vh' }}
              >
                <div className="shrink-0 px-4 py-4 text-center font-medium border-b border-gray-200 relative rounded-t-[20px]">
                  <ChevronLeft
                    size={20}
                    className="absolute left-4 top-4 text-gray-400 cursor-pointer"
                    onClick={closeSheet}
                  />
                  Link New UPI
                </div>
                <div className="shrink-0 px-4 py-4 flex justify-between text-gray-700 border-b border-gray-200 bg-[#fafafa] text-sm">
                  <span>Partner</span>
                  <span className="font-medium text-black">
                    select the kyc partner{' '}
                    <ChevronLeft size={10} className="inline -rotate-90 text-gray-300 ml-1" />
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-2.5 pb-8">
                  <div className="text-[10px] text-gray-300 mb-2.5">
                    Choose a link authorization partner
                  </div>
                  {PARTNERS.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => selectPartner(p)}
                      className={`flex items-center py-4 border-b border-gray-100 gap-3 ${
                        p.disabled ? 'opacity-60' : 'cursor-pointer active:bg-gray-50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded overflow-hidden bg-gray-200 shrink-0">
                        {p.img ? <img src={p.img} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><CreditCard size={20} className="text-gray-400" /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-[15px] mb-1 ${p.disabled ? 'text-gray-300' : 'text-gray-700'}`}>
                          {p.name}
                        </div>
                        <div className="text-[11px] text-gray-400 leading-tight">{p.desc}</div>
                      </div>
                      <button
                        className={`shrink-0 px-3.5 py-1.5 text-xs text-white rounded ${
                          p.disabled ? 'bg-[#c5d9f1] cursor-not-allowed' : 'bg-[#188bf4]'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Download
                      </button>
                      {p.disabled ? (
                        <X size={18} className="text-gray-300 shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-gray-300 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {phase === 'kyc' && selectedPartner && (
        <div className="flex flex-col h-full bg-white">
          <div className="px-4 py-4 text-base font-medium border-b border-gray-200 flex items-center gap-4">
            <ChevronLeft size={20} className="text-gray-400 cursor-pointer" onClick={() => setPhase('main')} />
            Link New UPI
          </div>
          <div className="px-5 py-4 bg-[#fafafa] flex justify-between text-sm text-gray-700 border-b border-gray-200">
            <span>Partner</span>
            <span className="font-medium">{selectedPartner.name}</span>
          </div>
          <div className="px-5 py-5">
            <div className="flex items-center py-4 border-b border-gray-200">
              <div className="w-20 text-sm text-gray-700">Name</div>
              <input
                type="text"
                value={kycName}
                onChange={(e) => setKycName(e.target.value)}
                placeholder="Enter your name"
                className="flex-1 border-none outline-none text-sm text-gray-700"
              />
            </div>
            {kycError && (
              <div className="text-rose-500 text-xs mt-2.5 text-center">
                Please enter a 10-digit mobile number.
              </div>
            )}
            <div className="flex items-center py-4 border-b border-gray-200">
              <div className="w-20 text-sm text-gray-700">UPI No</div>
              <input
                type="number"
                value={kycNumber}
                onChange={(e) => setKycNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Enter Phone No"
                className="flex-1 border-none outline-none text-sm text-gray-700"
              />
            </div>
            <div className="text-[#188bf4] text-xs text-center my-5">UPI list not loading? Tap to retry.</div>
            <button
              onClick={startVerification}
              className="w-full bg-[#188bf4] text-white border-none py-3.5 rounded-lg text-base font-medium mt-5"
            >
              Link Kyc
            </button>
          </div>
        </div>
      )}

      {/* FIX #3: OTP loading and UPI-input card — centered, proper auto-height, no clipping */}
      {(phase === 'processing' || phase === 'upi-input') && (
        <div className="fixed inset-0 bg-black/50 z-[600] flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="px-6 pt-6 pb-5 flex flex-col items-center text-center">
              {phase === 'processing' && (
                <div className="w-12 h-12 border-4 border-gray-200 border-t-[#188bf4] rounded-full animate-spin mb-5" />
              )}
              {phase === 'upi-input' && (
                <CheckCircle2 size={44} className="text-[#00d26a] mb-4" />
              )}
              <div className="text-base font-semibold text-gray-800 leading-snug">
                {processText}
              </div>
            </div>

            {phase === 'upi-input' && (
              <div className="px-6 pb-6 pt-1 border-t border-gray-100">
                <div className="text-[13px] text-gray-500 mb-2">Enter your UPI ID</div>
                <input
                  type="text"
                  value={finalUpi}
                  onChange={(e) => setFinalUpi(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl text-sm mb-4 outline-none focus:border-[#188bf4] transition-colors"
                />
                <button
                  onClick={saveUpi}
                  className="w-full bg-[#00d26a] hover:bg-[#00bb5e] text-white border-none py-3 rounded-xl text-sm font-semibold transition-colors"
                >
                  Save
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
