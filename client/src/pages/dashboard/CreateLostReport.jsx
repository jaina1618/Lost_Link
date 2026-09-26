import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { lostApi } from '../../api';
import { CATEGORIES, COLORS } from '../../utils';
import toast from 'react-hot-toast';
import { Upload, X, MapPin, Lock } from 'lucide-react';

export default function CreateLostReport() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [form, setForm] = useState({
    itemName: '', category: '', subcategory: '', description: '', brand: '',
    color: '', distinguishingFeatures: '', privateDetails: '', dateLost: '',
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
    if (!form.itemName || !form.category || !form.description || !form.dateLost || !form.locationAddress)
      return toast.error('Please fill all required fields.');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append('image', image);
      await lostApi.create(fd);
      toast.success('Lost item report created! Matching engine is running...');
      navigate('/dashboard/reports');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create report.');
    }
    setLoading(false);
  };

  const InputField = ({ label, name, required, ...props }) => (
    <div>
      <label className="input-label">{label} {required && <span className="text-rose-400">*</span>}</label>
      <input className="input" name={name} value={form[name]} onChange={e => setForm({...form, [name]: e.target.value})} {...props} />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="section-title">🔍 Report Lost Item</h1>
        <p className="section-subtitle">The more details you provide, the better your match score will be</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-white">Basic Information</h2>
          <InputField label="Item Name" name="itemName" placeholder="e.g. Black Wildcraft Wallet" required />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Category <span className="text-rose-400">*</span></label>
              <select className="input" value={form.category} onChange={e => setForm({...form, category: e.target.value})} required>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <InputField label="Subcategory" name="subcategory" placeholder="e.g. Bi-fold wallet" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Brand" name="brand" placeholder="e.g. Wildcraft" />
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
            <textarea className="input min-h-[100px] resize-none" placeholder="Describe the item in detail..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
          </div>
          <div>
            <label className="input-label">Distinguishing Features</label>
            <input className="input" placeholder="e.g. scratch on corner, custom sticker" value={form.distinguishingFeatures} onChange={e => setForm({...form, distinguishingFeatures: e.target.value})} />
          </div>
        </div>

        {/* Private Verification */}
        <div className="card p-6 space-y-3 border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center gap-2">
            <Lock size={18} className="text-amber-400" />
            <h2 className="font-semibold text-white">Private Ownership Details</h2>
          </div>
          <p className="text-xs text-amber-300/80 leading-relaxed">
            This field is <strong>never shown publicly</strong>. It is only shown to you and, during a claim, compared against the claimant's answer. Describe something only the real owner would know (e.g. "My initials J.R. are written inside in blue pen").
          </p>
          <textarea className="input min-h-[80px] resize-none border-amber-500/30 focus:ring-amber-500/50 focus:border-amber-500"
            placeholder="Secret identifying detail only you know..."
            value={form.privateDetails} onChange={e => setForm({...form, privateDetails: e.target.value})} />
        </div>

        {/* Date & Location */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-white flex items-center gap-2"><MapPin size={16} className="text-rose-400" /> When & Where</h2>
          <InputField label="Date Lost" name="dateLost" type="date" required max={new Date().toISOString().split('T')[0]} />
          <InputField label="Address / Landmark" name="locationAddress" placeholder="e.g. Near the college library, Main Gate" required />
          <div className="grid grid-cols-2 gap-4">
            <InputField label="City" name="locationCity" placeholder="e.g. Bangalore" />
            <InputField label="State" name="locationState" placeholder="e.g. Karnataka" />
          </div>
        </div>

        {/* Image Upload */}
        <div className="card p-6 space-y-3">
          <h2 className="font-semibold text-white">Item Photo</h2>
          <p className="text-xs text-surface-muted">Upload a clear photo of the item. Max 5MB.</p>
          {imagePreview ? (
            <div className="relative">
              <img src={imagePreview} alt="Preview" className="w-full rounded-xl object-cover max-h-60" />
              <button type="button" onClick={() => { setImage(null); setImagePreview(null); }}
                className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center hover:bg-rose-600 transition-colors">
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-surface-border rounded-xl p-8 text-center cursor-pointer hover:border-primary-500 transition-colors block">
              <Upload size={24} className="mx-auto text-surface-muted mb-2" />
              <p className="text-sm text-surface-muted">Click to upload or drag & drop</p>
              <p className="text-xs text-surface-muted mt-1">JPEG, PNG, WebP (max 5MB)</p>
              <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
            </label>
          )}
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? 'Creating Report...' : '🔍 Create Lost Report'}
          </button>
        </div>
      </form>
    </div>
  );
}
