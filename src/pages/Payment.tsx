import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Download, Upload, X } from 'lucide-react';
import { useStore } from '../lib/store';
import { useToast } from '../lib/toast';
import { compressImage, fileToObjectUrl, getPublicUrl } from '../lib/storage';
import { supabase } from '../lib/supabase';
import SmartImage from '../components/SmartImage';

function fmt(ms: number) {
  if (ms < 0) ms = 0;
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${pad(h)} : ${pad(m)} : ${pad(s)}`;
}

export default function Payment() {
  const { deposits, currentUser, cancelDeposit, submitDepositProof } = useStore();
  const toast = useToast();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [canceling, setCanceling] = useState(false);

  const activeDeposit = useMemo(
    () => deposits.find((d) => d.id === currentUser?.lockedDepositId) ?? null,
    [deposits, currentUser?.lockedDepositId],
  );

  const [remaining, setRemaining] = useState(0);
  const [utr, setUtr] = useState('');
  const [receipt, setReceipt] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptName, setReceiptName] = useState('');

  useEffect(() => {
    if (!activeDeposit) return;
    setRemaining(new Date(activeDeposit.expiresAt).getTime() - Date.now());
    const t = setInterval(() => {
      setRemaining(new Date(activeDeposit.expiresAt).getTime() - Date.now());
    }, 1000);
    return () => clearInterval(t);
  }, [activeDeposit]);

  if (!activeDeposit) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white px-6 text-center">
        <p className="text-gray-600 mb-4">No active deposit order.</p>
        <button
          onClick={() => navigate('/deposit')}
          className="bg-[#2b7deb] text-white px-6 py-2.5 rounded-lg"
        >
          Browse Packages
        </button>
      </div>
    );
  }

  const pm = activeDeposit.paymentMethod!;

  const copyUpi = () => {
    navigator.clipboard.writeText(pm.upiId).then(() => toast('UPI ID Copied!', 'success'));
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast('Please select an image file', 'error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast('Image must be under 10MB', 'error');
      return;
    }
    setReceipt(fileToObjectUrl(file));
    setReceiptName(file.name);
    setReceiptFile(file);
  };

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      let receiptPath: string | null = null;
      if (receiptFile) {
        try {
          const compressed = await compressImage(receiptFile);
          const ext = compressed.name.split('.').pop()?.toLowerCase() || 'jpg';
          const path = `receipts/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
          const { error: upErr } = await supabase.storage.from('uploads').upload(path, compressed, { cacheControl: '3600' });
          if (upErr) throw new Error(upErr.message);
          receiptPath = path;
        } catch {
          toast('Failed to upload receipt. Please try again.', 'error');
          return;
        }
      }
      const res = await submitDepositProof(activeDeposit.id, utr.trim(), receiptPath);
      if (!res.ok) {
        toast(res.message, 'error');
        return;
      }
      toast(res.message, 'success');
      navigate('/deposit');
    } finally {
      setSubmitting(false);
    }
  };

  const cancel = async () => {
    if (canceling) return;
    setCanceling(true);
    try {
      await cancelDeposit(activeDeposit.id);
      toast('Order cancelled', 'info');
      navigate('/deposit');
    } finally {
      setCanceling(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white max-w-[480px] mx-auto">
      <header className="flex items-center px-4 py-4 border-b border-gray-200">
        <button onClick={cancel} className="mr-3 text-gray-500">
          <ArrowLeft size={22} />
        </button>
        <span className="text-base font-medium text-gray-700">
          Buy Itoken ({pm.name})
        </span>
      </header>

      <div className="bg-[#fff0f0] text-rose-600 px-4 py-2.5 text-[13px] text-center">
        <span className="font-mono">{fmt(remaining)}</span> Please pay in time
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-5 text-center">
        <div className="text-rose-600 text-[13px] font-medium">
          Please use the selected UPI to pay
        </div>

        <div className="my-4 relative z-10">
          <SmartImage
            path={pm.qr}
            alt="UPI QR Code"
            className="w-[180px] h-[180px] border border-gray-200 p-1.5 mx-auto rounded-lg overflow-hidden"
            imgClassName="w-[180px] h-[180px] object-contain"
          />
          <a
            href={getPublicUrl(pm.qr)}
            download="UPI_QR_Code.jpg"
            className="inline-flex items-center gap-1 mt-2 px-3.5 py-1.5 text-xs text-[#4a8df4] border border-[#4a8df4] rounded-md no-underline"
          >
            <Download size={12} /> Download QR Code
          </a>
        </div>

        <div className="bg-[#f9f9f9] p-3 rounded-lg text-left mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[13px] text-gray-500">UPI Name</span>
            <span className="text-[13px] font-medium text-gray-700 uppercase">{pm.name}</span>
          </div>
          <div className="flex justify-between items-center mb-2 gap-2">
            <span className="text-[13px] text-gray-500 shrink-0">UPI ID</span>
            <span className="text-[13px] font-medium text-gray-700 break-all text-right flex-1">
              {pm.upiId}
            </span>
            <button
              onClick={copyUpi}
              className="px-2 py-1 text-[11px] text-white bg-[#4a8df4] border-none rounded cursor-pointer shrink-0"
            >
              <Copy size={11} className="inline" /> Copy
            </button>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[13px] text-gray-500">Amount</span>
            <span className="text-[13px] font-bold text-rose-600">₹ {activeDeposit.amount}</span>
          </div>
        </div>

        <div className="text-rose-600 text-[11px] text-left mt-4 leading-relaxed">
          Notice: The remittance amount must be consistent, otherwise the transaction will not be
          completed.
          <br />
          Notice: If you have already paid, please wait patiently for review, do not cancel the order.
        </div>

        <div className="mt-6 text-left">
          <label className="text-sm text-gray-700 block mb-1.5">12-digit UTR Number</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={12}
            value={utr}
            onChange={(e) => setUtr(e.target.value.replace(/\D/g, ''))}
            placeholder="Enter 12-digit UTR"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#4a8df4]"
          />
        </div>

        <div className="mt-4 text-left">
          <label className="text-sm text-gray-700 block mb-1.5">Upload Payment Receipt</label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={onFile}
            className="hidden"
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg py-5 flex flex-col items-center gap-1.5 text-gray-500"
          >
            <Upload size={20} />
            <span className="text-xs">{receiptName || 'Tap to upload screenshot'}</span>
          </button>
          {receipt && (
            <div className="mt-2 relative">
              <SmartImage
                path={receipt}
                alt="Receipt"
                className="w-full rounded-lg overflow-hidden border border-gray-200"
                imgClassName="w-full max-h-40 object-contain"
              />
              <button
                onClick={() => { setReceipt(null); setReceiptName(''); setReceiptFile(null); }}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex px-4 py-3.5 gap-2.5 border-t border-gray-200 fixed bottom-[70px] left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white z-[100]">
        <button
          onClick={cancel}
          disabled={canceling || submitting}
          className="flex-1 py-3 border border-gray-200 rounded-md text-gray-500 text-sm disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {canceling && <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />}
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={submitting || canceling}
          className="flex-1 py-3 bg-[#4a8df4] text-white rounded-md text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting && <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />}
          {submitting ? 'Submitting...' : 'Submit Proof'}
        </button>
      </div>
      <div className="h-[70px]" />
    </div>
  );
}
