'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, X, Plus, FileText, Image as ImageIcon, Building2, School, Bus, ShoppingCart, Hospital, Coffee } from 'lucide-react';
import { Button, Input, Card, Badge } from '@/components/UIComponents';

export default function PostPropertyPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [formData, setFormData] = useState({
    title: '', description: '', price: '', area: '', location: '', address: '', type: 'Residential',
    listingType: 'Sell',
    propertySubtype: '',
    bedrooms: '', bathrooms: '', possessionDate: '', reraId: '',
    projectUnits: '', projectArea: '', configurations: '',
    avgPrice: '', launchDate: '', sizes: '', projectSize: '', areaUnit: 'sq.ft.',
    mapLink: '',
    amenities: [] as string[],
    images: [] as string[],
    highlights: [] as string[],
    specifications: [] as { label: string; value: string }[],
    attachments: [] as { name: string; url: string; size: string }[],
    nearbyLocations: [] as { name: string; type: string; distance: string; time: string }[]
  });

  const [newAmenity, setNewAmenity] = useState('');
  const [newHighlight, setNewHighlight] = useState('');
  const [newSpec, setNewSpec] = useState({ label: '', value: '' });
  const [newAttachment, setNewAttachment] = useState({ name: '', url: '', size: '' });
  const [newNearby, setNewNearby] = useState({ name: '', type: 'School', distance: '', time: '' });

  const nearbyTypes = [
    { label: 'School', icon: <School size={16} className="text-purple-600" /> },
    { label: 'Bus Stand', icon: <Bus size={16} className="text-orange-600" /> },
    { label: 'Shopping', icon: <ShoppingCart size={16} className="text-blue-600" /> },
    { label: 'Hospital', icon: <Hospital size={16} className="text-red-600" /> },
    { label: 'Coffee', icon: <Coffee size={16} className="text-amber-600" /> }
  ];

  const residentialSubtypes = [
    'Apartments / Flats',
    'Independent Houses',
    'Villas',
    'Bungalows',
    'Row Houses',
    'Residential Plots'
  ];

  const commercialSubtypes = [
    'Office Spaces',
    'IT Parks & Tech Hubs',
    'Shops & Showrooms',
    'Shopping Complexes & Malls',
    'Co-working Spaces',
    'Business Centers',
    'Hotels & Resorts',
    'Restaurants & Cafés',
    'Warehouses & Godowns',
    'Industrial Sheds',
    'Logistics Parks',
    'Hospitals & Clinics',
    'Educational Institutes',
    'Banks & Financial Offices'
  ];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    try {
      const uploadPromises = Array.from(files).map((file: File) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = async () => {
            try {
              const base64 = reader.result as string;
              const response = await fetch('/api/upload-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: base64 })
              });
              const data = await response.json();
              if (data.success) {
                resolve(data.url);
              } else {
                reject('Upload failed');
              }
            } catch (err) {
              reject(err);
            }
          };
          reader.readAsDataURL(file);
        });
      });

      const urls = await Promise.all(uploadPromises);
      setFormData(prev => ({ ...prev, images: [...prev.images, ...urls] }));
    } catch (err) {
      alert('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        alert('Property submitted for approval!');
        router.push('/dashboard');
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to submit property');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/dashboard')} 
              className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Post New Property</h1>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Submit details for admin approval</p>
            </div>
          </div>
          <Button onClick={handleSubmit} isLoading={isSubmitting} className="gap-2">
            <Building2 size={16} /> Submit Property
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-200 mb-6 overflow-x-auto no-scrollbar">
          {['basic', 'details', 'amenities', 'images', 'location', 'attachments'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === tab ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'basic' && (
          <Card className="p-6">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-6">Basic Information</h3>
            <div className="space-y-4">
              <Input 
                label="Property Title" 
                placeholder="e.g. Sky Towers" 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                required 
              />
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Price" 
                  placeholder="e.g. ₹4.5 Cr onwards" 
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                />
                <Input 
                  label="Area" 
                  placeholder="e.g. 1850 sq.ft" 
                  value={formData.area}
                  onChange={e => setFormData({...formData, area: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Location" 
                  placeholder="e.g. Worli, Mumbai" 
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                />
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Type</label>
                  <select 
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    value={formData.type}
                    onChange={e => {
                      setFormData({...formData, type: e.target.value, propertySubtype: ''});
                    }}
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Plot">Plot</option>
                  </select>
                </div>
              </div>

              {(formData.type === 'Residential' || formData.type === 'Commercial') && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Property Sub-Type</label>
                  <select 
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    value={formData.propertySubtype}
                    onChange={e => setFormData({...formData, propertySubtype: e.target.value})}
                  >
                    <option value="">Select Sub-Type (Optional)</option>
                    {(formData.type === 'Residential' ? residentialSubtypes : commercialSubtypes).map(subtype => (
                      <option key={subtype} value={subtype}>{subtype}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Property For</label>
                  <select 
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    value={formData.listingType}
                    onChange={e => setFormData({...formData, listingType: e.target.value})}
                  >
                    <option value="Sell">Sell</option>
                    <option value="Rent">Rent</option>
                    <option value="Lease">Lease</option>
                  </select>
                </div>
              </div>
              <Input 
                label="Full Address" 
                placeholder="Plot No. 45, Hill Road, Worli, Mumbai - 400018" 
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
              />

              {formData.type === 'Residential' && (
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Bedrooms" 
                    type="number" 
                    placeholder="3" 
                    value={formData.bedrooms}
                    onChange={e => setFormData({...formData, bedrooms: e.target.value})}
                  />
                  <Input 
                    label="Bathrooms" 
                    type="number" 
                    placeholder="3" 
                    value={formData.bathrooms}
                    onChange={e => setFormData({...formData, bathrooms: e.target.value})}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Possession Date" 
                  placeholder="e.g. Dec 2025" 
                  value={formData.possessionDate}
                  onChange={e => setFormData({...formData, possessionDate: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</label>
                <textarea 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs min-h-[120px]"
                  placeholder="Premium residential project offering luxurious apartments..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'details' && (
          <Card className="p-6">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-6">Project Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Project Units" type="number" placeholder="203" value={formData.projectUnits} onChange={e => setFormData({...formData, projectUnits: e.target.value})} />
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Area Unit</label>
                <select 
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  value={formData.areaUnit}
                  onChange={e => setFormData({...formData, areaUnit: e.target.value})}
                >
                  <option value="sq.ft.">sq.ft.</option>
                  <option value="sq.yd.">sq.yd.</option>
                  <option value="Acres">Acres</option>
                  <option value="Hectares">Hectares</option>
                </select>
              </div>
              <Input label="Project Area" placeholder="2.08 Acres" value={formData.projectArea} onChange={e => setFormData({...formData, projectArea: e.target.value})} />
              <Input label="Sizes" placeholder="1664 - 3983 sq.ft." value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} />
              <Input label="Project Size" placeholder="1 Building - 203 units" value={formData.projectSize} onChange={e => setFormData({...formData, projectSize: e.target.value})} />
              <Input label="Launch Date" placeholder="Apr, 2025" value={formData.launchDate} onChange={e => setFormData({...formData, launchDate: e.target.value})} />
              <Input label="Avg. Price" placeholder="7.4 K/sq.ft" value={formData.avgPrice} onChange={e => setFormData({...formData, avgPrice: e.target.value})} />
              <Input label="Possession Date" placeholder="Apr, 2028" value={formData.possessionDate} onChange={e => setFormData({...formData, possessionDate: e.target.value})} />
              <Input label="Configurations" placeholder="3, 4 BHK Apartments" value={formData.configurations} onChange={e => setFormData({...formData, configurations: e.target.value})} />
              <Input label="RERA ID" placeholder="P02400009392" value={formData.reraId} onChange={e => setFormData({...formData, reraId: e.target.value})} />
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-black text-slate-900 uppercase mb-3">Highlights</h4>
              <div className="flex gap-2 mb-3">
                <Input 
                  placeholder="e.g. Sea-facing" 
                  value={newHighlight}
                  onChange={e => setNewHighlight(e.target.value)}
                />
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (newHighlight) {
                      setFormData(prev => ({ ...prev, highlights: [...prev.highlights, newHighlight] }));
                      setNewHighlight('');
                    }
                  }}
                >
                  <Plus size={16} />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.highlights.map((h, i) => (
                  <Badge key={i} variant="info" className="gap-2">
                    {h}
                    <button onClick={() => setFormData(prev => ({ ...prev, highlights: prev.highlights.filter((_, idx) => idx !== i) }))}>
                      <X size={12} />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-black text-slate-900 uppercase mb-3">Specifications</h4>
              <div className="flex gap-2 mb-3">
                <Input 
                  placeholder="Label (e.g. Flooring)" 
                  value={newSpec.label}
                  onChange={e => setNewSpec({...newSpec, label: e.target.value})}
                />
                <Input 
                  placeholder="Value (e.g. Vitrified Tiles)" 
                  value={newSpec.value}
                  onChange={e => setNewSpec({...newSpec, value: e.target.value})}
                />
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (newSpec.label && newSpec.value) {
                      setFormData(prev => ({ ...prev, specifications: [...prev.specifications, newSpec] }));
                      setNewSpec({ label: '', value: '' });
                    }
                  }}
                >
                  <Plus size={16} />
                </Button>
              </div>
              <div className="space-y-2">
                {formData.specifications.map((spec, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400">{spec.label}</span>
                      <p className="text-sm font-bold text-slate-900">{spec.value}</p>
                    </div>
                    <button onClick={() => setFormData(prev => ({ ...prev, specifications: prev.specifications.filter((_, idx) => idx !== i) }))}>
                      <X size={16} className="text-slate-400 hover:text-rose-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'amenities' && (
          <Card className="p-6">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-6">Amenities</h3>
            <div className="flex gap-2 mb-4">
              <Input 
                placeholder="e.g. Swimming Pool" 
                value={newAmenity}
                onChange={e => setNewAmenity(e.target.value)}
              />
              <Button 
                variant="outline" 
                onClick={() => {
                  if (newAmenity) {
                    setFormData(prev => ({ ...prev, amenities: [...prev.amenities, newAmenity] }));
                    setNewAmenity('');
                  }
                }}
              >
                <Plus size={16} />
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {formData.amenities.map((amenity, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-xs font-bold text-slate-900">{amenity}</span>
                  <button onClick={() => setFormData(prev => ({ ...prev, amenities: prev.amenities.filter((_, idx) => idx !== i) }))}>
                    <X size={14} className="text-slate-400 hover:text-rose-500" />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'images' && (
          <Card className="p-6">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-6">Property Images</h3>
            <div className="mb-6">
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-200 rounded-xl hover:border-blue-500 transition-all cursor-pointer bg-slate-50 hover:bg-blue-50/50">
                <div className="flex flex-col items-center justify-center gap-2">
                  <ImageIcon size={32} className="text-slate-400" />
                  <p className="text-sm font-bold text-slate-600">Click to upload images</p>
                  <p className="text-[10px] text-slate-400 font-medium">PNG, JPG up to 10MB</p>
                </div>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageUpload}
                  disabled={uploadingImages}
                />
              </label>
            </div>

            {uploadingImages && <p className="text-center text-sm text-blue-600 mb-4">Uploading images...</p>}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {formData.images.map((img, i) => (
                <div key={i} className="relative group aspect-video rounded-lg overflow-hidden border border-slate-200">
                  <img src={img} className="w-full h-full object-cover" alt={`Property ${i + 1}`} />
                  <button 
                    onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}
                    className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'location' && (
          <Card className="p-6">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-6">Location & Map</h3>
            <div className="space-y-6">
              <Input 
                label="Google Maps Link" 
                placeholder="https://www.google.com/maps/embed?pb=..." 
                value={formData.mapLink}
                onChange={e => setFormData({...formData, mapLink: e.target.value})}
              />
              
              <div className="pt-6 border-t border-slate-100">
                <h4 className="text-sm font-black text-slate-900 uppercase mb-4">Around This Project (Nearby)</h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Input placeholder="Location Name" value={newNearby.name} onChange={e => setNewNearby({...newNearby, name: e.target.value})} />
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Type</label>
                    <select 
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      value={newNearby.type}
                      onChange={e => setNewNearby({...newNearby, type: e.target.value})}
                    >
                      {nearbyTypes.map(t => <option key={t.label} value={t.label}>{t.label}</option>)}
                    </select>
                  </div>
                  <Input placeholder="Distance" value={newNearby.distance} onChange={e => setNewNearby({...newNearby, distance: e.target.value})} />
                  <div className="flex gap-2">
                    <Input placeholder="Time" value={newNearby.time} onChange={e => setNewNearby({...newNearby, time: e.target.value})} />
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        if (newNearby.name && newNearby.distance && newNearby.time) {
                          setFormData(prev => ({ ...prev, nearbyLocations: [...prev.nearbyLocations, newNearby] }));
                          setNewNearby({ name: '', type: 'School', distance: '', time: '' });
                        }
                      }}
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {formData.nearbyLocations.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                          {nearbyTypes.find(t => t.label === item.type)?.icon}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{item.name}</p>
                          <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">{item.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs font-black text-slate-900">{item.time}</p>
                          <p className="text-[9px] text-slate-400 font-medium">({item.distance})</p>
                        </div>
                        <button onClick={() => setFormData(prev => ({ ...prev, nearbyLocations: prev.nearbyLocations.filter((_, idx) => idx !== i) }))}>
                          <X size={14} className="text-slate-400 hover:text-rose-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'attachments' && (
          <Card className="p-6">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-6">Documents & Attachments</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <Input placeholder="File name" value={newAttachment.name} onChange={e => setNewAttachment({...newAttachment, name: e.target.value})} />
              <Input placeholder="URL" value={newAttachment.url} onChange={e => setNewAttachment({...newAttachment, url: e.target.value})} />
              <div className="flex gap-2">
                <Input placeholder="Size" value={newAttachment.size} onChange={e => setNewAttachment({...newAttachment, size: e.target.value})} />
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (newAttachment.name && newAttachment.url) {
                      setFormData(prev => ({ ...prev, attachments: [...prev.attachments, newAttachment] }));
                      setNewAttachment({ name: '', url: '', size: '' });
                    }
                  }}
                >
                  <Plus size={16} />
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              {formData.attachments.map((att, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <FileText size={18} className="text-blue-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{att.name}</p>
                      <p className="text-[9px] text-slate-400 font-medium">{att.size}</p>
                    </div>
                  </div>
                  <button onClick={() => setFormData(prev => ({ ...prev, attachments: prev.attachments.filter((_, idx) => idx !== i) }))}>
                    <X size={16} className="text-slate-400 hover:text-rose-500" />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
