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
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-white px-6 text-center">
        <p className="text-gray-600 mb-4">No active deposit order.</p>
        <button
          onClick={() => navigate('/deposit')}
          className="bg-[#62007a] text-white px-6 py-2.5 rounded-lg"
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

  const downloadQr = async () => {
    const url = getPublicUrl(pm.qr);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('fetch failed');
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `UPI_QR_${pm.name.replace(/\s+/g, '_')}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 4000);
      toast('QR code saved to your device', 'success');
    } catch {
      toast('Could not download the QR code', 'error');
    }
  };

  const goPay = () => {
    const uri = `upi://pay?pa=${encodeURIComponent(pm.upiId)}&pn=${encodeURIComponent(pm.name)}&am=${encodeURIComponent(
      String(activeDeposit.amount),
    )}&cu=INR`;
    window.location.href = uri;
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#f6f7fb] max-w-[480px] mx-auto">
      <header className="flex items-center gap-3 px-4 py-4 bg-white border-b border-gray-100">
        <button onClick={cancel} className="text-gray-500 shrink-0">
          <ArrowLeft size={22} />
        </button>
        <span className="min-w-0 truncate text-base font-semibold text-gray-800">
          Order · {pm.name}
        </span>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-4 pb-6">
        <div className="rounded-2xl bg-gradient-to-br from-[#62007a] to-[#9c27b0] px-5 py-6 text-center text-white shadow-lg">
          <div className="text-[13px] opacity-80">Amount to pay</div>
          <div className="mt-1 text-[34px] font-extrabold leading-none">
            ₹{Number(activeDeposit.amount).toFixed(2)}
          </div>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[12px]">
            Expires in <span className="font-mono font-semibold">{fmt(remaining)}</span>
          </div>
        </div>

        <button
          onClick={goPay}
          className="mt-4 w-full rounded-2xl bg-[#00a862] py-4 text-base font-bold text-white shadow-md active:scale-[.99] transition-transform"
        >
          Pay Now with UPI App
        </button>

        <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex flex-col items-center">
            <SmartImage
              path={pm.qr}
              alt="UPI QR Code"
              className="w-[190px] h-[190px] border border-gray-100 p-1.5 rounded-xl overflow-hidden"
              imgClassName="w-[190px] h-[190px] object-contain"
            />
            <button
              onClick={downloadQr}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-[#62007a] px-3.5 py-1.5 text-xs font-medium text-[#62007a]"
            >
              <Download size={13} /> Download QR
            </button>
          </div>

          <div className="mt-4 divide-y divide-gray-100 text-left">
            <div className="flex items-center justify-between gap-3 py-2.5">
              <span className="text-[13px] text-gray-500">Payee Name</span>
              <span className="text-[13px] font-semibold text-gray-800 uppercase">{pm.name}</span>
            </div>
            <div className="flex items-center justify-between gap-2 py-2.5">
              <span className="shrink-0 text-[13px] text-gray-500">Payout UPI</span>
              <span className="min-w-0 flex-1 break-all text-right text-[13px] font-semibold text-gray-800">
                {pm.upiId}
              </span>
              <button
                onClick={copyUpi}
                className="shrink-0 rounded-md border border-gray-200 px-2 py-1 text-[11px] text-gray-600"
              >
                <Copy size={11} className="inline" /> Copy
              </button>
            </div>
            <div className="flex items-center justify-between gap-3 py-2.5">
              <span className="text-[13px] text-gray-500">Status</span>
              <span className="text-[13px] font-semibold text-amber-600">{activeDeposit.status}</span>
            </div>
            <div className="flex items-center justify-between gap-3 py-2.5">
              <span className="shrink-0 text-[13px] text-gray-500">Order No</span>
              <span className="min-w-0 break-all text-right text-[12px] text-gray-600">{activeDeposit.id}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm text-left">
        <div className="text-rose-600 text-[11px] text-left leading-relaxed">
          Notice: The remittance amount must be consistent, otherwise the transaction will not be
          completed.
          <br />
          Notice: If you have already paid, please wait patiently for review, do not cancel the order.
        </div>

        <div className="mt-5 text-left">
          <label className="text-sm text-gray-700 block mb-1.5">12-digit UTR Number</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={12}
            value={utr}
            onChange={(e) => setUtr(e.target.value.replace(/\D/g, ''))}
            placeholder="Enter 12-digit UTR"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#62007a]"
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
      </div>

      <div className="flex px-4 py-3.5 gap-2.5 border-t border-gray-200 shrink-0 w-full bg-white pb-[calc(env(safe-area-inset-bottom)+14px)]">
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
          className="flex-1 py-3 bg-[#62007a] text-white rounded-md text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting && <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />}
          {submitting ? 'Submitting...' : 'Submit Proof'}
        </button>
      </div>
    </div>
  );
}
