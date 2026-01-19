'use client';

import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Eye, EyeOff, Loader2, Plus, Power } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Promotion {
  id: number;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const res = await fetch('/api/promotions');
      if (res.ok) {
        const data = await res.json();
        setPromotions(data);
      }
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size too large (max 5MB)');
      return;
    }

    setUploading(true);
    
    // 1. Convert to base64
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = async () => {
      try {
        const base64 = reader.result;
        
        // 2. Upload to Cloudinary
        const uploadRes = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64 }),
        });

        if (!uploadRes.ok) throw new Error('Upload failed');
        const { url } = await uploadRes.json();

        // 3. Create Promotion
        const createRes = await fetch('/api/promotions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: url }),
        });

        if (createRes.ok) {
          fetchPromotions();
        } else {
          throw new Error('Failed to create promotion');
        }
      } catch (error) {
        console.error('Error uploading:', error);
        alert('Failed to upload image. Please try again.');
      } finally {
        setUploading(false);
      }
    };

    reader.onerror = () => {
      console.error('File reading error');
      alert('Error reading file');
      setUploading(false);
    };
  };

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    setTogglingId(id);
    try {
      const res = await fetch(`/api/promotions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.ok) {
        setPromotions(promotions.map(p => 
          p.id === id ? { ...p, isActive: !currentStatus } : p
        ));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setTogglingId(null);
    }
  };

  const deletePromotion = async (id: number) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return;

    try {
      const res = await fetch(`/api/promotions/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setPromotions(promotions.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Error deleting promotion:', error);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Promotions & Offers</h1>
          <p className="text-slate-500 mt-1">Manage homepage popup promotions</p>
        </div>
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="promo-upload"
            disabled={uploading}
          />
          <label
            htmlFor="promo-upload"
            className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>{uploading ? 'Uploading...' : 'Add New Promotion'}</span>
          </label>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : promotions.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900">No promotions yet</h3>
          <p className="text-slate-500">Upload an image to create a new promotion</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promo) => (
            <div key={promo.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-video relative bg-slate-100">
                <img
                  src={promo.imageUrl}
                  alt="Promotion"
                  className="w-full h-full object-cover"
                />
                <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${promo.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                  {promo.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
              
              <div className="p-4 flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  {new Date(promo.createdAt).toLocaleDateString()}
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleStatus(promo.id, promo.isActive)}
                    disabled={togglingId === promo.id}
                    className={`p-2 rounded-full transition-all duration-200 border ${
                      promo.isActive 
                        ? 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100 shadow-[0_0_10px_rgba(22,163,74,0.3)]' 
                        : 'text-slate-400 bg-slate-50 border-slate-200 hover:text-green-600 hover:bg-green-50 hover:border-green-200'
                    } ${togglingId === promo.id ? 'opacity-75 cursor-not-allowed' : ''}`}
                    title={promo.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {togglingId === promo.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Power className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => deletePromotion(promo.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Megaphone(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 11 18-5v12L3 14v-3z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  );
}
