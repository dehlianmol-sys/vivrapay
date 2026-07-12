import { useState, useRef } from 'react';
import { Plus, Trash2, X, Check, Headphones, ExternalLink, Upload } from 'lucide-react';
import { useStore } from '../../lib/store';
import { useToast } from '../../lib/toast';
import SmartImage from '../../components/SmartImage';

export default function CustomerServiceAdmin() {
  const { customerServices, addCustomerService, deleteCustomerService, uploadImage } = useStore();
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [iconPath, setIconPath] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const openAdd = () => {
    setIconPath(''); setName(''); setDescription(''); setLinkUrl('');
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
    if (!name.trim() || !linkUrl.trim()) {
      toast('Name and URL are required', 'error');
      return;
    }
    setSaving(true);
    try {
      let finalIcon = iconPath;
      if (selectedFile) {
        finalIcon = await uploadImage(selectedFile, 'icons');
      }
      await addCustomerService({
        iconUrl: finalIcon,
        name: name.trim(),
        description: description.trim(),
        linkUrl: linkUrl.trim(),
      });
      toast('Customer service link added', 'success');
      setShowForm(false);
    } catch {
      toast('Upload failed. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (deletingId) return;
    if (!confirm('Delete this customer service link?')) return;
    setDeletingId(id);
    try {
      await deleteCustomerService(id);
      toast('Link deleted', 'info');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Headphones size={24} className="text-slate-700" />
          <h1 className="text-2xl font-semibold text-slate-800">Customer Service</h1>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          <Plus size={16} /> Add Link
        </button>
      </div>

      {customerServices.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-slate-400 shadow-sm">
          No customer service links. Add one to show on the user side.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {customerServices.map((cs) => (
            <div key={cs.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-start gap-3 mb-3">
                <SmartImage
                  path={cs.iconUrl}
                  alt={cs.name}
                  className="w-10 h-10 rounded-lg overflow-hidden shrink-0"
                  imgClassName="w-10 h-10 object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-800">{cs.name}</div>
                  <div className="text-xs text-slate-500 line-clamp-2">{cs.description}</div>
                </div>
              </div>
              <div className="text-xs text-slate-400 break-all mb-3">{cs.linkUrl}</div>
              <div className="flex gap-2">
                <a
                  href={cs.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  <ExternalLink size={12} /> Open
                </a>
                <button
                  onClick={() => remove(cs.id)}
                  disabled={deletingId === cs.id}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50 disabled:opacity-50"
                >
                  {deletingId === cs.id
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
              <h3 className="text-lg font-semibold text-slate-800">Add Customer Service</h3>
              <button onClick={() => setShowForm(false)}>
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-slate-600 block mb-1">Icon Image</label>
                <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-slate-300 rounded-lg py-4 flex flex-col items-center gap-1.5 text-slate-500 hover:border-blue-400"
                >
                  <Upload size={20} />
                  <span className="text-xs">Click to select icon image</span>
                </button>
                {previewUrl && (
                  <img src={previewUrl} alt="Icon Preview" className="w-10 h-10 rounded-lg object-cover mt-2 border border-slate-200" />
                )}
              </div>
              <div>
                <label className="text-sm text-slate-600 block mb-1">Name *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. WhatsApp Support"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-slate-600 block mb-1">Description</label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-slate-600 block mb-1">Link URL *</label>
                <input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://wa.me/..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500"
                />
              </div>
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
