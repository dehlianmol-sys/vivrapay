import { useState, useRef } from 'react';
import { Plus, Trash2, X, Check, Upload } from 'lucide-react';
import { useStore } from '../../lib/store';
import { useToast } from '../../lib/toast';
import type { Banner } from '../../lib/types';
import SmartImage from '../../components/SmartImage';

export default function Banners() {
  const { banners, addBanner, deleteBanner, uploadImage } = useStore();
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const openAdd = () => {
    setPreviewUrl('');
    setSelectedFile(null);
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
    if (!selectedFile) {
      toast('Please select an image', 'error');
      return;
    }
    setSaving(true);
    try {
      const path = await uploadImage(selectedFile, 'banners');
      await addBanner(path);
      toast('Banner added', 'success');
      setShowForm(false);
    } catch {
      toast('Upload failed. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (b: Banner) => {
    if (deletingId) return;
    if (!confirm('Delete this banner?')) return;
    setDeletingId(b.id);
    try {
      await deleteBanner(b.id);
      toast('Banner deleted', 'info');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-slate-800">Promotional Banners</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          <Plus size={16} /> Add Banner
        </button>
      </div>

      {banners.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-slate-400 shadow-sm">
          No banners. Add one to show on the home carousel.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((b) => (
            <div key={b.id} className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
              <SmartImage
                path={b.url}
                alt="Banner"
                className="w-full h-32 rounded-lg overflow-hidden mb-2"
                imgClassName="w-full h-32 object-cover"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => remove(b)}
                  disabled={deletingId === b.id}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50 disabled:opacity-50"
                >
                  {deletingId === b.id
                    ? <span className="w-3 h-3 border-2 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
                    : <Trash2 size={12} />}
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Add Banner</h3>
              <button onClick={() => setShowForm(false)}>
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-slate-300 rounded-lg py-8 flex flex-col items-center gap-2 text-slate-500 hover:border-blue-400"
            >
              <Upload size={24} />
              <span className="text-sm">Click to select image</span>
            </button>
            {previewUrl && (
              <img src={previewUrl} alt="Preview" className="w-full h-32 object-cover rounded-lg mt-3 border border-slate-200" />
            )}
            <div className="flex gap-2 mt-4">
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
                {saving ? 'Uploading...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
