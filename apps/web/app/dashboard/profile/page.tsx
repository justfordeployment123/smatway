'use client';

import { useState, useEffect } from 'react';
import { UserIcon, PhoneIcon, MailIcon, CameraIcon } from '@/app/dashboard/_Components/Icons';
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  addEmergencyContact,
  deleteEmergencyContact,
} from '@/lib/api';
import type { ProfileResponse } from '@/types/profile.types';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [profileData, setProfileData] = useState<ProfileResponse | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [addingContact, setAddingContact] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', relation: 'family', phone: '' });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      const data = await getProfile();
      setProfileData(data);
      setFullName(data.user.name || '');
      setPhone(data.user.phoneNumber || '');
      setCountry(data.user.country || '');
      setBio(data.profile?.bio || '');
      setAvatarUrl(data.user.avatarUrl || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    try {
      setError(null);
      const { avatarUrl: url } = await uploadAvatar(file);
      setAvatarUrl(url);
      setSuccess('Avatar uploaded successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload avatar');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      await updateProfile({
        name: fullName,
        phoneNumber: phone,
        country,
        bio,
        avatarUrl: avatarUrl || undefined,
      });

      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(null), 3000);
      await loadProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddContact(e: React.FormEvent) {
    e.preventDefault();
    try {
      setError(null);
      await addEmergencyContact(contactForm);
      setSuccess('Emergency contact added');
      setContactForm({ name: '', relation: 'family', phone: '' });
      setAddingContact(false);
      setTimeout(() => setSuccess(null), 3000);
      await loadProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add contact');
    }
  }

  async function handleDeleteContact(contactId: string) {
    if (!confirm('Delete this emergency contact?')) return;
    try {
      setError(null);
      await deleteEmergencyContact(contactId);
      setSuccess('Contact deleted');
      setTimeout(() => setSuccess(null), 3000);
      await loadProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete contact');
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">My Profile</h1>
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">My Profile</h1>
        <p className="text-red-600">Failed to load profile</p>
      </div>
    );
  }

  const initial = fullName.charAt(0).toUpperCase() || 'U';
  const roleTag =
    profileData.user.accountType === 'TRANSPORTER'
      ? 'text-blue-700 bg-blue-50 border border-blue-300'
      : 'text-emerald-700 bg-emerald-50 border border-emerald-300';
  const roleLabel = profileData.user.accountType === 'TRANSPORTER' ? 'Transporter' : 'Traveler';

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">My Profile</h1>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-lg">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-300 text-green-700 rounded-lg">{success}</div>}

      <div className="bg-white rounded-lg border border-[#f0f0f0] p-6 mb-6">
        <div className="flex items-center space-x-6 mb-8">
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                className="rounded-full object-cover"
                style={{ width: 100, height: 100 }}
              />
            ) : (
              <div
                className="rounded-full bg-linear-to-r from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold"
                style={{ width: 100, height: 100, fontSize: 18 }}
              >
                {initial}
              </div>
            )}
            <label className="absolute bottom-0 right-0 w-7 h-7 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-lg hover:bg-slate-50 transition-colors cursor-pointer">
              <CameraIcon className="w-3 h-3" />
              <input type="file" accept="image/*" onChange={handleAvatarUpload} hidden />
            </label>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{fullName || 'User'}</h2>
            <span className={`inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded ${roleTag}`}>
              {roleLabel}
            </span>
          </div>
        </div>

        <hr className="border-[#f0f0f0] mb-6" />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <span className="text-red-500 mr-1">*</span>Full Name
              </label>
              <div className="flex items-center border border-slate-300 rounded-lg px-3 py-2.5 focus-within:border-blue-500">
                <UserIcon className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="flex-1 ml-2 outline-none text-slate-900 text-sm bg-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <span className="text-red-500 mr-1">*</span>Phone Number
              </label>
              <div className="flex items-center border border-slate-300 rounded-lg px-3 py-2.5 focus-within:border-blue-500">
                <PhoneIcon className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+254 712 345 678"
                  className="flex-1 ml-2 outline-none text-slate-900 text-sm bg-transparent"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Country</label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="US"
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none text-slate-900 text-sm focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none text-slate-900 text-sm focus:border-blue-500"
            />
          </div>

          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 text-slate-600 mb-2">
              <MailIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Email</span>
            </div>
            <p className="text-slate-900">{profileData.user.email}</p>
            <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold px-6 py-2.5 rounded-lg disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Update Profile'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg border border-[#f0f0f0] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#f0f0f0]">
          <h2 className="text-base font-semibold text-slate-900">Emergency Contacts</h2>
        </div>
        <div className="p-6 space-y-4">
          {profileData.emergencyContacts.length === 0 ? (
            <p className="text-slate-500">No emergency contacts added</p>
          ) : (
            profileData.emergencyContacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <UserIcon className="w-4 h-4 text-slate-600" />
                    <span className="font-semibold text-slate-900">{contact.name}</span>
                    <span className="px-2 py-0.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded capitalize">
                      {contact.relation}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-600">
                    <PhoneIcon className="w-4 h-4 text-slate-600" />
                    <span className="text-sm">{contact.phone}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteContact(contact.id)}
                  className="px-3 py-1 text-sm text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            ))
          )}

          {!addingContact ? (
            <button
              onClick={() => setAddingContact(true)}
              className="mt-4 px-4 py-2 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded hover:bg-emerald-100"
            >
              + Add Emergency Contact
            </button>
          ) : (
            <form onSubmit={handleAddContact} className="mt-4 p-4 bg-slate-50 rounded-lg space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  placeholder="Contact name"
                  required
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Relation</label>
                <select
                  value={contactForm.relation}
                  onChange={(e) => setContactForm({ ...contactForm, relation: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm"
                >
                  <option value="family">Family</option>
                  <option value="friend">Friend</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  placeholder="+1234567890"
                  required
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-3 py-1.5 text-sm text-white bg-emerald-600 rounded hover:bg-emerald-700"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setAddingContact(false)}
                  className="flex-1 px-3 py-1.5 text-sm text-slate-700 bg-slate-200 rounded hover:bg-slate-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
