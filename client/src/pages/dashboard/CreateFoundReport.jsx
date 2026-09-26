import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { foundApi } from '../../api';
import { CATEGORIES, COLORS } from '../../utils';
import toast from 'react-hot-toast';
import { Upload, X, MapPin } from 'lucide-react';

export default function CreateFoundReport() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [form, setForm] = useState({
    itemName: '', category: '', subcategory: '', description: '', brand: '',
    color: '', distinguishingFeatures: '', dateFound: '',
    locationAddress: '', locationCity: '', locationState: '',
  });

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be under 5MB.');
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.itemName || !form.category || !form.description || !form.dateFound || !form.locationAddress)
      return toast.error('Please fill all required fields.');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append('image', image);
      await foundApi.create(fd);
      toast.success('Found item report created! Matching engine is searching for the owner...');
      navigate('/dashboard/reports');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create report.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="section-title">📦 Report Found Item</h1>
        <p className="section-subtitle">Help us find the owner of this item</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-white">Item Details</h2>
          <div>
            <label className="input-label">Item Name <span className="text-rose-400">*</span></label>
            <input className="input" placeholder="e.g. Black Wildcraft Wallet" value={form.itemName} onChange={e => setForm({...form, itemName: e.target.value})} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Category <span className="text-rose-400">*</span></label>
              <select className="input" value={form.category} onChange={e => setForm({...form, category: e.target.value})} required>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Subcategory</label>
              <input className="input" placeholder="e.g. Bi-fold wallet" value={form.subcategory} onChange={e => setForm({...form, subcategory: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Brand</label>
              <input className="input" placeholder="Brand name" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} />
            </div>
            <div>
              <label className="input-label">Color</label>
              <select className="input" value={form.color} onChange={e => setForm({...form, color: e.target.value})}>
                <option value="">Select color</option>
                {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="input-label">Description <span className="text-rose-400">*</span></label>
            <textarea className="input min-h-[100px] resize-none" placeholder="Describe what you found in detail..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
          </div>
          <div>
            <label className="input-label">Distinguishing Features</label>
            <input className="input" placeholder="Any notable marks, stickers, damage..." value={form.distinguishingFeatures} onChange={e => setForm({...form, distinguishingFeatures: e.target.value})} />
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-white flex items-center gap-2"><MapPin size={16} className="text-emerald-400" /> When & Where Found</h2>
          <div>
            <label className="input-label">Date Found <span className="text-rose-400">*</span></label>
            <input className="input" type="date" value={form.dateFound} onChange={e => setForm({...form, dateFound: e.target.value})} required max={new Date().toISOString().split('T')[0]} />
          </div>
          <div>
            <label className="input-label">Address / Landmark <span className="text-rose-400">*</span></label>
            <input className="input" placeholder="Where did you find it?" value={form.locationAddress} onChange={e => setForm({...form, locationAddress: e.target.value})} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">City</label>
              <input className="input" placeholder="City" value={form.locationCity} onChange={e => setForm({...form, locationCity: e.target.value})} />
            </div>
            <div>
              <label className="input-label">State</label>
              <input className="input" placeholder="State" value={form.locationState} onChange={e => setForm({...form, locationState: e.target.value})} />
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-3">
          <h2 className="font-semibold text-white">Photo</h2>
          {imagePreview ? (
            <div className="relative">
              <img src={imagePreview} alt="Preview" className="w-full rounded-xl object-cover max-h-60" />
              <button type="button" onClick={() => { setImage(null); setImagePreview(null); }}
                className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center hover:bg-rose-600 transition-colors">
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-surface-border rounded-xl p-8 text-center cursor-pointer hover:border-accent transition-colors block">
              <Upload size={24} className="mx-auto text-surface-muted mb-2" />
              <p className="text-sm text-surface-muted">Click to upload</p>
              <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
            </label>
          )}
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-accent flex-1">
            {loading ? 'Creating Report...' : '📦 Create Found Report'}
          </button>
        </div>
      </form>
    </div>
  );
}
