import { useState, useRef } from 'react';
import { Plus, Trash2, Pencil, X, Check, Upload } from 'lucide-react';
import { useStore } from '../../lib/store';
import { useToast } from '../../lib/toast';
import type { PaymentGateway } from '../../lib/types';
import SmartImage from '../../components/SmartImage';

export default function Gateways() {
  const { gateways, addGateway, updateGateway, deleteGateway, uploadImage } = useStore();
  const toast = useToast();
  const [editing, setEditing] = useState<PaymentGateway | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [qrPath, setQrPath] = useState('');
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const openAdd = () => {
    setEditing(null);
    setName(''); setUpiId(''); setQrPath(''); setActive(true);
    setPreviewUrl(''); setSelectedFile(null);
    setShowForm(true);
  };

  const openEdit = (g: PaymentGateway) => {
    setEditing(g);
    setName(g.name); setUpiId(g.upiId); setQrPath(g.qr); setActive(g.active);
    setPreviewUrl(''); setSelectedFile(null);
    setShowForm(true);
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast('Please select an image file', 'error');
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const save = async () => {
    if (saving) return;
    if (!name.trim() || !upiId.trim()) {
      toast('Name and UPI ID are required', 'error');
      return;
    }
    if (!editing && !selectedFile && !qrPath) {
      toast('QR image is required', 'error');
      return;
    }
    setSaving(true);
    try {
      let finalQr = qrPath;
      if (selectedFile) {
        finalQr = await uploadImage(selectedFile, 'gateways');
      }
      if (editing) {
        await updateGateway(editing.id, { name: name.trim(), upiId: upiId.trim(), qr: finalQr, active });
        toast('Gateway updated', 'success');
      } else {
        await addGateway({ name: name.trim(), upiId: upiId.trim(), qr: finalQr, active });
        toast('Gateway added', 'success');
      }
      setShowForm(false);
    } catch {
      toast('Upload failed. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (g: PaymentGateway) => {
    if (deletingId) return;
    if (!confirm(`Delete gateway "${g.name}"?`)) return;
    setDeletingId(g.id);
    try {
      await deleteGateway(g.id);
      toast('Gateway deleted', 'info');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-slate-800">Payment Gateways</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          <Plus size={16} /> Add Gateway
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {gateways.map((g) => (
          <div key={g.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-medium text-slate-800">{g.name}</div>
                <div className="text-xs text-slate-500">{g.active ? 'Active' : 'Inactive'}</div>
              </div>
              <span className={`px-2 py-0.5 text-xs rounded-full ${g.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {g.active ? 'Live' : 'Off'}
              </span>
            </div>
            <SmartImage
              path={g.qr}
              alt={`${g.name} QR`}
              className="w-full h-32 rounded-lg overflow-hidden border border-slate-100 mb-2"
              imgClassName="w-full h-32 object-contain"
            />
            <div className="text-xs text-slate-600 break-all mb-3">{g.upiId}</div>
            <div className="flex gap-2">
              <button
                onClick={() => openEdit(g)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                <Pencil size={12} /> Edit
              </button>
              <button
                onClick={() => remove(g)}
                disabled={deletingId === g.id}
                className="flex items-center gap-1 px-3 py-1.5 text-xs text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50 disabled:opacity-50"
              >
                {deletingId === g.id
                  ? <span className="w-3 h-3 border-2 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
                  : <Trash2 size={12} />}
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                {editing ? 'Edit Gateway' : 'Add Gateway'}
              </h3>
              <button onClick={() => setShowForm(false)}>
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-slate-600 block mb-1">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. phonepe"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-slate-600 block mb-1">UPI ID</label>
                <input
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. merchant@okaxis"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-slate-600 block mb-1">QR Code Image</label>
                <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-slate-300 rounded-lg py-4 flex flex-col items-center gap-1.5 text-slate-500 hover:border-blue-400"
                >
                  <Upload size={20} />
                  <span className="text-xs">
                    {selectedFile ? 'Change image' : editing ? 'Upload new QR (optional)' : 'Select QR image'}
                  </span>
                </button>
                {previewUrl ? (
                  <img src={previewUrl} alt="QR Preview" className="w-full h-32 object-contain rounded-lg mt-2 border border-slate-200" />
                ) : editing && qrPath ? (
                  <SmartImage
                    path={qrPath}
                    alt="Current QR"
                    className="w-full h-32 rounded-lg overflow-hidden border border-slate-200 mt-2"
                    imgClassName="w-full h-32 object-contain"
                  />
                ) : null}
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 accent-blue-600"
                />
                Active
              </label>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm flex items-center justify-center gap-1 disabled:opacity-50"
              >
                {saving
                  ? <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  : <Check size={16} />}
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
