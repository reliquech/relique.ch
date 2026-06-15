"use client";

import React from 'react';
import { User, Lock } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <h2 className="text-3xl font-bold tracking-tight text-white">System Settings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
            <User className="w-5 h-5 text-primary" /> Admin Profile
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-gray-500 mb-1.5 block tracking-widest">Display Name</label>
              <input
                type="text"
                defaultValue="Relique Admin"
                className="w-full bg-white/5 border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-primary focus:outline-none transition-all"
              />
            </div>
            <button className="bg-primary px-4 py-2 rounded-lg text-sm font-bold w-full hover:bg-primary/80 transition-all shadow-lg shadow-primary/10 text-white">
              Update Profile
            </button>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
            <Lock className="w-5 h-5 text-accent" /> Security
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-gray-500 mb-1.5 block tracking-widest">New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-white/5 border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-accent focus:outline-none transition-all placeholder:text-gray-500"
              />
            </div>
            <button className="bg-white/10 border border-border px-4 py-2 rounded-lg text-sm font-bold w-full hover:bg-white/20 transition-all text-white">
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

