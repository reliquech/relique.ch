"use client";

import React from 'react';
import { Trash2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmModal({ isOpen, onClose, onConfirm }: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-surface border border-destructive/30 w-full max-w-sm rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-6 mx-auto">
          <Trash2 className="text-destructive w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-center text-white">Confirm Deletion</h3>
        <p className="text-gray-400 text-sm text-center mt-3 leading-relaxed">
          Are you sure? This action is irreversible and will be logged in the system audit trail.
        </p>
        <div className="flex gap-4 mt-8">
          <button
            onClick={onClose}
            className="flex-1 bg-white/5 border border-border py-3 rounded-xl font-bold text-sm text-gray-300 hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-destructive py-3 rounded-xl font-bold text-sm text-white hover:bg-destructive/90 transition-all shadow-lg shadow-destructive/20"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

