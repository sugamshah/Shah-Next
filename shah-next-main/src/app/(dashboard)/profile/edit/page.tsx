'use client';

import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { services } from '@/services/container';
import { Camera, Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function EditProfilePage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    handle: '',
    email: '',
    jgId: '',
    statusMessage: '',
    photoURL: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(prev => ({
        ...prev,
        name: profile.name || prev.name,
        handle: profile.handle || prev.handle,
        email: profile.email || prev.email,
        jgId: profile.jgId || prev.jgId,
        statusMessage: profile.statusMessage || prev.statusMessage,
        photoURL: profile.photoURL || prev.photoURL
      }));
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await services.user.updateUserProfile(user.uid, {
        name: formData.name,
        handle: formData.handle,
        statusMessage: formData.statusMessage
      });
      router.push('/home');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    setLoading(true);
    try {
      const url = await services.upload.uploadFile(file, `profiles/${user.uid}`);
      await services.user.updateUserProfile(user.uid, { photoURL: url });
      setFormData(prev => ({ ...prev, photoURL: url }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-10 max-w-2xl mx-auto">
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-[#1f1f1f]">
            <h2 className="text-xl font-bold text-white">Update your personal information</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div className="flex flex-col items-center sm:flex-row gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-[#141414] border-2 border-[#1f1f1f] overflow-hidden relative shadow-lg">
                  {formData.photoURL ? (
                    <Image src={formData.photoURL} alt="Profile" fill className="object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-[#333]">
                      {formData.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                  <Camera size={24} className="text-white" />
                  <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} disabled={loading} />
                </label>
              </div>
              <div className="flex-1 space-y-2 text-center sm:text-left">
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-full text-sm font-bold cursor-pointer transition-all active:scale-95">
                  <Camera size={16} />
                  Change Photo
                  <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} disabled={loading} />
                </label>
                <p className="text-[#666] text-xs font-medium">JPG, PNG or GIF</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#888888]">Display Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your name"
                  className="w-full bg-[#111111] border border-[#1f1f1f] rounded-xl px-4 py-3.5 text-white placeholder-[#444] focus:border-[#6366f1]/50 focus:ring-1 focus:ring-[#6366f1]/50 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#888888]">Username / Handle</label>
                <input
                  type="text"
                  name="handle"
                  value={formData.handle}
                  onChange={handleChange}
                  placeholder="@username"
                  className="w-full bg-[#111111] border border-[#1f1f1f] rounded-xl px-4 py-3.5 text-white placeholder-[#444] focus:border-[#6366f1]/50 focus:ring-1 focus:ring-[#6366f1]/50 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#888888]">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  readOnly
                  disabled
                  className="w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl px-4 py-3.5 text-[#444] cursor-not-allowed outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#888888]">JG ID</label>
                <input
                  type="text"
                  value={formData.jgId}
                  readOnly
                  disabled
                  className="w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl px-4 py-3.5 text-[#444] cursor-not-allowed outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#888888]">Status Message</label>
                <textarea
                  name="statusMessage"
                  value={formData.statusMessage}
                  onChange={handleChange}
                  placeholder="What's on your mind?"
                  rows={3}
                  className="w-full bg-[#111111] border border-[#1f1f1f] rounded-xl px-4 py-3.5 text-white placeholder-[#444] focus:border-[#6366f1]/50 focus:ring-1 focus:ring-[#6366f1]/50 outline-none transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 bg-[#141414] hover:bg-[#1a1a1a] text-[#888888] font-bold py-3.5 rounded-xl transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#6366f1]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
